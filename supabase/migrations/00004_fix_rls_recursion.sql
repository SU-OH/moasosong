-- RLS 무한 재귀 수정
-- 문제: fraud_cases 정책 → case_matches 조회 → case_matches 정책 → fraud_cases 조회 → 무한 루프
-- 해결: SECURITY DEFINER 함수로 RLS를 우회하여 재귀 체인을 끊음

-- 1) 기존 문제 있는 정책 삭제
DROP POLICY IF EXISTS "변호사 매칭된 사건 조회" ON fraud_cases;
DROP POLICY IF EXISTS "본인 사건 매칭 조회" ON case_matches;
DROP POLICY IF EXISTS "변호사 공개 매칭 조회" ON case_matches;
DROP POLICY IF EXISTS "피해자 관련 관심 조회" ON lawyer_interests;
DROP POLICY IF EXISTS "참여자 메시지 조회" ON messages;
DROP POLICY IF EXISTS "참여자 메시지 전송" ON messages;

-- 2) SECURITY DEFINER 헬퍼 함수 (RLS 우회)

-- 사용자가 변호사인지 확인
CREATE OR REPLACE FUNCTION is_lawyer(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'lawyer'
  );
$$;

-- fraud_case가 공개된 카테고리에 매칭되어 있는지 확인
CREATE OR REPLACE FUNCTION case_in_published_category(target_case_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM case_matches cm
    JOIN case_categories cc ON cm.category_id = cc.id
    WHERE cm.case_id = target_case_id AND cc.status = 'published'
  );
$$;

-- 특정 카테고리에 해당 피해자의 사건이 포함되어 있는지 확인
CREATE OR REPLACE FUNCTION victim_has_case_in_category(target_category_id uuid, victim_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM case_matches cm
    JOIN fraud_cases fc ON cm.case_id = fc.id
    WHERE cm.category_id = target_category_id
    AND fc.victim_id = victim_user_id
  );
$$;

-- 사용자가 interest에 참여 가능한지 확인 (변호사 또는 관련 피해자)
CREATE OR REPLACE FUNCTION can_access_interest(target_interest_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lawyer_interests li
    WHERE li.id = target_interest_id
    AND (
      li.lawyer_id = user_id
      OR victim_has_case_in_category(li.category_id, user_id)
    )
  );
$$;

-- 3) 재생성된 정책 (헬퍼 함수 사용으로 재귀 없음)

-- fraud_cases: 변호사가 공개 카테고리에 매칭된 사건 조회
CREATE POLICY "변호사 매칭된 사건 조회" ON fraud_cases
  FOR SELECT USING (
    is_lawyer(auth.uid()) AND case_in_published_category(id)
  );

-- case_matches: 피해자 본인 사건 매칭 조회
CREATE POLICY "본인 사건 매칭 조회" ON case_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fraud_cases
      WHERE id = case_matches.case_id
      AND victim_id = auth.uid()
    )
  );

-- case_matches: 변호사 공개 매칭 조회
CREATE POLICY "변호사 공개 매칭 조회" ON case_matches
  FOR SELECT USING (
    is_lawyer(auth.uid())
    AND EXISTS (
      SELECT 1 FROM case_categories
      WHERE id = case_matches.category_id AND status = 'published'
    )
  );

-- lawyer_interests: 피해자 관련 관심 조회
CREATE POLICY "피해자 관련 관심 조회" ON lawyer_interests
  FOR SELECT USING (
    victim_has_case_in_category(category_id, auth.uid())
  );

-- messages: 참여자 메시지 조회
CREATE POLICY "참여자 메시지 조회" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR can_access_interest(interest_id, auth.uid())
  );

-- messages: 참여자 메시지 전송
CREATE POLICY "참여자 메시지 전송" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM lawyer_interests li
      WHERE li.id = messages.interest_id
      AND li.status = 'accepted'
    )
    AND can_access_interest(interest_id, auth.uid())
  );
