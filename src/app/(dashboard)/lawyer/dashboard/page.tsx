import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function LawyerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  // 공개된 카테고리 조회
  const { data: categories } = await supabase
    .from("case_categories")
    .select("*")
    .in("status", ["published", "assigned"])
    .order("created_at", { ascending: false })
    .limit(5);

  // 내 관심 표명 조회
  const { data: interests } = await supabase
    .from("lawyer_interests")
    .select("*, case_categories(*)")
    .eq("lawyer_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalCategories = categories?.length || 0;
  const totalCases =
    categories?.reduce((sum, c) => sum + c.total_cases, 0) || 0;
  const totalAmount =
    categories?.reduce((sum, c) => sum + Number(c.total_amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h2 className="text-xl font-heading font-bold text-navy-900">
          안녕하세요, {profile?.full_name} 변호사님
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI가 분류한 사건 그룹을 확인하고 수임해보세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Layers className="w-6 h-6 mx-auto text-navy-600" />
            <p className="text-2xl font-bold text-navy-900 mt-1">
              {totalCategories}
            </p>
            <p className="text-xs text-muted-foreground">사건 그룹</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-gold-600" />
            <p className="text-2xl font-bold text-navy-900 mt-1">
              {totalCases}
            </p>
            <p className="text-xs text-muted-foreground">총 사건 수</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Banknote className="w-6 h-6 mx-auto text-green-600" />
            <p className="text-2xl font-bold text-navy-900 mt-1">
              {totalAmount > 0
                ? `${Math.round(totalAmount / 10000)}만`
                : "0"}
            </p>
            <p className="text-xs text-muted-foreground">총 피해액</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 사건 그룹 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-navy-900">
            최근 사건 그룹
          </h3>
          <Link
            href="/lawyer/cases"
            className="text-sm text-navy-600 hover:underline"
          >
            전체보기
          </Link>
        </div>

        {categories && categories.length > 0 ? (
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/lawyer/cases/${cat.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 truncate">
                          {cat.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cat.total_cases}건 | 총{" "}
                          {Number(cat.total_amount).toLocaleString()}원
                        </p>
                        {cat.fraud_pattern && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs"
                          >
                            {cat.fraud_pattern}
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Layers className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-3">
                아직 공개된 사건 그룹이 없습니다
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                새로운 사건이 분류되면 알려드리겠습니다
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 내 관심 사건 */}
      {interests && interests.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-navy-900 mb-3">
            내 관심 표명
          </h3>
          <div className="space-y-3">
            {interests.map((interest) => (
              <Card key={interest.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy-900">
                        {(interest.case_categories as unknown as { name: string })?.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(interest.created_at).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        interest.status === "accepted"
                          ? "default"
                          : interest.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {interest.status === "pending"
                        ? "대기중"
                        : interest.status === "accepted"
                        ? "수락됨"
                        : "거절됨"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
