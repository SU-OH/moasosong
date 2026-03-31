import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FadeInSection, FABButton } from "@/components/dashboard/dashboard-client";

const STATUS_LABELS: Record<
  string,
  { label: string; dot?: boolean; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  submitted: { label: "접수완료", variant: "secondary" },
  analyzing: { label: "분석중", dot: true, variant: "outline" },
  classified: { label: "분류완료", variant: "default" },
  matched: { label: "매칭완료", variant: "default" },
  in_progress: { label: "진행중", variant: "default" },
  resolved: { label: "해결", variant: "default" },
};

export default async function VictimDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: cases } = await supabase
    .from("fraud_cases")
    .select("*")
    .eq("victim_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalCases = cases?.length || 0;
  const analyzingCases =
    cases?.filter((c) => c.status === "analyzing").length || 0;
  const matchedCases =
    cases?.filter(
      (c) => c.status === "matched" || c.status === "in_progress"
    ).length || 0;

  return (
    <div className="space-y-6">
      {/* 인사 + FAB */}
      <FadeInSection>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">안녕하세요</p>
            <p className="text-2xl font-extrabold text-navy-900 tracking-tight">
              {profile?.full_name}님
            </p>
          </div>
          <FABButton href="/victim/cases/new">
            <Plus className="w-6 h-6 text-white" />
          </FABButton>
        </div>
      </FadeInSection>

      {/* 통계 카드 */}
      <FadeInSection delay={0.08}>
        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          {[
            {
              Icon: FileText,
              accent: "border-l-navy-500",
              iconBg: "bg-navy-50",
              iconColor: "text-navy-600",
              value: totalCases,
              label: "전체",
            },
            {
              Icon: Clock,
              accent: "border-l-gold-500",
              iconBg: "bg-gold-50",
              iconColor: "text-gold-600",
              value: analyzingCases,
              label: "분석중",
              pulse: analyzingCases > 0,
            },
            {
              Icon: CheckCircle,
              accent: "border-l-green-500",
              iconBg: "bg-green-50",
              iconColor: "text-green-600",
              value: matchedCases,
              label: "매칭",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-white rounded-2xl p-3.5 md:p-5 border-l-[3px] ${item.accent} card-premium`}
            >
              <div className="relative inline-flex">
                {item.pulse && (
                  <>
                    <div
                      className={`absolute inset-0 ${item.iconBg} rounded-xl`}
                      style={{
                        animation:
                          "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    />
                  </>
                )}
                <div
                  className={`relative w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center`}
                >
                  <item.Icon className={`w-[18px] h-[18px] ${item.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-2 tracking-tight">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </FadeInSection>

      {/* 최근 사건 */}
      <FadeInSection delay={0.16}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-navy-900">최근 사건</h3>
            <Link
              href="/victim/cases"
              className="text-sm text-muted-foreground flex items-center gap-0.5 active:text-navy-600"
            >
              전체
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cases && cases.length > 0 ? (
            <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
              {cases.map((c) => {
                const status = STATUS_LABELS[c.status];
                const borderColor =
                  c.status === "analyzing"
                    ? "border-l-gold-400"
                    : c.status === "matched" || c.status === "resolved"
                    ? "border-l-green-400"
                    : "border-l-navy-300";

                return (
                  <Link key={c.id} href={`/victim/cases/${c.id}`}>
                    <div
                      className={`bg-white rounded-2xl p-4 border-l-[3px] ${borderColor} card-premium`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-navy-900 truncate">
                            {c.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {Number(c.amount_lost).toLocaleString()}원 ·{" "}
                            {new Date(c.created_at).toLocaleDateString(
                              "ko-KR",
                              { month: "short", day: "numeric" }
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={status?.variant || "secondary"}
                          className="ml-3 shrink-0 text-xs rounded-lg gap-1"
                        >
                          {status?.dot && (
                            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
                          )}
                          {status?.label || c.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center card-premium">
              <div
                className="w-16 h-16 bg-gradient-to-br from-navy-50 to-navy-100 rounded-2xl flex items-center justify-center mx-auto"
                style={{ animation: "float 5s ease-in-out infinite" }}
              >
                <FileText className="w-7 h-7 text-navy-400" />
              </div>
              <p className="text-base text-navy-800 font-semibold mt-5">
                아직 접수된 사건이 없어요
              </p>
              <p className="text-sm text-muted-foreground mt-1.5">
                우측 상단{" "}
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gold-500 rounded-md text-white text-[10px] font-bold align-middle mx-0.5">
                  +
                </span>{" "}
                버튼으로 사기 피해를 접수해보세요
              </p>
            </div>
          )}
        </div>
      </FadeInSection>
    </div>
  );
}
