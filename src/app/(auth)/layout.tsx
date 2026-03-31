export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto">
      {/* 그라데이션 헤더 */}
      <div className="animated-gradient-bg relative overflow-hidden px-6 pt-14 pb-16">
        {/* 부유 오브 */}
        <div
          className="absolute w-48 h-48 rounded-full bg-gold-400/8 blur-3xl -top-10 -right-10"
          style={{ animation: "float 6s ease-in-out infinite" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full bg-navy-300/10 blur-2xl bottom-0 left-4"
          style={{ animation: "float 6s ease-in-out infinite 2s" }}
        />

        <div className="relative z-10">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">
            모아소송
          </h1>
          <p className="text-[14px] text-white/50 mt-1">
            소액 사기 피해 통합 플랫폼
          </p>
        </div>
      </div>

      {/* 라이징 카드 */}
      <div className="flex-1 bg-white rounded-t-[28px] -mt-6 relative z-10 px-6 pt-8 pb-8"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {children}
      </div>
    </div>
  );
}
