"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav-items";
import type { UserRole } from "@/types/database";

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav rounded-t-2xl lg:hidden"
      style={{ boxShadow: "var(--shadow-nav)" }}
      role="navigation"
      aria-label="메인 내비게이션"
    >
      <div className="flex items-stretch h-[64px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[44px]"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-[3px] bg-navy-700 rounded-full" />
              )}

              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-200",
                  isActive
                    ? "text-navy-700 stroke-[2.4px]"
                    : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-[11px] transition-colors duration-200",
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
