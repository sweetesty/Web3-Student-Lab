"use client";

import { useState } from "react";
import { WatchExpression } from "@/hooks/useDebugger";

interface StateInspectorProps {
  localVariables: Map<string, unknown>;
  contractStorage: Map<string, unknown>;
  watchExpressions: WatchExpression[];
  onAddWatch: (expr: string) => void;
  onRemoveWatch: (id: string) => void;
}

type Tab = "locals" | "storage" | "watch";

function ValueBadge({ value }: { value: unknown }) {
  const type = typeof value;
  const color =
    type === "number"
      ? "text-[#f9c74f]"
      : type === "boolean"
      ? value
        ? "text-[#00d4aa]"
        : "text-[#f94144]"
      : type === "string"
      ? "text-[#a8d8ea]"
      : "text-[#c9b1ff]";

  const display =
    type === "object" ? JSON.stringify(value) : String(value);

  return (
    <span className={`font-mono text-xs ${color} truncate max-w-[160px]`}>
      {display}
    </span>
  );
}

function TypeTag({ value }: { value: unknown }) {
  const type =
    typeof value === "object"
      ? "object"
      : typeof value === "number"
      ? Number.isInteger(value as number)
        ? "i128"
        : "f64"
      : typeof value === "boolean"
      ? "bool"
      : "String";

  const bg =
    type === "i128" || type === "f64"
      ? "bg-[#f9c74f]/10 text-[#f9c74f]"
      : type === "bool"
      ? "bg-[#00d4aa]/10 text-[#00d4aa]"
      : type === "String"
      ? "bg-[#a8d8ea]/10 text-[#a8d8ea]"
      : "bg-[#c9b1ff]/10 text-[#c9b1ff]";

  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${bg}`}>
      {type}
    </span>
  );
}

export default function StateInspector({
  localVariables,
  contractStorage,
  watchExpressions,
  onAddWatch,
  onRemoveWatch,
}: StateInspectorProps) {
  const [tab, setTab] = useState<Tab>("locals");
  const [watchInput, setWatchInput] = useState("");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "locals", label: "Locals", count: localVariables.size },
    { id: "storage", label: "Storage", count: contractStorage.size },
    { id: "watch", label: "Watch", count: watchExpressions.length },
  ];

  function handleAddWatch() {
    if (watchInput.trim()) {
      onAddWatch(watchInput.trim());
      setWatchInput("");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-[#1a2e3a] mb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-colors border-b-2 -mb-px",
              tab === t.id
                ? "border-[#00d4aa] text-[#00d4aa]"
                : "border-transparent text-[#4a6070] hover:text-[#7ecfb3]",
            ].join(" ")}
          >
            {t.label}
            <span
              className={[
                "text-[9px] px-1 rounded",
                tab === t.id ? "bg-[#00d4aa]/15" : "bg-[#1a2e3a]",
              ].join(" ")}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {tab === "locals" && (
          <>
            {localVariables.size === 0 ? (
              <p className="text-[#4a5568] text-xs font-mono text-center py-6">
                No local variables
              </p>
            ) : (
              Array.from(localVariables.entries()).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0d1b2a]/60 border border-[#1a2e3a] hover:border-[#2a3e4a] transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TypeTag value={value} />
                    <span className="text-[#7ecfb3] text-xs font-mono truncate">
                      {key}
                    </span>
                  </div>
                  <ValueBadge value={value} />
                </div>
              ))
            )}
          </>
        )}

        {tab === "storage" && (
          <>
            {contractStorage.size === 0 ? (
              <p className="text-[#4a5568] text-xs font-mono text-center py-6">
                Storage empty
              </p>
            ) : (
              Array.from(contractStorage.entries()).map(([key, value]) => (
                <div
                  key={key}
                  className="px-2.5 py-2 rounded-lg bg-[#0d1b2a]/60 border border-[#1a2e3a] hover:border-[#2a3e4a] transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1 h-1 rounded-full bg-[#f9c74f]" />
                    <span className="text-[#a8d8ea] text-[10px] font-mono truncate">
                      {key}
                    </span>
                  </div>
                  <div className="pl-3">
                    <ValueBadge value={value} />
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === "watch" && (
          <>
            <div className="flex gap-2 mb-3">
              <input
                value={watchInput}
                onChange={(e) => setWatchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWatch()}
                placeholder="Add expression…"
                className="flex-1 bg-[#0d1b2a] border border-[#1a2e3a] rounded-lg px-3 py-1.5 text-xs font-mono text-[#a0c4b8] placeholder-[#3a5570] focus:outline-none focus:border-[#00d4aa]/50"
              />
              <button
                onClick={handleAddWatch}
                className="px-3 py-1.5 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa] text-xs hover:bg-[#00d4aa]/20 transition-colors"
              >
                +
              </button>
            </div>

            {watchExpressions.length === 0 ? (
              <p className="text-[#4a5568] text-xs font-mono text-center py-4">
                No watch expressions
              </p>
            ) : (
              watchExpressions.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0d1b2a]/60 border border-[#1a2e3a] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#c9b1ff] text-xs font-mono truncate">
                      {w.expression}
                    </span>
                    <span className="text-[#4a6070] text-xs">→</span>
                    {w.error ? (
                      <span className="text-[#f94144] text-xs font-mono">
                        {w.error}
                      </span>
                    ) : (
                      <ValueBadge value={w.value} />
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveWatch(w.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#f94144]/60 hover:text-[#f94144] transition-all text-xs ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}