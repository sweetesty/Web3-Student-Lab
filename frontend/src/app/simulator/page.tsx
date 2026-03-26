'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  source: string;
  op: string;
  amount?: string;
  asset?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  time: string;
}

interface Ledger {
  sequence: number;
  txCount: number;
  hash: string;
  time: string;
}

export default function SimulatorPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate fake live data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // 10% chance of a new ledger
      if (Math.random() > 0.9) {
        const newLedger: Ledger = {
          sequence: (ledgers[0]?.sequence || 524000) + 1,
          txCount: Math.floor(Math.random() * 15) + 1,
          hash: Math.random().toString(16).substring(2, 10).toUpperCase() + '...',
          time: new Date().toLocaleTimeString(),
        };
        setLedgers((prev) => [newLedger, ...prev].slice(0, 10));

        // Generate transactions for this ledger
        for (let i = 0; i < newLedger.txCount; i++) {
          const ops = [
            'PAYMENT',
            'MANAGE_OFFER',
            'CHANGE_TRUST',
            'INVOKE_HOST_FUNCTION',
            'CREATE_ACCOUNT',
          ];
          const assets = ['XLM', 'USDC', 'EURC', 'AQUA'];
          const newTx: Transaction = {
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            source: 'G' + Math.random().toString(36).substring(2, 12).toUpperCase() + '...',
            op: ops[Math.floor(Math.random() * ops.length)],
            amount: (Math.random() * 1000).toFixed(2),
            asset: assets[Math.floor(Math.random() * assets.length)],
            status: Math.random() > 0.05 ? 'SUCCESS' : 'FAILED',
            time: new Date().toLocaleTimeString(),
          };
          setTransactions((prev) => [newTx, ...prev].slice(0, 50));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ledgers, isLive]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white p-6 md:p-12 relative overflow-hidden font-mono">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="border-l-4 border-red-600 pl-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Network <span className="text-red-500">Simulator</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Real-time Stellar Ledger Observer [v4.2.0]
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded">
              <div
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              ></div>
              <span className="text-[10px] uppercase font-bold tracking-widest">
                {isLive ? 'Live Feed' : 'Paused'}
              </span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              {isLive ? 'Stop Sync' : 'Start Sync'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
          {/* Recent Ledgers */}
          <div className="lg:col-span-1 bg-zinc-950 border border-white/10 p-6 rounded-2xl flex flex-col shadow-2xl">
            <h3 className="text-sm font-bold border-b border-white/10 pb-4 mb-6 uppercase tracking-widest flex items-center justify-between">
              Ledger Chain
              <span className="text-[10px] text-gray-600 font-normal">History [10]</span>
            </h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {ledgers.length === 0 && (
                <p className="text-gray-700 italic text-xs">Awaiting first ledger pulse...</p>
              )}
              {ledgers.map((l) => (
                <div
                  key={l.sequence}
                  className="p-4 bg-black border-l-2 border-red-600 border-r border-t border-b border-white/5 rounded-r group hover:border-red-500/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-500 font-black text-sm">#{l.sequence}</span>
                    <span className="text-[10px] text-gray-500">{l.time}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">
                      TXS: <span className="text-white italic">{l.txCount}</span>
                    </span>
                    <span className="text-gray-600 font-mono">{l.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Transaction Stream */}
          <div className="lg:col-span-2 bg-zinc-950 border border-white/10 p-6 rounded-2xl flex flex-col shadow-2xl min-h-[500px]">
            <h3 className="text-sm font-bold border-b border-white/10 pb-4 mb-6 uppercase tracking-widest flex items-center justify-between">
              Transaction Stream
              <span className="text-[10px] text-gray-600 font-normal">Active Memory [50]</span>
            </h3>
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="text-gray-600 border-b border-white/5 uppercase tracking-widest">
                    <th className="pb-3 font-normal">Hash</th>
                    <th className="pb-3 font-normal">Operation</th>
                    <th className="pb-3 font-normal">Asset/Amt</th>
                    <th className="pb-3 font-normal">Account</th>
                    <th className="pb-3 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 text-red-500 font-bold tracking-tighter">{tx.id}</td>
                      <td className="py-3 font-bold text-gray-300">{tx.op}</td>
                      <td className="py-3 font-mono">
                        {tx.amount} <span className="text-gray-600">{tx.asset}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-[10px]">{tx.source}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            tx.status === 'SUCCESS'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                              : 'bg-red-500/10 text-red-500 border border-red-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-700 italic">
                        No incoming packets detected. Sync with global nodes to start data
                        reception.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}
