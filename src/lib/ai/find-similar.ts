import { createAdminClient } from "@/lib/supabase/admin";
import type { ClassificationResult } from "./classify-case";

/**
 * 동일범 식별 (fingerprint 매칭) + 유사 패턴 그룹핑
 */
export async function findAndGroupSimilarCases(
  caseId: string,
  classification: ClassificationResult,
  amountLost: number
) {
  const supabase = createAdminClient();

  // 1. suspect_fingerprint로 동일범 매칭
  const fingerprint = classification.suspect_fingerprint;
  const fingerprintParts = parseFingerprint(fingerprint);

  let matchedCategoryId: string | null = null;

  // 계좌번호 또는 전화번호로 기존 사건 검색
  if (fingerprintParts.account || fingerprintParts.phone) {
    const { data: existingCases } = await supabase
      .from("fraud_cases")
      .select("id, ai_classification")
      .neq("id", caseId)
      .not("ai_classification", "is", null);

    if (existingCases) {
      for (const existing of existingCases) {
        const existingClassification = existing.ai_classification as Record<
          string,
          unknown
        >;
        const existingFp = existingClassification?.suspect_fingerprint as
          | string
          | undefined;
        if (!existingFp) continue;

        const existingParts = parseFingerprint(existingFp);

        // 계좌번호 일치
        if (
          fingerprintParts.account &&
          existingParts.account &&
          fingerprintParts.account === existingParts.account
        ) {
          // 이 사건이 속한 카테고리 찾기
          const { data: match } = await supabase
            .from("case_matches")
            .select("category_id")
            .eq("case_id", existing.id)
            .limit(1)
            .single();

          if (match) {
            matchedCategoryId = match.category_id;
            break;
          }
        }

        // 전화번호 일치
        if (
          !matchedCategoryId &&
          fingerprintParts.phone &&
          existingParts.phone &&
          fingerprintParts.phone === existingParts.phone
        ) {
          const { data: match } = await supabase
            .from("case_matches")
            .select("category_id")
            .eq("case_id", existing.id)
            .limit(1)
            .single();

          if (match) {
            matchedCategoryId = match.category_id;
            break;
          }
        }
      }
    }
  }

  // 2. fingerprint로 못 찾으면, 같은 fraud_pattern 카테고리 검색
  if (!matchedCategoryId) {
    const { data: patternCategories } = await supabase
      .from("case_categories")
      .select("id, fraud_pattern")
      .eq("fraud_type", classification.fraud_type)
      .in("status", ["collecting", "published"]);

    if (patternCategories) {
      for (const cat of patternCategories) {
        if (
          cat.fraud_pattern &&
          classification.fraud_pattern &&
          cat.fraud_pattern === classification.fraud_pattern
        ) {
          matchedCategoryId = cat.id;
          break;
        }
      }
    }
  }

  // 3. 매칭된 카테고리가 있으면 추가, 없으면 새 카테고리 생성
  if (matchedCategoryId) {
    // 기존 카테고리에 사건 추가
    await supabase.from("case_matches").insert({
      case_id: caseId,
      category_id: matchedCategoryId,
      similarity_score: 0.9,
      match_reason: classification.fraud_pattern,
    });

    // 카테고리 통계 업데이트
    const { data: category } = await supabase
      .from("case_categories")
      .select("total_cases, total_amount")
      .eq("id", matchedCategoryId)
      .single();

    if (category) {
      const newTotalCases = category.total_cases + 1;
      const newTotalAmount = Number(category.total_amount) + amountLost;

      await supabase
        .from("case_categories")
        .update({
          total_cases: newTotalCases,
          total_amount: newTotalAmount,
          // 3건 이상이면 자동 공개
          ...(newTotalCases >= 3 ? { status: "published" } : {}),
        })
        .eq("id", matchedCategoryId);
    }
  } else {
    // 새 카테고리 생성
    const { data: newCategory } = await supabase
      .from("case_categories")
      .insert({
        name: `${classification.fraud_pattern || classification.fraud_type} 사건 그룹`,
        description: classification.summary,
        fraud_type: classification.fraud_type,
        fraud_pattern: classification.fraud_pattern,
        total_cases: 1,
        total_amount: amountLost,
        status: "collecting",
      })
      .select("id")
      .single();

    if (newCategory) {
      await supabase.from("case_matches").insert({
        case_id: caseId,
        category_id: newCategory.id,
        similarity_score: 1.0,
        match_reason: "새 카테고리 생성",
      });
    }
  }
}

function parseFingerprint(fp: string): {
  account: string;
  phone: string;
  name: string;
} {
  const parts: Record<string, string> = {};
  fp.split("|").forEach((part) => {
    const [key, ...valueParts] = part.split(":");
    parts[key] = valueParts.join(":").trim();
  });
  return {
    account: (parts.account || "").replace(/-/g, ""),
    phone: parts.phone || "",
    name: parts.name || "",
  };
}
