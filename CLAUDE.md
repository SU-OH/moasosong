@AGENTS.md

# 모아소송 개발 규칙

## 프로젝트 개요
소액 사기 피해자-변호사 연결 플랫폼. Next.js 14 + Supabase + Claude API.

## 기술 스택
- Next.js 14+ App Router, TypeScript strict mode
- Tailwind CSS + shadcn/ui (컴포넌트)
- Supabase (DB, Auth, Storage, Realtime)
- Claude API (@anthropic-ai/sdk) — 사기 분류
- Zod + React Hook Form — 폼 유효성
- Lucide React — 아이콘

## 폴더 구조 규칙

```
src/
├── app/              # 라우팅 (App Router)
│   ├── (auth)/       # 인증 페이지 그룹
│   ├── (dashboard)/  # 대시보드 그룹 (victim/, lawyer/)
│   └── api/          # API Route Handlers
├── components/
│   ├── ui/           # shadcn/ui 원본 (수정 금지)
│   ├── auth/         # 인증 관련
│   ├── cases/        # 사건 관련
│   ├── dashboard/    # 대시보드 공통
│   └── lawyer/       # 변호사 전용
├── lib/
│   ├── supabase/     # client.ts, server.ts, admin.ts
│   ├── ai/           # prompts.ts, classify-case.ts, find-similar.ts
│   ├── utils.ts      # cn() 등 유틸리티
│   └── validations.ts # Zod 스키마 모음
├── hooks/            # 커스텀 훅
├── types/            # TypeScript 타입 (database.ts 등)
└── middleware.ts     # 인증 + 역할 기반 라우트 보호
```

## 코딩 컨벤션

### TypeScript
- strict mode 필수
- `any` 사용 금지, 타입 명시
- Supabase 자동 생성 타입 사용 (`types/database.ts`)
- 인터페이스보다 `type` 선호 (일관성)

### 컴포넌트
- Server Component 기본, 필요 시에만 `'use client'`
- 파일명: kebab-case (`case-card.tsx`)
- 컴포넌트명: PascalCase (`CaseCard`)
- props 타입은 컴포넌트 파일 내 정의
- 한 파일에 하나의 export default 컴포넌트

### 스타일링
- Tailwind 유틸리티 클래스 사용
- 인라인 스타일 금지
- `cn()` 유틸리티로 조건부 클래스 병합
- 디자인 토큰: navy, gold 커스텀 컬러 사용
- 하드코딩 hex 금지, Tailwind 토큰만 사용

### 네이밍
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입: PascalCase
- 파일: kebab-case
- DB 컬럼: snake_case

## Supabase 규칙

### 클라이언트 사용
- Client Component → `lib/supabase/client.ts` (createBrowserClient)
- Server Component / Route Handler → `lib/supabase/server.ts` (createServerClient)
- AI 파이프라인 (service_role) → `lib/supabase/admin.ts`
- service_role 키는 서버에서만, 절대 클라이언트 노출 금지

### RLS (Row Level Security)
- 모든 테이블에 RLS 활성화 필수
- victim: 자기 데이터만 접근
- lawyer: published 카테고리만 조회, 개별 사건은 익명화
- 새 테이블 생성 시 RLS 정책 반드시 함께 작성

### Auth
- `supabase.auth.getUser()` 사용 (getSession 금지 - 보안)
- middleware.ts에서 토큰 갱신 처리
- 역할 정보는 profiles 테이블에서 조회

## AI 통합 규칙

### Claude API
- 모델: claude-sonnet-4-20250514 (비용 효율)
- 프롬프트는 `lib/ai/prompts.ts`에 중앙 관리
- JSON 응답 파싱 시 try-catch 필수
- API 키는 환경변수 (`ANTHROPIC_API_KEY`), 서버 전용

### 분류 파이프라인
- 비동기 처리 (사용자 대기 없음)
- 실패 시 status를 'submitted'로 롤백
- suspect_fingerprint: `account:{계좌}|phone:{전화}|name:{이름}` 형식

## 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용
ANTHROPIC_API_KEY=                # 서버 전용
NEXT_PUBLIC_APP_URL=
```
- `NEXT_PUBLIC_` 접두사 = 클라이언트 노출 가능
- 그 외 = 서버 전용, 절대 클라이언트에서 import 금지

## 디자인 규칙

### 컬러
- Primary: `navy-700` (#1E3A8A)
- Accent: `gold-600` (#B45309)
- Background: `slate-50` (#F8FAFC)
- Text: `navy-900` (#0F1F4D)

### 타이포그래피
- 헤딩: `font-heading` (EB Garamond)
- 바디: `font-body` (Lato)
- 최소 본문 크기: 16px

### 레이아웃
- 모바일 퍼스트 (390px → 768px → 1024px → 1440px)
- 대시보드: 하단 4탭 네비게이션 (홈, 사건, 메시지, 프로필)
- 터치 타겟 최소 44x44px
- 4px/8px 간격 시스템

### 접근성
- 명암비 4.5:1 이상
- 포커스 링 표시
- aria-label 필수 (아이콘 버튼)
- 시맨틱 HTML 사용

## 보안 규칙
- 환경변수 .env.local에만 저장, .gitignore에 포함
- SQL injection 방지: Supabase 클라이언트 사용 (raw query 금지)
- XSS 방지: 사용자 입력 이스케이프
- 파일 업로드: 허용 타입/크기 제한

## Git 규칙
- 커밋 메시지: 한글, 명령형 (`feat: 사건 접수 폼 구현`)
- 브랜치: feature/기능명, fix/버그명
- .env 파일 절대 커밋 금지

## 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사
