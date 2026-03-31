-- RLS (Row Level Security) 정책

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 프로필 조회" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "본인 프로필 수정" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "변호사 프로필 공개 조회" ON profiles
  FOR SELECT USING (role = 'lawyer' AND is_verified = TRUE);

-- fraud_cases
ALTER TABLE fraud_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "피해자 본인 사건 조회" ON fraud_cases
  FOR SELECT USING (auth.uid() = victim_id);

CREATE POLICY "피해자 본인 사건 생성" ON fraud_cases
  FOR INSERT WITH CHECK (auth.uid() = victim_id);

CREATE POLICY "피해자 본인 사건 수정" ON fraud_cases
  FOR UPDATE USING (auth.uid() = victim_id);

CREATE POLICY "변호사 매칭된 사건 조회" ON fraud_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer'
    )
    AND EXISTS (
      SELECT 1 FROM case_matches cm
      JOIN case_categories cc ON cm.category_id = cc.id
      WHERE cm.case_id = fraud_cases.id AND cc.status = 'published'
    )
  );

-- case_categories
ALTER TABLE case_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개된 카테고리 조회" ON case_categories
  FOR SELECT USING (
    status = 'published'
    OR status = 'assigned'
  );

-- case_matches
ALTER TABLE case_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 사건 매칭 조회" ON case_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fraud_cases WHERE id = case_matches.case_id AND victim_id = auth.uid()
    )
  );

CREATE POLICY "변호사 공개 매칭 조회" ON case_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer'
    )
    AND EXISTS (
      SELECT 1 FROM case_categories WHERE id = case_matches.category_id AND status = 'published'
    )
  );

-- lawyer_interests
ALTER TABLE lawyer_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "변호사 본인 관심 조회" ON lawyer_interests
  FOR SELECT USING (auth.uid() = lawyer_id);

CREATE POLICY "변호사 관심 표명" ON lawyer_interests
  FOR INSERT WITH CHECK (
    auth.uid() = lawyer_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer'
    )
  );

CREATE POLICY "피해자 관련 관심 조회" ON lawyer_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM case_matches cm
      JOIN fraud_cases fc ON cm.case_id = fc.id
      WHERE cm.category_id = lawyer_interests.category_id
      AND fc.victim_id = auth.uid()
    )
  );

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "참여자 메시지 조회" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM lawyer_interests li
      WHERE li.id = messages.interest_id
      AND (
        li.lawyer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM case_matches cm
          JOIN fraud_cases fc ON cm.case_id = fc.id
          WHERE cm.category_id = li.category_id
          AND fc.victim_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "참여자 메시지 전송" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM lawyer_interests li
      WHERE li.id = messages.interest_id
      AND li.status = 'accepted'
      AND (
        li.lawyer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM case_matches cm
          JOIN fraud_cases fc ON cm.case_id = fc.id
          WHERE cm.category_id = li.category_id
          AND fc.victim_id = auth.uid()
        )
      )
    )
  );

-- Realtime 활성화 (메시지용)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
