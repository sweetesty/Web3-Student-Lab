"use client";

import { Frame } from "@/hooks/useDebugger";

interface CallStackViewProps {
  frames: Frame[];
  currentStep: number;
}

export default function CallStackView({ frames, currentStep }: CallStackViewProps) {
  if (frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-[#4a5568]">
        <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
        <span className="text-xs font-mono">No active frames</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-mono text-xs">
      {[...frames].reverse().map((frame, i) => {
        const isTop = i === 0;
        return (
          <div
            key={frame.id}
            className={[
              "rounded-lg border px-3 py-2.5 transition-all duration-200",
              isTop
                ? "border-[#00d4aa]/40 bg-[#00d4aa]/5 shadow-[0_0_12px_rgba(0,212,170,0.08)]"
                : "border-[#2a3a4a] bg-[#0d1b2a]/60",
            ].join(" ")}
            style={{ marginLeft: `${(frames.length - 1 - i) * 8}px` }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {isTop && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                )}
                <span className={isTop ? "text-[#00d4aa]" : "text-[#7ecfb3]"}>
                  {frame.functionName}
                </span>
                <span className="text-[#4a6070]">()</span>
              </div>
              <span className="text-[#4a6070] text-[10px]">
                ⛽ {frame.gasUsed.toLocaleString()}
              </span>
            </div>

            <div className="text-[#3a5a6a] text-[10px] mb-1.5 truncate">
              {frame.contractId}
            </div>

            {Object.keys(frame.parameters).length > 0 && (
              <div className="space-y-0.5">
                {Object.entries(frame.parameters).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-[#5a7a8a] min-w-[80px]">{k}:</span>
                    <span className="text-[#a0c4b8] truncate">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-1.5 text-[10px] text-[#3a5570]">
              → {frame.returnType}
            </div>
          </div>
        );
      })}

      <div className="text-[10px] text-[#3a5570] pt-1 pl-1">
        depth: {frames.length} · step: {currentStep}
      </div>
    </div>
  );
}