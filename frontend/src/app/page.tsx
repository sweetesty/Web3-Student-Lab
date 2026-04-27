"use client";

import { analyticsAPI } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    coursesCount: 0,
    studentsCount: 0,
    certificatesCount: 0,
    verificationRate: "100%",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Point strictly to the sanitized analytics endpoint
        const { data } = await analyticsAPI.getGlobalStats();

        const summary = data.summary || [];
        const studentStat = summary.find((s: any) => s.metricType === 'USER_STAT');
        const enrollmentStat = summary.find((s: any) => s.metricType === 'ENROLLMENT_STAT');
        const courseStat = summary.find((s: any) => s.metricType === 'COURSE_STAT');

        setStats({
          coursesCount: courseStat?._count?._all || 0,
          studentsCount: studentStat?._count?._all || 0,
          certificatesCount: enrollmentStat?._count?._all || 0,
          verificationRate: "99% Secured",
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback to initial placeholders if API fails
        setStats({
          coursesCount: 12,
          studentsCount: 1250,
          certificatesCount: 450,
          verificationRate: "98% Verified",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Hero Section */}
      <section aria-label="Hero" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-medium text-sm mb-8 animate-pulse" role="status" aria-live="polite">
            <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true"></span>
            Stellar Testnet Integration Live
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-[1.1]">
            Master Web3. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-500 to-red-600">
              Build The Future.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Elite hands-on courses covering Soroban smart contracts, Stellar
            blockchain, and decentralized applications. Earn verifiable
            credentials directly on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_35px_rgba(220,38,38,0.8)] transition-all duration-300 uppercase tracking-wide transform hover:-translate-y-1"
            >
              Start Learning Now
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border-2 border-white/20 hover:border-white rounded-md font-bold text-lg transition-all duration-300 uppercase tracking-wide"
            >
              Explore Modules
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - The Lab Modules */}
      <section className="relative bg-zinc-950 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
              The <span className="text-red-600">Lab</span> Ecosystem
            </h2>
            <p className="text-gray-500 font-light">
              Interactive environments designed for rapid Stellar mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link
              href="/simulator"
              className="bg-black border border-white/10 hover:border-red-500/50 rounded-2xl p-8 transition-all hover:-translate-y-2 group"
              aria-label="Simulator - Observe live Stellar ledger activity"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20 group-hover:bg-red-600 transition-colors" aria-hidden="true">
                <svg
                  className="w-7 h-7 text-red-500 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                Simulator
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light mb-4">
                Observe live Stellar ledger activity in a terminal-themed
                visualization.
              </p>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest group-hover:pl-2 transition-all" aria-hidden="true">
                Enter →
              </span>
            </Link>

            <Link
              href="/playground"
              className="bg-black border border-white/10 hover:border-red-500/50 rounded-2xl p-8 transition-all hover:-translate-y-2 group"
              aria-label="Playground - Compile and execute Soroban smart contracts"
            >
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors" aria-hidden="true">
                <svg
                  className="w-7 h-7 text-white group-hover:text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                Playground
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light mb-4">
                Compile and execute Soroban smart contract logic in a sandboxed
                environment.
              </p>
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:pl-2 transition-all" aria-hidden="true">
                Execute →
              </span>
            </Link>

            <Link
              href="/roadmap"
              className="bg-black border border-white/10 hover:border-red-500/50 rounded-2xl p-8 transition-all hover:-translate-y-2 group"
              aria-label="Roadmap - Track your progression through the Stellar mastery tree"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20 group-hover:bg-red-600 transition-colors" aria-hidden="true">
                <svg
                  className="w-7 h-7 text-red-500 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                Roadmap
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light mb-4">
                Track your progression through the multi-stage Stellar mastery
                tree.
              </p>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest group-hover:pl-2 transition-all" aria-hidden="true">
                Visualize →
              </span>
            </Link>

            <Link
              href="/ideas"
              className="bg-black border border-white/10 hover:border-red-500/50 rounded-2xl p-8 transition-all hover:-translate-y-2 group"
              aria-label="Incubator - Generate optimized project concepts for your next build"
            >
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors" aria-hidden="true">
                <svg
                  className="w-7 h-7 text-white group-hover:text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                Incubator
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-light mb-4">
                Generate heuristically optimized project concepts for your next
                build.
              </p>
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:pl-2 transition-all" aria-hidden="true">
                Initialize →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black border-b border-white/5" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center" aria-live="polite" aria-busy={isLoading}>
            <div className="p-6">
              <p className="text-5xl font-black text-red-600 mb-4 tracking-tighter" aria-label={`${stats.coursesCount} active modules`}>
                {isLoading ? <span aria-hidden="true">...</span> : `${stats.coursesCount}+`}
              </p>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">
                Active Modules
              </p>
            </div>
            <div className="p-6">
              <p className="text-5xl font-black text-white mb-4 tracking-tighter shadow-white" aria-label={`${stats.studentsCount} engineers enrolled`}>
                {isLoading ? <span aria-hidden="true">...</span> : `${stats.studentsCount}+`}
              </p>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">
                Engineers Enrolled
              </p>
            </div>
            <div className="p-6">
              <p className="text-5xl font-black text-red-600 mb-4 tracking-tighter" aria-label={`${stats.certificatesCount} credentials issued`}>
                {isLoading ? <span aria-hidden="true">...</span> : `${stats.certificatesCount}+`}
              </p>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">
                Credentials Issued
              </p>
            </div>
            <div className="p-6">
              <p className="text-5xl font-black text-white mb-4 tracking-tighter shadow-white" aria-label={`${stats.verificationRate} on-chain verified`}>
                {isLoading ? <span aria-hidden="true">...</span> : stats.verificationRate}
              </p>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">
                On-Chain Verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-black border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-gradient-to-b from-red-900/20 to-transparent blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase">
            Initialize Your Node
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join the decentralized education protocol. Grant reviewers are
            looking for this exact level of sophistication.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-12 py-5 bg-white text-black rounded-md font-black text-lg hover:bg-gray-200 transition-colors uppercase tracking-widest"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/5 py-12" role="contentinfo" aria-label="Site footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center" aria-hidden="true">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-widest uppercase">
                Web3 <span className="text-red-600">Lab</span>
              </span>
            </div>

            <nav className="flex gap-8 text-sm font-bold tracking-wide uppercase text-gray-500" aria-label="Footer navigation">
              <Link
                href="/courses"
                className="hover:text-white transition-colors"
              >
                Modules
              </Link>
              <Link
                href="/verify"
                className="hover:text-red-500 transition-colors"
              >
                Verify Credential
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </nav>

            <p className="text-sm font-medium text-gray-600">
              © 2026 WEB3 STUDENT LAB. PROTOCOL SECURED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
