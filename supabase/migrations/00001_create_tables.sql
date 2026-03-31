-- 모아소송 데이터베이스 스키마

-- 1. profiles 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('victim', 'lawyer')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bar_number TEXT,
  law_firm TEXT,
  specializations TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. fraud_cases 테이블
CREATE TABLE fraud_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  fraud_type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_lost BIGINT NOT NULL,
  incident_date DATE NOT NULL,
  suspect_name TEXT,
  suspect_contact TEXT,
  suspect_account TEXT,
  suspect_bank TEXT,
  suspect_platform TEXT,
  suspect_description TEXT,
  evidence_urls TEXT[],
  evidence_description TEXT,
  police_report_filed BOOLEAN DEFAULT FALSE,
  police_report_number TEXT,
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted','analyzing','classified','matched','in_progress','resolved')),
  ai_classification JSONB,
  ai_summary TEXT,
  ai_fraud_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. case_categories 테이블 (AI 그룹)
CREATE TABLE case_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fraud_type TEXT NOT NULL,
  fraud_pattern TEXT,
  total_cases INTEGER DEFAULT 0,
  total_amount BIGINT DEFAULT 0,
  status TEXT DEFAULT 'collecting'
    CHECK (status IN ('collecting','published','assigned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. case_matches 테이블
CREATE TABLE case_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES case_categories(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  match_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, category_id)
);

-- 5. lawyer_interests 테이블
CREATE TABLE lawyer_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES case_categories(id) ON DELETE CASCADE,
  message TEXT,
  fee_structure TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. messages 테이블
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_id UUID NOT NULL REFERENCES lawyer_interests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_fraud_cases_victim_id ON fraud_cases(victim_id);
CREATE INDEX idx_fraud_cases_status ON fraud_cases(status);
CREATE INDEX idx_fraud_cases_fraud_type ON fraud_cases(fraud_type);
CREATE INDEX idx_case_matches_case_id ON case_matches(case_id);
CREATE INDEX idx_case_matches_category_id ON case_matches(category_id);
CREATE INDEX idx_lawyer_interests_lawyer_id ON lawyer_interests(lawyer_id);
CREATE INDEX idx_lawyer_interests_category_id ON lawyer_interests(category_id);
CREATE INDEX idx_messages_interest_id ON messages(interest_id);
CREATE INDEX idx_case_categories_status ON case_categories(status);

-- 자동 updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fraud_cases_updated_at
  BEFORE UPDATE ON fraud_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 신규 유저 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'victim'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
