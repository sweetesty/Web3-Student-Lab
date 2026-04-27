import { Skeleton } from "../Skeleton";

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-black border border-white/5 p-4 rounded-lg group">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
