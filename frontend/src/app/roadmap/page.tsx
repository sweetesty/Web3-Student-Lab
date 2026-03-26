'use client';

import { useState } from 'react';

const NODES = [
  {
    id: 1,
    title: 'Foundations',
    desc: 'Ledger basics, accounts, and trustlines.',
    status: 'COMPLETED',
    x: '50%',
    y: '10%',
  },
  {
    id: 2,
    title: 'Assets & SDEX',
    desc: 'Issuing tokens and liquidity pools.',
    status: 'IN_PROGRESS',
    x: '30%',
    y: '35%',
  },
  {
    id: 3,
    title: 'Soroban 101',
    desc: 'Rust smart contracts and WASM.',
    status: 'LOCKED',
    x: '70%',
    y: '35%',
  },
  {
    id: 4,
    title: 'Advanced DeFi',
    desc: 'Flash loans and cross-chain hooks.',
    status: 'LOCKED',
    x: '50%',
    y: '60%',
  },
  {
    id: 5,
    title: 'Protocol Expert',
    desc: 'Core architecture and consensus.',
    status: 'LOCKED',
    x: '50%',
    y: '85%',
  },
];

export default function RoadmapPage() {
  const [activeNode, setActiveNode] = useState(NODES[1]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white p-6 md:p-12 relative overflow-hidden font-mono">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <div className="max-w-7xl mx-auto h-full flex flex-col items-center">
        {/* Header */}
        <div className="mb-16 text-center border-b border-red-600/20 pb-8 w-full">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            Technical <span className="text-red-500">Roadmap</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
            Module Hierarchy & Skill Acquisition Tree
          </p>
        </div>

        <div className="relative w-full max-w-4xl aspect-[4/5] md:aspect-video flex items-center justify-center bg-zinc-950/20 border border-white/5 rounded-[3rem] p-12 overflow-hidden shadow-inner">
          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line
              x1="50%"
              y1="10%"
              x2="30%"
              y2="35%"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <line
              x1="50%"
              y1="10%"
              x2="70%"
              y2="35%"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <line
              x1="30%"
              y1="35%"
              x2="50%"
              y2="60%"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <line
              x1="70%"
              y1="35%"
              x2="50%"
              y2="60%"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <line
              x1="50%"
              y1="60%"
              x2="50%"
              y2="85%"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4"
            />
          </svg>

          {/* Nodes */}
          {NODES.map((node) => (
            <button
              key={node.id}
              onClick={() => setActiveNode(node)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 group ${
                activeNode.id === node.id ? 'scale-125 z-20' : 'z-10 bg-black'
              } ${
                node.status === 'COMPLETED'
                  ? 'border-green-500 bg-green-500/10'
                  : node.status === 'IN_PROGRESS'
                    ? 'border-red-600 bg-red-600/10 animate-pulse'
                    : 'border-zinc-800 bg-zinc-900 opacity-60'
              }`}
              style={{ left: node.x, top: node.y }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  node.status === 'COMPLETED'
                    ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                    : node.status === 'IN_PROGRESS'
                      ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                      : 'bg-zinc-700'
                }`}
              ></div>

              {/* Tooltip Label */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 border border-white/10 px-2 py-1 rounded">
                  {node.title}
                </span>
              </div>
            </button>
          ))}

          {/* Active Detail Overlay */}
          <div className="absolute bottom-10 left-10 right-10 md:left-auto md:w-80 md:right-10 bg-zinc-950 border border-red-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-4">
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                  activeNode.status === 'COMPLETED'
                    ? 'bg-green-500/10 text-green-500 border-green-500/30'
                    : activeNode.status === 'IN_PROGRESS'
                      ? 'bg-red-500/10 text-red-500 border-red-500/30'
                      : 'bg-zinc-800 text-gray-500 border-white/5'
                }`}
              >
                {activeNode.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-gray-600 font-bold">NODE_0{activeNode.id}</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-white">
              {activeNode.title}
            </h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
              {activeNode.desc}
            </p>
            <button
              className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeNode.status === 'LOCKED'
                  ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-500 active:scale-95'
              }`}
            >
              {activeNode.status === 'COMPLETED'
                ? 'Review Protocol'
                : activeNode.status === 'IN_PROGRESS'
                  ? 'Initiate Node'
                  : 'Node Locked'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center max-w-2xl px-8">
          <p className="text-xs text-gray-600 font-light uppercase tracking-widest border-t border-white/5 pt-8">
            Interactive Roadmap visualized in real-time. Progress synced to your encrypted operator
            profile. Reach <span className="text-red-500 font-bold">Expert Tier</span> to unlock
            dark-mode advanced governance modules.
          </p>
        </div>
      </div>
    </div>
  );
}
