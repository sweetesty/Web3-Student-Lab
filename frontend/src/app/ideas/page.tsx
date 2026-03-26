'use client';

import { useState } from 'react';

const SECTORS = ['Payments', 'Gaming', 'Real Estate', 'Supply Chain', 'Social Media', 'Governance'];
const TECHS = [
  'Soroban Smart Contracts',
  'Trustlines',
  'Liquidity Pools',
  'Clawback Enabled Assets',
  'Hov-enabled accounts',
];
const GOALS = [
  'Reduce friction',
  'Enable transparency',
  'Tokenize physical assets',
  'Gamify reputation',
  'Automate payouts',
];

export default function IdeasPage() {
  const [idea, setIdea] = useState<{ sector: string; tech: string; goal: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdea = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIdea({
        sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
        tech: TECHS[Math.floor(Math.random() * TECHS.length)],
        goal: GOALS[Math.floor(Math.random() * GOALS.length)],
      });
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white p-6 md:p-12 relative overflow-hidden font-mono">
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center relative z-10">
        {/* Header */}
        <div className="text-center mb-16 border-l-4 border-red-600 pl-8 inline-block">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Project <span className="text-red-500">Incubator</span>
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.4em] font-bold">
            Heuristic AI Concept Generator [BETA]
          </p>
        </div>

        {/* Display Area */}
        <div className="w-full bg-zinc-950 border border-white/10 rounded-[2rem] p-10 md:p-16 shadow-[0_0_50px_rgba(220,38,38,0.05)] relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

          {!idea && !isGenerating ? (
            <div className="text-center py-10 opacity-40">
              <div className="w-20 h-20 border-2 border-dashed border-red-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-sm uppercase tracking-widest font-bold">
                Operator: Ready for generation
              </p>
            </div>
          ) : isGenerating ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-red-500 text-xs animate-pulse font-black uppercase tracking-widest">
                Scanning Network Protocols...
              </p>
            </div>
          ) : (
            idea && (
              <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-500 w-full">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4 block">
                    Sector Integration
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-widest leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {idea.sector}
                  </h2>
                </div>

                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px bg-white/10 flex-grow"></div>
                  <div className="w-4 h-4 rounded-full border border-red-600 flex items-center justify-center">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-6 bg-black border border-white/5 rounded-2xl group hover:border-red-500/30 transition-colors">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-3 block">
                      Tech Primitive
                    </span>
                    <p className="text-sm font-bold text-red-500 uppercase">{idea.tech}</p>
                  </div>
                  <div className="p-6 bg-black border border-white/5 rounded-2xl group hover:border-red-500/30 transition-colors">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-3 block">
                      Primary Objective
                    </span>
                    <p className="text-sm font-bold text-white uppercase">{idea.goal}</p>
                  </div>
                </div>

                <div className="pt-8 opacity-50 italic text-xs text-gray-500 border-t border-white/5 font-light leading-relaxed">
                  {`"Leverage ${idea.tech} within the ${idea.sector} ecosystem to effectively ${idea.goal.toLowerCase()} using the Stellar Network's high-speed consensus."`}
                </div>
              </div>
            )
          )}

          <button
            onClick={generateIdea}
            disabled={isGenerating}
            className={`mt-12 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transform active:scale-95 ${
              isGenerating
                ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-500 hover:-translate-y-1'
            }`}
          >
            {idea ? 'Generate New Concept' : 'Initialize Generator'}
          </button>
        </div>

        <div className="mt-16 text-center max-w-lg">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-loose">
            These concepts are heuristically derived based on active Stellar ecosystem trends. Use
            them as starting points for Stellar Build hackathon registrations.
          </p>
        </div>
      </div>
    </div>
  );
}
