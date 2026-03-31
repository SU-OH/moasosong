import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* 인사 */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="w-14 h-14 rounded-2xl" />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* 최근 사건 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
