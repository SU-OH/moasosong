import { Home, FileText, MessageCircle, UserCircle } from "lucide-react";
import type { UserRole } from "@/types/database";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function getNavItems(role: UserRole): NavItem[] {
  const prefix = role === "lawyer" ? "/lawyer" : "/victim";
  return [
    { href: `${prefix}/dashboard`, label: "홈", icon: Home },
    { href: `${prefix}/cases`, label: "사건", icon: FileText },
    { href: `${prefix}/messages`, label: "채팅", icon: MessageCircle },
    { href: `${prefix}/profile`, label: "MY", icon: UserCircle },
  ];
}
