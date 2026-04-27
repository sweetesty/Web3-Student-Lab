import { Skeleton } from "../Skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="bg-zinc-950 border border-white/5 p-8 relative overflow-hidden">
      <Skeleton className="w-3/4 h-7 mb-3" />
      <div className="space-y-2 mb-6">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-10" />
      </div>
      <Skeleton className="w-24 h-4 mt-2" />
    </div>
  );
}

export function CertCardSkeleton() {
  return (
    <div className="bg-black border border-red-500/20 rounded-xl p-8 relative overflow-hidden">
      <div className="flex items-start justify-between mb-6 relative z-10">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-24 h-6 rounded" />
      </div>
      <Skeleton className="w-3/4 h-7 mb-2" />
      <Skeleton className="w-1/2 h-5" />
    </div>
  );
}
