'use client';

import { useState } from 'react';

const EXAMPLES = [
  {
    name: 'HelloWorld',
    code: `#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`,
    output: `[INFO] Initializing Soroban Environment...
[OK] Contract built successfully.
[RUN] Invoking 'hello' with argument 'FRIEND'...
[RESULT] ["Hello", "FRIEND"]
[STATS] CPU Instructions: 12503 | RAM: 0.4MB`,
  },
  {
    name: 'Incrementer',
    code: `pub fn increment(env: Env) -> u32 {
    let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
    count += 1;
    env.storage().instance().set(&COUNTER, &count);
    count
}`,
    output: `[INFO] Accessing Persistent Storage...
[OK] Previous state: 42
[RUN] Executing increment logic...
[RESULT] 43
[STATS] CPU Instructions: 45012 | Storage Write: 1`,
  },
];

export default function PlaygroundPage() {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [output, setOutput] = useState('// Terminal ready for input...');
  const [isCompiling, setIsCompiling] = useState(false);

  const handleRun = () => {
    setIsCompiling(true);
    setOutput(
      '> cargo build --target wasm32-unknown-unknown --release\n> soroban contract invoke ...'
    );

    setTimeout(() => {
      const match = EXAMPLES.find((ex) => code.includes(ex.name.split(' ')[0]));
      setOutput(
        match
          ? match.output
          : '[ERROR] Syntax Error: Unknown module pattern.\n[ADVICE] Use provided templates for sandbox execution.'
      );
      setIsCompiling(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white p-6 md:p-12 font-mono">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Title */}
        <div className="mb-10 flex justify-between items-end border-l-4 border-red-600 pl-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Soroban <span className="text-red-500">Playground</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Sandboxed Smart Contract Environment [v1.0.4-BETA]
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
              Compiler: WASM-RUST-SOROBAN-v21.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
          {/* Editor Area */}
          <div className="flex flex-col bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-black border-b border-white/10 p-4 flex justify-between items-center">
              <div className="flex gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => {
                      setCode(ex.code);
                      setOutput('// Terminal ready...');
                    }}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      code.includes(ex.name)
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'border-white/10 text-gray-500 hover:text-white'
                    }`}
                  >
                    {ex.name}.rs
                  </button>
                ))}
              </div>
              <button
                onClick={handleRun}
                disabled={isCompiling}
                className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isCompiling
                    ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                }`}
              >
                {isCompiling ? 'Compiling...' : 'Run Logic'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-grow bg-black text-gray-300 p-8 focus:outline-none resize-none scroll-smooth leading-relaxed text-sm custom-scrollbar"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Terminal / Result Area */}
          <div className="flex flex-col bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-black border-b border-white/10 p-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Output Terminal
              </span>
            </div>
            <div className="flex-grow bg-black p-8 relative">
              {isCompiling && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <div className="w-12 h-12 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                </div>
              )}
              <pre className="text-zinc-400 text-xs leading-loose font-mono whitespace-pre-wrap">
                {output}
                {isCompiling && <span className="animate-pulse">_</span>}
              </pre>
            </div>

            <div className="p-6 bg-zinc-900/30 border-t border-white/10">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">
                Verification Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black border border-white/5 rounded">
                  <p className="text-[9px] text-gray-600 uppercase mb-1">Compute Cost</p>
                  <p className="text-sm font-bold text-white tracking-widest">---</p>
                </div>
                <div className="p-3 bg-black border border-white/5 rounded">
                  <p className="text-[9px] text-gray-600 uppercase mb-1">State Size</p>
                  <p className="text-sm font-bold text-white tracking-widest">---</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Hint */}
        <div className="mt-12 p-8 bg-zinc-950 border border-red-500/10 rounded-2xl text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto flex items-center justify-center gap-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            This playground is a <span className="text-white font-bold">Simulated Sandbox</span>.
            Deploying to Testnet requires local CLI configuration. See documentation for full
            integration flow.
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
