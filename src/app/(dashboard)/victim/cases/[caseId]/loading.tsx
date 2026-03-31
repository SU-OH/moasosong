import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-28 mt-1" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
