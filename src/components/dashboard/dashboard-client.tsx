"use client";

import type { ReactNode } from "react";

export function FadeInSection({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function FABButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/25 active:scale-95 transition-transform"
    >
      {children}
    </a>
  );
}
