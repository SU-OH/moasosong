"use client";

import type { ReactNode } from "react";

export default function StatusPulse({
  children,
  color = "gold",
}: {
  children: ReactNode;
  color?: "gold" | "navy" | "green";
}) {
  const colorMap = {
    gold: "bg-gold-400",
    navy: "bg-navy-400",
    green: "bg-green-400",
  };

  return (
    <div className="relative inline-flex">
      <div
        className={`absolute inset-0 ${colorMap[color]} rounded-full opacity-30`}
        style={{ animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      />
      <div
        className={`absolute inset-0 ${colorMap[color]} rounded-full opacity-15`}
        style={{
          animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          animationDelay: "0.5s",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
