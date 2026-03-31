import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Banknote, Brain, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("case_categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (!category) notFound();

  // 이 카테고리에 속한 사건들 (익명화 조회)
  const { data: matches } = await supabase
    .from("case_matches")
    .select(`
      similarity_score,
      match_reason,
      fraud_cases(
        id,
        title,
        fraud_type,
        amount_lost,
        incident_date,
        status,
        ai_summary,
        ai_fraud_pattern,
        suspect_platform,
        police_report_filed
      )
    `)
    .eq("category_id", categoryId)
    .order("similarity_score", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cases = matches?.map((m) => {
    const fc = m.fraud_cases as any;
    return {
      ...fc,
      similarity_score: m.similarity_score,
      match_reason: m.match_reason,
    };
  }) || [];

  return (
    <div className="space-y-4">
      <Link
        href="/lawyer/cases"
        className="inline-flex items-center text-sm text-navy-600 hover:underline gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        사건 그룹 목록
      </Link>

      {/* 그룹 헤더 */}
      <div>
        <h2 className="text-xl font-heading font-bold text-navy-900">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {category.description}
          </p>
        )}
      </div>

      {/* 그룹 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto text-navy-600" />
            <p className="text-xl font-bold text-navy-900 mt-1">
              {category.total_cases}
            </p>
            <p className="text-xs text-muted-foreground">피해자 수</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Banknote className="w-5 h-5 mx-auto text-destructive" />
            <p className="text-xl font-bold text-navy-900 mt-1">
              {Number(category.total_amount).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">총 피해액(원)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Brain className="w-5 h-5 mx-auto text-gold-600" />
            <p className="text-xl font-bold text-navy-900 mt-1">AI</p>
            <p className="text-xs text-muted-foreground">분류 완료</p>
          </CardContent>
        </Card>
      </div>

      {category.fraud_pattern && (
        <Card className="border-0 shadow-sm bg-navy-50">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-navy-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-navy-900">
                AI 분류 패턴
              </p>
              <p className="text-sm text-navy-700">{category.fraud_pattern}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 개별 사건 목록 (익명화) */}
      <div>
        <h3 className="text-base font-semibold text-navy-900 mb-3">
          소속 사건 ({cases.length}건)
        </h3>
        <div className="space-y-3">
          {cases.map((c, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-navy-900">
                      사건 #{i + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.incident_date as string} | 피해액{" "}
                      {Number(c.amount_lost).toLocaleString()}원
                    </p>
                  </div>
                  {c.similarity_score && (
                    <Badge variant="outline" className="text-xs">
                      유사도 {Math.round((c.similarity_score as number) * 100)}%
                    </Badge>
                  )}
                </div>
                {c.ai_summary && (
                  <p className="text-sm text-muted-foreground">
                    {c.ai_summary as string}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {c.suspect_platform && (
                    <Badge variant="secondary" className="text-xs">
                      {c.suspect_platform as string}
                    </Badge>
                  )}
                  {c.police_report_filed && (
                    <Badge variant="outline" className="text-xs">
                      경찰 신고됨
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
