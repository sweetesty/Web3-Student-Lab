"use client";

import { useAuth } from "@/contexts/AuthContext";
import { certificatesAPI, Course, coursesAPI, enrollmentsAPI } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await coursesAPI.getById(params.id as string);
        setCourse(data);

        // Check if user is enrolled
        if (user) {
          const enrollments = await enrollmentsAPI.getByStudentId(user.id);
          const enrolled = enrollments.some(
            (enrollment) => enrollment.courseId === data.id,
          );
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to load course:", error);
        router.push("/courses");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourse();
  }, [params.id, user, router]);

  const handleEnroll = () => {
    if (!user || !course) return;

    router.push(
      `/enroll?courseId=${encodeURIComponent(course.id)}&courseTitle=${encodeURIComponent(course.title)}&credits=${course.credits}`
    );
  };

  const handleMintCertificate = async () => {
    if (!user || !course) return;
    setIsMinting(true);
    try {
      // The mock API requires an object mapping. Assuming certificatesAPI.issue accepts payload.
      await certificatesAPI.issue({ studentId: user.id, courseId: course.id });
      setMintSuccess(true);
      setTimeout(() => router.push("/certificates"), 2000);
    } catch (error) {
      console.error("Failed to mint:", error);
      alert("Failed to mint cryptographic token. It may already exist.");
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-500 font-mono uppercase tracking-widest text-sm">
            Loading Header Data...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center bg-zinc-950 border border-red-500/50 p-12 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.2)]">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">
            Node Not Found
          </h2>
          <Link
            href="/courses"
            className="text-red-500 hover:text-red-400 uppercase text-sm font-bold tracking-widest flex items-center justify-center gap-2 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>{" "}
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white pb-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative border-b border-white/10 bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/courses"
            className="text-gray-500 hover:text-red-500 uppercase text-xs font-bold tracking-widest mb-8 inline-flex items-center gap-2 group transition-colors"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>{" "}
            Network Directory
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono uppercase tracking-widest rounded-full mb-4">
                Module Initialization
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-red-50 transition-colors">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-400 font-mono text-sm uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                  Instructor:{" "}
                  <span className="text-white">{course.instructor}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Payload:{" "}
                  <span className="text-white">{course.credits} UNIT</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-colors">
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>{" "}
                Protocol Specifications
              </h2>
              <p className="text-gray-400 font-light text-lg leading-relaxed mb-8">
                {course.description ||
                  "System metadata missing. Awaiting curriculum upload."}
              </p>

              <div className="border-t border-white/10 pt-8 mt-8">
                <h3 className="text-lg font-bold text-gray-300 mb-6 uppercase tracking-widest">
                  Execution Objectives
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 text-gray-400">
                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20 mt-0.5">
                      <svg
                        className="w-3 h-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      Mastery of core decentralized computing paradigms
                    </span>
                  </li>
                  <li className="flex items-start gap-4 text-gray-400">
                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20 mt-0.5">
                      <svg
                        className="w-3 h-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      Direct compilation and deployment of Soroban contracts
                    </span>
                  </li>
                  <li className="flex items-start gap-4 text-gray-400">
                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20 mt-0.5">
                      <svg
                        className="w-3 h-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>
                      Secure state manipulation on the Stellar testnet
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Dummy Video Player Space */}
            <div className="bg-black border border-white/10 rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors z-0"></div>
              <div className="w-20 h-20 bg-zinc-900 border border-red-500/30 rounded-full flex items-center justify-center mb-4 z-10 shadow-[0_0_30px_rgba(220,38,38,0.2)] group-hover:scale-110 transition-transform cursor-pointer">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-red-500 border-b-[12px] border-b-transparent ml-2"></div>
              </div>
              <p className="text-gray-500 font-mono text-sm uppercase tracking-widest z-10">
                Stream Encrypted Feed
              </p>
            </div>
          </div>

          {/* Action / Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] sticky top-28">
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">
                Connection Status
              </h3>

              {isEnrolled ? (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-green-500 font-bold uppercase tracking-widest text-sm mb-1">
                      Uplink Active
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      Module execution in progress...
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm font-light mb-4">
                      Completed the curriculum? Execute the smart contract below
                      to mint your verifiable credential on the Stellar
                      blockchain.
                    </p>

                    {mintSuccess ? (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center animate-pulse">
                        <p className="text-blue-500 font-bold uppercase tracking-widest text-sm">
                          Token Minted
                        </p>
                        <p className="text-xs text-blue-400/70 font-mono mt-1">
                          Redirecting to Vault...
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleMintCertificate}
                        disabled={isMinting}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] ${
                          isMinting
                            ? "bg-red-900 text-gray-500 cursor-not-allowed border border-red-900"
                            : "bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5"
                        }`}
                      >
                        {isMinting ? "Compiling tx..." : "Extract Certificate"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleEnroll}
                    disabled={!user}
                    className={`w-full py-5 rounded-xl font-black uppercase tracking-widest transition-all ${
                      !user
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10"
                        : "bg-white text-black hover:bg-gray-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {!user ? "Auth Required" : "Start Enrollment"}
                  </button>
                  <p className="text-xs text-gray-500 font-mono mt-4 text-center">
                    5-step wizard with progress saving
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-2 text-center">
                    NO GAS FEES • PUBLIC TESTNET
                  </p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 uppercase tracking-widest">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Asynchronous Execution
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 uppercase tracking-widest">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    On-chain Verification
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 uppercase tracking-widest">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Encrypted Payload
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
