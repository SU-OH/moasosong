"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function AnimatedNumber({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduce = useReducedMotion();
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.1,
  });
  const [display, setDisplay] = useState(
    shouldReduce ? value.toLocaleString() : "0"
  );

  useEffect(() => {
    if (inView && !shouldReduce) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue, shouldReduce]);

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(value.toLocaleString());
      return;
    }
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsubscribe;
  }, [spring, shouldReduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
