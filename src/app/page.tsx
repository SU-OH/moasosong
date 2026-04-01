"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Handshake, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    Icon: Shield,
    title: "소액 사기 피해,\n혼자 참지 마세요",
    description: "같은 사기꾼에게 당한 피해자들을\n모아서 함께 해결합니다",
  },
  {
    Icon: Brain,
    title: "AI가 자동으로\n유사 사건을 찾아요",
    description: "동일범, 같은 수법의 사건을\nAI가 분석하고 분류합니다",
  },
  {
    Icon: Handshake,
    title: "전문 변호사와\n함께 대응하세요",
    description: "묶인 사건을 변호사가 검토하고\n합리적 비용으로 도와드립니다",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = current === SLIDES.length - 1;

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > current ? 1 : -1);
      setCurrent(next);
    },
    [current]
  );

  const slide = SLIDES[current];

  return (
    <div className="min-h-dvh flex flex-col w-full relative overflow-hidden animated-gradient-bg">
      {/* 부유 오브 (정적) */}
      {[
        { size: 280, top: "8%", left: "-20%", color: "bg-navy-400/10" },
        { size: 200, top: "60%", right: "-15%", color: "bg-gold-400/10" },
        { size: 160, bottom: "15%", left: "10%", color: "bg-navy-300/8" },
      ].map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
          }}
        />
      ))}

      {/* 스킵 */}
      <div className="relative z-10 flex justify-end px-5 pt-5">
        <Link
          href="/login"
          className="text-sm text-white/50 active:text-white/80 transition-colors"
        >
          건너뛰기
        </Link>
      </div>

      {/* 슬라이드 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="flex flex-col items-center text-center"
          >
            {/* 글래스 아이콘 */}
            <div
              className="w-28 h-28 rounded-[28px] glass-dark flex items-center justify-center mb-10"
            >
              <slide.Icon className="w-14 h-14 text-white/90" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight whitespace-pre-line tracking-tight">
              {slide.title}
            </h1>

            <p className="mt-4 text-base md:text-lg text-white/55 leading-relaxed whitespace-pre-line">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 */}
      <div className="relative z-10 px-6 pb-10 space-y-5">
        {/* 인디케이터 */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-[5px] rounded-full transition-all duration-400",
                i === current
                  ? "w-7 bg-white"
                  : "w-[5px] bg-white/25"
              )}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-3">
            <Link href="/signup" className="block">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button className="w-full h-12 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-gold-500/25">
                  시작하기
                </Button>
              </motion.div>
            </Link>
            <Link href="/login" className="block">
              <Button
                variant="ghost"
                className="w-full h-12 text-white/60 hover:text-white hover:bg-white/5 text-base font-medium rounded-2xl"
              >
                이미 계정이 있어요
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full h-12 bg-white/10 hover:bg-white/15 text-white text-base font-semibold rounded-2xl border border-white/10 backdrop-blur gap-1"
              onClick={() => goTo(current + 1)}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
