import { Skeleton } from "../Skeleton";

export function GraphSkeleton() {
  return (
    <div className="relative w-full h-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg width="100%" height="100%">
          <circle cx="50%" cy="50%" r="120" stroke="#3f3f46" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="60" stroke="#3f3f46" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          
          <line x1="50%" y1="50%" x2="30%" y2="20%" stroke="#3f3f46" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="#3f3f46" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="40%" y2="80%" stroke="#3f3f46" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="#3f3f46" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Central Node */}
      <Skeleton className="w-16 h-16 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
      
      {/* Surrounding Nodes */}
      <Skeleton className="w-10 h-10 rounded-full absolute top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2 z-10" />
      <Skeleton className="w-8 h-8 rounded-full absolute top-[30%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-10" />
      <Skeleton className="w-12 h-12 rounded-full absolute top-[80%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-10" />
      <Skeleton className="w-6 h-6 rounded-full absolute top-[70%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* Loading Text */}
      <div className="absolute bottom-6 flex flex-col items-center">
        <Skeleton className="w-32 h-4 mb-2" />
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Synchronizing Nodes...</span>
      </div>
    </div>
  );
}
