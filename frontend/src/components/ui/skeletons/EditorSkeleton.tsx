import { Skeleton } from "../Skeleton";

export function EditorSkeleton() {
  return (
    <div className="flex-grow flex flex-col relative group h-full w-full bg-[#09090b] p-4 min-h-[400px]">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-4">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-24 h-6 rounded" />
      </div>

      <div className="mt-8 space-y-3 font-mono">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">1</span>
          <Skeleton className="w-1/3 h-4" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">2</span>
          <Skeleton className="w-1/2 h-4" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">3</span>
          <Skeleton className="w-1/4 h-4 ml-8" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">4</span>
          <Skeleton className="w-2/5 h-4 ml-8" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">5</span>
          <Skeleton className="w-1/3 h-4 ml-16" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">6</span>
          <Skeleton className="w-1/2 h-4 ml-16" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">7</span>
          <Skeleton className="w-1/6 h-4 ml-8" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-xs w-4 text-right">8</span>
          <Skeleton className="w-1/4 h-4" />
        </div>
      </div>
      
      {/* Loading Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
         <div className="flex flex-col items-center">
            <Skeleton className="w-12 h-1 mb-4 rounded-full" />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Initializing Editor Environment</span>
         </div>
      </div>
    </div>
  );
}
