"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav-items";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UserRole } from "@/types/database";

export default function DesktopSidebar({
  role,
  userName,
}: {
  role: UserRole;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(role);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] z-50 flex-col border-r border-border/40 bg-white/90">
      {/* 로고 */}
      <div className="h-[56px] flex items-center px-6 border-b border-border/30">
        <h1 className="text-xl font-extrabold gradient-text tracking-tight">
          모아소송
        </h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-navy-50 text-navy-700"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-navy-800"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-navy-700 rounded-full" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-navy-700" : "text-muted-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 유저 정보 + 로그아웃 */}
      <div className="border-t border-border/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-sm font-bold text-navy-700">
            {userName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {role === "lawyer" ? "변호사" : "피해자"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-slate-50 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
