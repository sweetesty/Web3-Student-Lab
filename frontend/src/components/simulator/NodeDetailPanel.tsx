import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ExternalLink, Shield, Wallet, X } from 'lucide-react';
import React from 'react';
import { NetworkNode } from '../../lib/visualization/ForceSimulation';

interface NodeDetailPanelProps {
  node: NetworkNode;
  onClose: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-0 right-0 w-80 h-full bg-black/80 backdrop-blur-xl border-l border-white/10 z-30 p-6 flex flex-col gap-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Account details for ${node.label || node.id}`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500" id="node-detail-title">Account Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded"
            aria-label="Close account details panel"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold" id="public-key-label">Public Key</span>
          <div
            className="bg-zinc-900 border border-white/5 p-3 rounded font-mono text-[10px] break-all text-gray-300 flex items-center justify-between group"
            aria-labelledby="public-key-label"
          >
            <span>{node.id}</span>
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" aria-hidden="true" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
            <Wallet size={16} className="text-blue-500" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-black">Balance</span>
              <span className="text-sm font-black text-white italic">
                1,240.50 <span className="text-[10px] text-gray-600 not-italic">XLM</span>
              </span>
            </div>
          </div>
          <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
            <Activity size={16} className="text-green-500" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-black">Operations</span>
              <span className="text-sm font-black text-white italic">42</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500 flex items-center gap-2">
            <Shield size={12} aria-hidden="true" />
            Security Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Multi-sig</span>
              <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold">ENABLED</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Account Flags</span>
              <span className="text-white font-bold italic">AUTH_REQUIRED</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-colors rounded"
            aria-label={`View account ${node.label || node.id} on Stellar Explorer`}
          >
            View on Explorer
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
