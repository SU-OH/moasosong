import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone } from "lucide-react";
import LogoutButton from "@/components/dashboard/logout-button";

export default async function VictimProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-heading font-bold text-navy-900">
        내 프로필
      </h2>

      {/* 프로필 카드 */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-navy-700">
                {profile.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy-900">
                {profile.full_name}
              </h3>
              <Badge variant="secondary" className="mt-1">피해자</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계정 정보 */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h4 className="text-sm font-semibold text-navy-900">계정 정보</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-navy-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">이메일</p>
                <p className="text-sm font-medium text-navy-900">
                  {user.email}
                </p>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-navy-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">전화번호</p>
                  <p className="text-sm font-medium text-navy-900">
                    {profile.phone}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-navy-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">가입일</p>
                <p className="text-sm font-medium text-navy-900">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로그아웃 */}
      <LogoutButton />
    </div>
  );
}
