import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/dashboard/bottom-nav";
import DashboardHeader from "@/components/dashboard/header";
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
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-50/50 max-w-lg mx-auto relative">
      <DashboardHeader userName={profile.full_name} />
      <main className="px-5 pt-3 pb-[88px]">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
