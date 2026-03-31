import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* 최근 사건 그룹 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
