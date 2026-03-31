"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      className="w-full h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      로그아웃
    </Button>
  );
}
