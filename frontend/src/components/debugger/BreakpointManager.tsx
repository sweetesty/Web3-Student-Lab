"use client";

interface BreakpointManagerProps {
  breakpoints: Set<number>;
  totalLines: number;
  onToggle: (line: number) => void;
  onClearAll: () => void;
  currentLine?: number;
}

export default function BreakpointManager({
  breakpoints,
  totalLines,
  onToggle,
  onClearAll,
  currentLine,
}: BreakpointManagerProps) {
  const sorted = Array.from(breakpoints).sort((a, b) => a - b);

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-[#4a6070] uppercase tracking-widest">
          Breakpoints ({breakpoints.size})
        </span>
        {breakpoints.size > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-[#f94144]/60 hover:text-[#f94144] font-mono transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Quick-add by line number */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          min={1}
          max={totalLines}
          placeholder="Line #"
          className="flex-1 bg-[#0d1b2a] border border-[#1a2e3a] rounded-lg px-3 py-1.5 text-xs font-mono text-[#a0c4b8] placeholder-[#3a5570] focus:outline-none focus:border-[#f94144]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(val) && val >= 1) {
                onToggle(val);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
        <span className="flex items-center text-[10px] text-[#3a5570] font-mono pr-1">
          ↵ add
        </span>
      </div>

      {/* Breakpoint list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-[#4a5568]">
            <span className="text-2xl mb-1">⬤</span>
            <span className="text-xs font-mono">No breakpoints set</span>
            <span className="text-[10px] mt-1 text-[#3a5570]">
              Click line numbers or use the input above
            </span>
          </div>
        ) : (
          sorted.map((line) => {
            const isActive = line === currentLine;
            return (
              <div
                key={line}
                className={[
                  "flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-150",
                  isActive
                    ? "border-[#f9c74f]/40 bg-[#f9c74f]/5"
                    : "border-[#1a2e3a] bg-[#0d1b2a]/60 hover:border-[#f94144]/30",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      isActive ? "bg-[#f9c74f]" : "bg-[#f94144]",
                    ].join(" ")}
                  />
                  <div>
                    <span className="text-xs font-mono text-[#a0c4b8]">
                      Line {line}
                    </span>
                    {isActive && (
                      <span className="ml-2 text-[9px] font-mono text-[#f9c74f] bg-[#f9c74f]/10 px-1.5 py-0.5 rounded">
                        PAUSED HERE
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onToggle(line)}
                  className="text-[#f94144]/40 hover:text-[#f94144] text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Hint */}
      <div className="pt-3 border-t border-[#1a2e3a] mt-3">
        <p className="text-[10px] text-[#3a5570] font-mono leading-relaxed">
          Execution pauses when it reaches a breakpoint line.
          Use <span className="text-[#00d4aa]">▶ Play</span> to run until next breakpoint.
        </p>
      </div>
    </div>
  );
}