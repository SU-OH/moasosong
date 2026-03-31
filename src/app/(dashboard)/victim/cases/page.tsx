import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "접수완료", variant: "secondary" },
  analyzing: { label: "AI 분석중", variant: "outline" },
  classified: { label: "분류완료", variant: "default" },
  matched: { label: "매칭완료", variant: "default" },
  in_progress: { label: "진행중", variant: "default" },
  resolved: { label: "해결", variant: "default" },
};

const FRAUD_TYPE_LABELS: Record<string, string> = {
  investment: "투자 사기",
  shopping: "쇼핑 사기",
  loan: "대출 사기",
  romance: "로맨스 스캠",
  phishing: "보이스 피싱",
  other: "기타",
};

export default async function VictimCasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from("fraud_cases")
    .select("*")
    .eq("victim_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-navy-900">
          내 사건 목록
        </h2>
        <Link href="/victim/cases/new">
          <Button
            size="sm"
            className="bg-navy-700 hover:bg-navy-800 text-white gap-1"
          >
            <Plus className="w-4 h-4" />
            접수
          </Button>
        </Link>
      </div>

      {cases && cases.length > 0 ? (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/victim/cases/${c.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 truncate">
                        {c.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {FRAUD_TYPE_LABELS[c.fraud_type] || c.fraud_type}
                        </span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground">
                          {Number(c.amount_lost).toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(c.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <Badge
                      variant={STATUS_LABELS[c.status]?.variant || "secondary"}
                      className="ml-2 shrink-0"
                    >
                      {STATUS_LABELS[c.status]?.label || c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground mt-4 font-medium">
              아직 접수된 사건이 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              사기 피해를 접수하면 AI가 유사 사건을 찾아드립니다
            </p>
            <Link href="/victim/cases/new">
              <Button className="mt-4 bg-navy-700 hover:bg-navy-800 text-white">
                첫 사건 접수하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
