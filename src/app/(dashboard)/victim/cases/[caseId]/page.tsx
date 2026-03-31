import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  User,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  submitted: { label: "접수완료", color: "bg-gray-100 text-gray-700" },
  analyzing: { label: "AI 분석중", color: "bg-blue-100 text-blue-700" },
  classified: { label: "분류완료", color: "bg-indigo-100 text-indigo-700" },
  matched: { label: "매칭완료", color: "bg-green-100 text-green-700" },
  in_progress: { label: "진행중", color: "bg-gold-100 text-gold-700" },
  resolved: { label: "해결", color: "bg-emerald-100 text-emerald-700" },
};

const FRAUD_TYPE_LABELS: Record<string, string> = {
  investment: "투자 사기",
  shopping: "쇼핑 사기",
  loan: "대출 사기",
  romance: "로맨스 스캠",
  phishing: "보이스 피싱",
  other: "기타",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fraudCase } = await supabase
    .from("fraud_cases")
    .select("*")
    .eq("id", caseId)
    .eq("victim_id", user!.id)
    .single();

  if (!fraudCase) notFound();

  const status = STATUS_MAP[fraudCase.status] || STATUS_MAP.submitted;
  const aiResult = fraudCase.ai_classification as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <Link
        href="/victim/cases"
        className="inline-flex items-center text-sm text-navy-600 hover:underline gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        사건 목록
      </Link>

      {/* 상태 + 제목 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <Badge variant="outline" className="text-xs">
            {FRAUD_TYPE_LABELS[fraudCase.fraud_type] || fraudCase.fraud_type}
          </Badge>
        </div>
        <h2 className="text-xl font-heading font-bold text-navy-900">
          {fraudCase.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(fraudCase.created_at).toLocaleDateString("ko-KR")} 접수
        </p>
      </div>

      {/* 기본 정보 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gold-600" />
            사건 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">피해 금액</span>
            <span className="font-semibold text-destructive">
              {Number(fraudCase.amount_lost).toLocaleString()}원
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">사건 발생일</span>
            <span>{fraudCase.incident_date}</span>
          </div>
          <Separator />
          <div>
            <span className="text-muted-foreground">상세 설명</span>
            <p className="mt-1 text-navy-900 whitespace-pre-wrap">
              {fraudCase.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 가해자 정보 */}
      {(fraudCase.suspect_name ||
        fraudCase.suspect_account ||
        fraudCase.suspect_contact) && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-navy-600" />
              가해자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {fraudCase.suspect_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">이름/닉네임</span>
                <span>{fraudCase.suspect_name}</span>
              </div>
            )}
            {fraudCase.suspect_contact && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">연락처</span>
                  <span>{fraudCase.suspect_contact}</span>
                </div>
              </>
            )}
            {fraudCase.suspect_account && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">계좌</span>
                  <span>
                    {fraudCase.suspect_bank} {fraudCase.suspect_account}
                  </span>
                </div>
              </>
            )}
            {fraudCase.suspect_platform && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">플랫폼</span>
                  <span>{fraudCase.suspect_platform}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI 분석 결과 */}
      {aiResult && (
        <Card className="border-0 shadow-sm border-l-4 border-l-navy-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-navy-600" />
              AI 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {fraudCase.ai_summary && (
              <div>
                <span className="text-muted-foreground">요약</span>
                <p className="mt-1 text-navy-900">{fraudCase.ai_summary}</p>
              </div>
            )}
            {fraudCase.ai_fraud_pattern && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사기 패턴</span>
                  <Badge variant="secondary">{fraudCase.ai_fraud_pattern}</Badge>
                </div>
              </>
            )}
            {aiResult.modus_operandi && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">수법</span>
                  <p className="mt-1">{aiResult.modus_operandi as string}</p>
                </div>
              </>
            )}
            {aiResult.evidence_strength && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">증거 강도</span>
                  <Badge
                    variant={
                      aiResult.evidence_strength === "strong"
                        ? "default"
                        : aiResult.evidence_strength === "moderate"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {aiResult.evidence_strength === "strong"
                      ? "강함"
                      : aiResult.evidence_strength === "moderate"
                      ? "보통"
                      : "약함"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 분석 대기 중 */}
      {!aiResult && fraudCase.status === "submitted" && (
        <Card className="border-0 shadow-sm bg-navy-50">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto text-navy-600 animate-pulse" />
            <p className="text-navy-700 font-medium mt-3">
              AI 분석 대기 중
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              접수된 사건을 AI가 곧 분석합니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
