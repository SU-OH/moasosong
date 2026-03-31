# 모아소송 - 소액 사기 피해 통합 플랫폼

## 비전

소액 사기 피해자들이 시간/비용 문제로 피해금을 회수하지 못하는 문제를 해결한다.
소액 사기 사례를 취합하고, AI로 유사 사기를 분류/동일범을 식별하여,
묶인 사건을 변호사에게 인계하는 플랫폼.

## 핵심 흐름

```
소액사기 피해 접수 → AI 분류(Claude API) → 유사사기/동일범 그룹핑 → 변호사 인계
```

## 사용자 역할

### 피해자 (victim)
- 사기 피해 사례 접수 (4단계 폼)
- 사건 상태 추적
- AI 분석 결과 확인 (유사 사건 그룹)
- 변호사와 메시지 소통

### 변호사 (lawyer)
- AI로 그룹핑된 사건 조회
- 관심 사건 그룹에 참여 의사 표명
- 피해자와 메시지 소통
- 사건 통계 대시보드

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router, TypeScript) |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 데이터베이스 | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI | Claude API (Sonnet) - 사기 분류 및 유사도 분석 |
| 배포 | Vercel |
| 유효성 검증 | Zod + React Hook Form |
| 아이콘 | Lucide React |

## 디자인 시스템

### 컬러 팔레트
- Primary: Navy `#1E3A8A` (신뢰, 전문성)
- Accent: Gold `#B45309` (강조, 품질)
- Background: Slate `#F8FAFC`
- Error: Red `#DC2626`
- Success: Green `#16A34A`

### 타이포그래피
- 헤딩: EB Garamond (serif) — 권위감
- 바디: Lato (sans-serif) — 가독성

### UI 원칙
- 모바일 퍼스트 (390px 기준)
- 하단 탭 네비게이션 (앱 느낌)
- Trust & Authority + Minimalism
- 터치 타겟 최소 44x44px
- SVG 아이콘만 사용 (이모지 금지)

## 데이터베이스 스키마

### profiles
- id (UUID, PK, FK → auth.users)
- role: 'victim' | 'lawyer'
- full_name, phone, avatar_url
- bar_number, law_firm, specializations (변호사 전용)
- is_verified, created_at, updated_at

### fraud_cases
- id (UUID, PK)
- victim_id (FK → profiles)
- title, fraud_type, description, amount_lost, incident_date
- suspect_name, suspect_contact, suspect_account, suspect_bank, suspect_platform
- evidence_urls[], evidence_description
- police_report_filed, police_report_number
- status: submitted → analyzing → classified → matched → in_progress → resolved
- ai_classification (JSONB), ai_summary, ai_fraud_pattern
- created_at, updated_at

### case_categories (AI 그룹)
- id (UUID, PK)
- name, description, fraud_type, fraud_pattern
- total_cases, total_amount
- status: collecting → published → assigned
- created_at

### case_matches
- id (UUID, PK)
- case_id (FK → fraud_cases)
- category_id (FK → case_categories)
- similarity_score, match_reason
- created_at

### lawyer_interests
- id (UUID, PK)
- lawyer_id (FK → profiles)
- category_id (FK → case_categories)
- message, fee_structure
- status: pending → accepted → rejected
- created_at

### messages
- id (UUID, PK)
- interest_id (FK → lawyer_interests)
- sender_id (FK → profiles)
- content
- created_at

## AI 파이프라인

### 방식: Claude API Only
1. **분류**: Claude Sonnet으로 사기 유형, 패턴, 수법 분석, suspect_fingerprint 생성
2. **동일범 식별**: 계좌번호, 전화번호, 이름 등 fingerprint 정확 일치 매칭
3. **유사 패턴**: Claude에게 기존 카테고리 목록과 비교 요청
4. **자동 공개**: 3건 이상 그룹 → published → 변호사에게 공개

### 사기 유형 분류
- 투자 사기 (가상화폐, 주식, 리딩방)
- 쇼핑 사기 (중고거래, 미배송)
- 대출 사기 (선입금 요구)
- 로맨스 스캠
- 보이스 피싱
- 기타

## 화면 목록

| 경로 | 역할 | 설명 |
|------|------|------|
| `/` | 공개 | 랜딩 페이지 |
| `/login` | 공개 | 로그인 |
| `/signup` | 공개 | 역할 선택 + 회원가입 |
| `/victim/dashboard` | 피해자 | 대시보드 |
| `/victim/cases` | 피해자 | 내 사건 목록 |
| `/victim/cases/new` | 피해자 | 사건 접수 (4단계 폼) |
| `/victim/cases/[id]` | 피해자 | 사건 상세 + AI 결과 |
| `/victim/messages` | 피해자 | 변호사와 대화 |
| `/lawyer/dashboard` | 변호사 | 대시보드 |
| `/lawyer/cases` | 변호사 | AI 그룹 사건 브라우저 |
| `/lawyer/cases/[id]` | 변호사 | 그룹 상세 |
| `/lawyer/messages` | 변호사 | 피해자와 대화 |

## 구현 순서

### Phase 1 — 기반 설정
- Next.js 초기화, 패키지 설치, Tailwind 디자인 토큰
- Supabase 연결, DB 마이그레이션
- 인증 (middleware, login, signup)
- 대시보드 레이아웃 (모바일 하단탭)

### Phase 2 — 피해자 플로우
- 피해자 대시보드, 사건 접수 폼, 사건 목록/상세

### Phase 3 — AI 파이프라인
- Claude 분류, fingerprint 매칭, 카테고리 배정, AI 결과 UI

### Phase 4 — 변호사 플로우
- 변호사 대시보드, 사건 그룹 브라우저, 관심 표명

### Phase 5 — 메시징 + 완성
- 실시간 메시징 (Supabase Realtime)
- 랜딩 페이지, 반응형 QA, Vercel 배포
