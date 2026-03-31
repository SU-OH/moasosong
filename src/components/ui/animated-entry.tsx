"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

export default function AnimatedEntry({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  const offset = offsets[direction];

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={
        shouldReduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 26, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
