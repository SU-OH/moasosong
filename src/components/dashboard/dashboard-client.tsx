"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeInSection({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 24, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
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
    <motion.a
      href={href}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/25"
    >
      {children}
    </motion.a>
  );
}
