-- handle_new_user 트리거 함수 수정: search_path 설정으로 RLS 우회
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'victim'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- profiles INSERT 정책 추가
CREATE POLICY "본인 프로필 생성" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
