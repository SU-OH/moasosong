export const CLASSIFICATION_SYSTEM_PROMPT = `당신은 한국 사기 사건 분석 전문가입니다.
피해자가 제출한 사기 신고를 분석하여 구조화된 정보를 추출합니다.
반드시 한국어로, 유효한 JSON만 응답하세요.

작업:
1. 사기 유형과 구체적인 패턴 분류
2. 가해자 식별 정보 추출 및 정규화
3. 사기 수법 요약
4. 증거 강도 평가
5. 동일범 추적을 위한 suspect_fingerprint 생성

JSON 스키마:
{
  "fraud_type": string,
  "fraud_pattern": string,
  "summary": string,
  "modus_operandi": string,
  "suspect_fingerprint": string,
  "suspect_identifiers": {
    "normalized_name": string | null,
    "bank_accounts": string[],
    "phone_numbers": string[],
    "platforms": string[],
    "online_handles": string[]
  },
  "evidence_strength": "strong" | "moderate" | "weak",
  "key_features": string[],
  "recommended_legal_approach": string
}

suspect_fingerprint 생성 규칙:
- 계좌번호, 전화번호, 이름을 정규화하여 결합
- 형식: "account:{계좌번호}|phone:{전화번호}|name:{이름}"
- 없는 정보는 빈 문자열로: "account:|phone:010-1234-5678|name:김OO"
- 계좌번호에서 하이픈 제거, 전화번호는 하이픈 포함 형식으로 통일`;

export function buildClassificationPrompt(fraudCase: {
  title: string;
  fraud_type: string;
  description: string;
  amount_lost: number;
  incident_date: string;
  suspect_name?: string | null;
  suspect_contact?: string | null;
  suspect_account?: string | null;
  suspect_bank?: string | null;
  suspect_platform?: string | null;
  suspect_description?: string | null;
  evidence_description?: string | null;
  police_report_filed?: boolean;
}): string {
  return `다음 사기 피해 사건을 분석해주세요:

제목: ${fraudCase.title}
사기 유형: ${fraudCase.fraud_type}
설명: ${fraudCase.description}
피해 금액: ${fraudCase.amount_lost.toLocaleString()}원
사건 날짜: ${fraudCase.incident_date}

의심 가해자 정보:
- 이름: ${fraudCase.suspect_name || '미상'}
- 연락처: ${fraudCase.suspect_contact || '미상'}
- 계좌번호: ${fraudCase.suspect_account || '미상'}
- 은행: ${fraudCase.suspect_bank || '미상'}
- 플랫폼: ${fraudCase.suspect_platform || '미상'}
- 기타 특징: ${fraudCase.suspect_description || '없음'}

증거 설명: ${fraudCase.evidence_description || '없음'}
경찰 신고 여부: ${fraudCase.police_report_filed ? '예' : '아니오'}`;
}

export const CATEGORY_MATCH_SYSTEM_PROMPT = `당신은 사기 사건 분류 전문가입니다.
새로운 사기 사건의 분류 결과를 기존 카테고리 목록과 비교하여,
가장 유사한 카테고리의 ID를 반환하세요.

유사 판단 기준 (우선순위):
1. 동일 가해자 (suspect_fingerprint 일치)
2. 동일 사기 패턴 + 유사 플랫폼
3. 동일 사기 유형 + 유사 수법

반드시 JSON만 응답하세요:
{
  "matched_category_id": string | null,
  "confidence": number,
  "reason": string
}

매칭되는 카테고리가 없으면 matched_category_id를 null로 반환하세요.`;
