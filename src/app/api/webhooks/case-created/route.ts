import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyFraudCase } from "@/lib/ai/classify-case";
import { findAndGroupSimilarCases } from "@/lib/ai/find-similar";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = createAdminClient();

  let caseId: string;
  try {
    const body = await request.json();
    caseId = body.caseId;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  // 사건 조회
  const { data: fraudCase, error: fetchError } = await supabase
    .from("fraud_cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (fetchError || !fraudCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // 이미 분석된 사건은 스킵
  if (fraudCase.status !== "submitted") {
    return NextResponse.json({ message: "Already processed" });
  }

  // 상태 -> analyzing
  await supabase
    .from("fraud_cases")
    .update({ status: "analyzing" })
    .eq("id", caseId);

  try {
    // 1. Claude로 분류
    const classification = await classifyFraudCase({
      title: fraudCase.title,
      fraud_type: fraudCase.fraud_type,
      description: fraudCase.description,
      amount_lost: Number(fraudCase.amount_lost),
      incident_date: fraudCase.incident_date,
      suspect_name: fraudCase.suspect_name,
      suspect_contact: fraudCase.suspect_contact,
      suspect_account: fraudCase.suspect_account,
      suspect_bank: fraudCase.suspect_bank,
      suspect_platform: fraudCase.suspect_platform,
      suspect_description: fraudCase.suspect_description,
      evidence_description: fraudCase.evidence_description,
      police_report_filed: fraudCase.police_report_filed,
    });

    // 2. 분류 결과 저장
    await supabase
      .from("fraud_cases")
      .update({
        ai_classification: classification as unknown as Record<string, unknown>,
        ai_summary: classification.summary,
        ai_fraud_pattern: classification.fraud_pattern,
        status: "classified",
      })
      .eq("id", caseId);

    // 3. 유사 사건 그룹핑
    await findAndGroupSimilarCases(
      caseId,
      classification,
      Number(fraudCase.amount_lost)
    );

    // 4. 최종 상태 업데이트
    await supabase
      .from("fraud_cases")
      .update({ status: "matched" })
      .eq("id", caseId);

    return NextResponse.json({ success: true, classification });
  } catch (error) {
    console.error("AI pipeline error:", error);

    // 실패 시 rollback
    await supabase
      .from("fraud_cases")
      .update({ status: "submitted" })
      .eq("id", caseId);

    return NextResponse.json(
      { error: "AI pipeline failed", details: String(error) },
      { status: 500 }
    );
  }
}
