import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function LawyerCasesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("case_categories")
    .select("*")
    .in("status", ["published", "assigned"])
    .order("total_amount", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-heading font-bold text-navy-900">
          AI 분류 사건 그룹
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI가 유사 사건을 분류한 그룹입니다. 관심 있는 그룹에 수임 의사를
          표명하세요.
        </p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/lawyer/cases/${cat.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-navy-900 truncate">
                          {cat.name}
                        </p>
                        {cat.status === "assigned" && (
                          <Badge variant="default" className="text-xs shrink-0">
                            수임중
                          </Badge>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium text-navy-600">
                          {cat.total_cases}건
                        </span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs font-medium text-destructive">
                          총 {Number(cat.total_amount).toLocaleString()}원
                        </span>
                        {cat.fraud_pattern && (
                          <>
                            <span className="text-xs text-muted-foreground">|</span>
                            <Badge variant="secondary" className="text-xs">
                              {cat.fraud_pattern}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 ml-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground mt-4 font-medium">
              공개된 사건 그룹이 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              사건이 3건 이상 모이면 AI가 그룹을 공개합니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
