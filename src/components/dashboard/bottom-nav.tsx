"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, MessageCircle, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getNavItems(role: UserRole): NavItem[] {
  const prefix = role === "lawyer" ? "/lawyer" : "/victim";
  return [
    { href: `${prefix}/dashboard`, label: "홈", icon: Home },
    { href: `${prefix}/cases`, label: "사건", icon: FileText },
    { href: `${prefix}/messages`, label: "채팅", icon: MessageCircle },
    { href: `${prefix}/profile`, label: "MY", icon: UserCircle },
  ];
}

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav rounded-t-2xl"
      style={{ boxShadow: "var(--shadow-nav)" }}
    >
      <div className="max-w-lg mx-auto flex items-stretch h-[64px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {/* 활성 인디케이터 필 */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 w-8 h-[3px] bg-navy-700 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-colors duration-200",
                    isActive
                      ? "text-navy-700 stroke-[2.4px]"
                      : "text-gray-400"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] transition-colors duration-200",
                  isActive
                    ? "text-navy-700 font-bold"
                    : "text-gray-400 font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
