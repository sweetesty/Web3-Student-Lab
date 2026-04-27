"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Certificate, certificatesAPI } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CertificatesVaultPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function loadVault() {
      try {
        const data = await certificatesAPI.getByStudentId(user!.id);
        setCertificates(data);
      } catch (error) {
        console.error("Failed to load vault:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadVault();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-500 font-mono uppercase tracking-widest text-sm">
            Decrypting Vault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white p-8 md:p-12 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 border-l-4 border-red-600 pl-6 py-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
            Cryptographic <span className="text-red-500">Vault</span>
          </h1>
          <p className="text-gray-400 font-light text-lg tracking-wide uppercase font-mono text-sm">
            Stored assets for Operator:{" "}
            <span className="text-white">{user?.name}</span>
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-zinc-950 border border-white/10 p-12 text-center rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.05)]">
            <div className="w-20 h-20 bg-black border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">
              Vault Empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              No cryptographic tokens found on-chain for this operator. Connect
              to a learning node to begin extracting credentials.
            </p>
            <Link
              href="/courses"
              className="inline-block px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Scan Nodes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.id}`}
                className="group relative bg-zinc-950 border border-red-500/20 rounded-2xl p-8 hover:border-red-500/60 shadow-[0_0_20px_rgba(220,38,38,0.05)] hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all block overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-bl-full pointer-events-none group-hover:bg-red-900/30 transition-colors"></div>
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 bg-black border border-red-500/30 rounded-2xl flex items-center justify-center shadow-inner">
                    <svg
                      className="w-8 h-8 text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                      Mint Date
                    </span>
                    <span className="text-xs font-mono bg-black border border-white/10 text-gray-300 px-3 py-1.5 rounded">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight leading-tight group-hover:text-red-50 transition-colors">
                  {cert.course?.title || "Unknown Protocol"}
                </h2>
                <div className="text-sm font-mono text-red-500/80 mb-6 truncate">
                  TX:{" "}
                  {cert.certificateHash
                    ? truncateHash(cert.certificateHash, 8)
                    : "PENDING"}
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                    Web3 Lab Identity
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/certificates/generate?id=${cert.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-red-600 hover:text-red-400 uppercase tracking-widest transition-colors"
                    >
                      Download ↓
                    </Link>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest group-hover:text-red-400 flex items-center gap-1">
                      Inspect{" "}
                      <span className="transform group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
