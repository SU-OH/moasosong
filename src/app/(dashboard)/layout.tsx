import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/dashboard/bottom-nav";
import DashboardHeader from "@/components/dashboard/header";
import DesktopSidebar from "@/components/dashboard/desktop-sidebar";
import PageTransition from "@/components/ui/page-transition";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* 스킵 네비게이션 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-navy-700 focus:text-white focus:rounded-br-xl"
      >
        본문으로 건너뛰기
      </a>

      {/* 데스크톱 사이드바 (lg 이상) */}
      <DesktopSidebar role={role} userName={profile.full_name} />

      {/* 메인 영역 */}
      <div className="lg:ml-[260px]">
        <DashboardHeader userName={profile.full_name} />
        <main
          id="main-content"
          className="app-container pt-3 pb-[88px] lg:pb-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* 모바일 하단 네비 (lg 미만) */}
      <BottomNav role={role} />
    </div>
  );
}
