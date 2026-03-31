"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const reducedContainerVariants = {
  hidden: {},
  visible: {},
};

const reducedItemVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduce ? reducedContainerVariants : containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: shouldReduce ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduce ? reducedItemVariants : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
