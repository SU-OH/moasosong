"use client";

import { useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function DashboardHeader({
}: {
  userName: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-white/60 lg:hidden">
      <div className="app-container flex items-center justify-between h-[56px]">
        <h1 className="text-xl font-extrabold gradient-text tracking-tight">
          모아소송
        </h1>

        <div className="flex items-center gap-0.5">
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-navy-50 active:bg-navy-100 active:scale-95 transition-all"
            aria-label="알림"
          >
            <Bell className="w-5 h-5 text-navy-800" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-navy-50 active:bg-navy-100 active:scale-95 transition-all"
            onClick={handleLogout}
            aria-label="설정"
          >
            <Settings className="w-5 h-5 text-navy-800" />
          </button>
        </div>
      </div>
    </header>
  );
}
