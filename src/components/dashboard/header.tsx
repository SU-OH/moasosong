"use client";

import { useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function DashboardHeader({
  userName,
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
    <header className="sticky top-0 z-40 glass-nav border-b border-white/60">
      <div className="max-w-lg mx-auto flex items-center justify-between h-[56px] px-5">
        <h1 className="text-[19px] font-extrabold gradient-text tracking-tight">
          모아소송
        </h1>

        <div className="flex items-center gap-0.5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-navy-50 active:bg-navy-100 transition-colors"
            aria-label="알림"
          >
            <Bell className="w-[21px] h-[21px] text-navy-800" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-navy-50 active:bg-navy-100 transition-colors"
            onClick={handleLogout}
            aria-label="설정"
          >
            <Settings className="w-[21px] h-[21px] text-navy-800" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
