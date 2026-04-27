"use client";

import { Certificate, certificatesAPI } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext"; // Reserved for future auth features

export default function CertificateNFTPage() {
  const params = useParams();
  const router = useRouter();
  // const { user } = useAuth(); // Uncomment when user context is needed
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    hash?: string;
  } | null>(null);

  useEffect(() => {
    async function loadCertificate() {
      try {
        const data = await certificatesAPI.getById(params.id as string);
        setCertificate(data);
      } catch (error) {
        console.error("Failed to load certificate:", error);
        router.push("/certificates");
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificate();
  }, [params.id, router]);

  const verifyOnChain = async () => {
    if (!certificate) return;
    setIsVerifying(true);
    try {
      const result = await certificatesAPI.verifyOnChain(certificate.id);
      setVerificationResult(result);
    } catch (error) {
      console.error("Failed to verify:", error);
      alert("Network error during cryptographic verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-500 font-mono uppercase tracking-widest text-sm">
            Decoding Token Asset...
          </p>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
        {/* NFT Asset Card Column */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative group perspective-1000 w-full max-w-sm">
            {/* Ambient Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>

            {/* The Asset Itself */}
            <div className="relative bg-zinc-950 border border-white/20 rounded-[2rem] p-8 aspect-[3/4] flex flex-col justify-between shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 rounded-[2rem] mix-blend-overlay pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div className="text-right">
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest leading-tight">
                    Testnet
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-tight">
                    Soroban
                  </p>
                </div>
              </div>

              <div className="relative z-10 text-center my-8">
                <div className="inline-block p-4 rounded-full bg-black border border-white/10 shadow-inner mb-6">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                  Web3 Lab
                </h3>
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest">
                  Op. Credential
                </h4>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-4 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                    Holder Identity
                  </p>
                  <p className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[150px]">
                    {certificate.student?.name || "Unknown Operator"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                    Mint Date
                  </p>
                  <p className="text-xs font-mono text-white tracking-widest">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <Link
              href="/certificates"
              className="text-gray-500 hover:text-red-500 uppercase text-xs font-bold tracking-widest mb-6 inline-flex items-center gap-2 group transition-colors"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>{" "}
              Back to Vault
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
              {certificate.course?.title || "Unknown Protocol"}
            </h1>
            <p className="text-red-500 font-mono tracking-widest uppercase text-sm mb-6">
              Non-Fungible Certification
            </p>
            <p className="text-gray-400 font-light text-lg">
              This cryptographic token proves execution and mastery of the
              linked learning module. It exists immutably on the Stellar
              blockchain network.
            </p>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
              Token Metadata
            </h3>

            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center bg-black border border-white/5 p-3 rounded">
                <span className="text-gray-500">Asset ID</span>
                <span className="text-gray-300">{certificate.id}</span>
              </div>
              <div className="flex justify-between items-center bg-black border border-white/5 p-3 rounded">
                <span className="text-gray-500">Transaction Hash</span>
                <span className="text-red-400 break-all ml-4 text-right">
                  {certificate.certificateHash || "Pending confirmation"}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black border border-white/5 p-3 rounded">
                <span className="text-gray-500">Contract</span>
                <span className="text-gray-300 truncate max-w-[200px]">
                  CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                </span>
              </div>
              <div className="flex justify-between items-center bg-black border border-white/5 p-3 rounded">
                <span className="text-gray-500">Status</span>
                <span className="text-green-500 font-bold uppercase tracking-widest">
                  {certificate.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={verifyOnChain}
              disabled={isVerifying}
              className={`flex-1 py-4 font-black uppercase tracking-widest rounded-xl transition-all ${
                isVerifying
                  ? "bg-zinc-800 text-gray-500 cursor-wait"
                  : "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              }`}
            >
              {isVerifying ? "Polling Network..." : "Verify On-Chain"}
            </button>
            <Link
              href={`/certificates/generate?id=${certificate.id}`}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Link>
          </div>

          {verificationResult && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center animate-pulse mt-4">
              <p className="text-green-500 font-bold uppercase tracking-widest text-sm mb-1">
                Asset Verified
              </p>
              <p className="text-xs text-green-400/70 font-mono">
                Found immutable match on network nodes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
