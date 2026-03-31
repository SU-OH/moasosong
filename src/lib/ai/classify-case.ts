import Anthropic from "@anthropic-ai/sdk";
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  buildClassificationPrompt,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type ClassificationResult = {
  fraud_type: string;
  fraud_pattern: string;
  summary: string;
  modus_operandi: string;
  suspect_fingerprint: string;
  suspect_identifiers: {
    normalized_name: string | null;
    bank_accounts: string[];
    phone_numbers: string[];
    platforms: string[];
    online_handles: string[];
  };
  evidence_strength: "strong" | "moderate" | "weak";
  key_features: string[];
  recommended_legal_approach: string;
};

export async function classifyFraudCase(fraudCase: {
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
}): Promise<ClassificationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildClassificationPrompt(fraudCase),
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // JSON 블록 추출 (```json ... ``` 형태도 처리)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 응답에서 JSON을 파싱할 수 없습니다");
  }

  return JSON.parse(jsonMatch[0]) as ClassificationResult;
}
