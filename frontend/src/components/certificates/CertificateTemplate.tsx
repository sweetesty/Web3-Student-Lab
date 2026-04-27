"use client";

import { CertificateData, buildExplorerUrl, drawCryptoStamp, truncateHash } from "@/lib/certificate-generator";
import { useEffect, useRef } from "react";

interface Props {
  data: CertificateData;
  /** If true, renders at full resolution for download */
  forExport?: boolean;
}

export default function CertificateTemplate({ data, forExport = false }: Props) {
  const stampRef = useRef<HTMLCanvasElement>(null);

  // Draw the crypto stamp on the canvas overlay
  useEffect(() => {
    const canvas = stampRef.current;
    if (!canvas) return;
    canvas.width = 140;
    canvas.height = 140;
    drawCryptoStamp(canvas, data.transactionHash, 70, 70, 60);
  }, [data.transactionHash]);

  const formattedDate = data.issueDate
    ? new Date(data.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const explorerUrl = buildExplorerUrl(data.transactionHash);

  return (
    <div
      id="certificate-template"
      className={`relative bg-zinc-950 overflow-hidden select-none ${
        forExport ? "w-[1200px] h-[848px]" : "w-full aspect-[1200/848]"
      }`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-800/8 rounded-full blur-[100px]" />

      {/* Outer border frame */}
      <div className="absolute inset-4 border border-red-600/30 rounded-xl pointer-events-none" />
      <div className="absolute inset-6 border border-white/5 rounded-xl pointer-events-none" />

      {/* Corner ornaments */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between px-16 py-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-px bg-red-600/60" />
            <span className="text-red-500 font-mono text-xs uppercase tracking-[0.3em]">
              Web3 Student Lab
            </span>
            <div className="w-8 h-px bg-red-600/60" />
          </div>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            Blockchain-Verified Certificate of Completion
          </p>
        </div>

        {/* Main body */}
        <div className="text-center flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400 text-sm uppercase tracking-[0.25em] font-sans">
            This certifies that
          </p>

          {/* Recipient name */}
          <div className="relative">
            <h1
              className="text-5xl font-black text-white tracking-tight leading-none"
              style={{ fontFamily: "Georgia, serif", textShadow: "0 0 40px rgba(220,38,38,0.3)" }}
            >
              {data.recipientName || "Student Name"}
            </h1>
            <div className="mt-2 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />
          </div>

          <p className="text-gray-400 text-sm uppercase tracking-[0.25em] font-sans">
            has successfully completed
          </p>

          {/* Course name */}
          <h2
            className="text-3xl font-bold text-red-400 uppercase tracking-wide leading-tight max-w-2xl text-center"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {data.courseName || "Course Name"}
          </h2>

          {/* Issue date */}
          <p className="text-gray-500 text-sm font-mono tracking-widest mt-2">
            Issued on {formattedDate}
          </p>
        </div>

        {/* Footer row */}
        <div className="w-full flex items-end justify-between">
          {/* Instructor signature */}
          <div className="text-center min-w-[180px]">
            <div className="h-px bg-white/20 mb-2" />
            <p className="text-white text-sm font-bold tracking-wider">
              {data.instructorName || "Instructor"}
            </p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono">
              Course Instructor
            </p>
          </div>

          {/* Crypto stamp canvas */}
          <div className="flex flex-col items-center gap-1">
            <canvas ref={stampRef} className="w-[70px] h-[70px]" />
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500/70 font-mono text-[8px] tracking-widest hover:text-red-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {truncateHash(data.transactionHash, 8)}
            </a>
          </div>

          {/* Certificate ID */}
          <div className="text-center min-w-[180px]">
            <div className="h-px bg-white/20 mb-2" />
            <p className="text-white text-sm font-bold tracking-wider font-mono">
              {data.certificateId ? data.certificateId.slice(0, 12).toUpperCase() : "—"}
            </p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono">
              Certificate ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerOrnament({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const posClass = {
    "top-left": "top-8 left-8",
    "top-right": "top-8 right-8 rotate-90",
    "bottom-left": "bottom-8 left-8 -rotate-90",
    "bottom-right": "bottom-8 right-8 rotate-180",
  }[position];

  return (
    <div className={`absolute ${posClass} w-8 h-8 pointer-events-none`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <path d="M2 30 L2 2 L30 2" stroke="rgba(220,38,38,0.5)" strokeWidth="1.5" fill="none" />
        <path d="M2 2 L8 2" stroke="rgba(220,38,38,0.9)" strokeWidth="2" />
        <path d="M2 2 L2 8" stroke="rgba(220,38,38,0.9)" strokeWidth="2" />
      </svg>
    </div>
  );
}
