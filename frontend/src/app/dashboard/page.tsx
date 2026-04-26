"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  coursesAPI,
  certificatesAPI,
  enrollmentsAPI,
  Course,
  Certificate,
  Enrollment,
} from "@/lib/api";
import Link from "next/link";
import AuditLogList from "@/components/dashboard/AuditLogList";
import { WithSkeleton } from "@/components/ui/WithSkeleton";
import { StatCardSkeleton, CourseCardSkeleton, CertCardSkeleton } from "@/components/ui/skeletons/CardSkeleton";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [_enrollments, setEnrollments] = useState<Enrollment[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [coursesData, certificatesData, enrollmentsData] =
          await Promise.all([
            coursesAPI.getAll(),
            user
              ? certificatesAPI.getByStudentId(user.id)
              : Promise.resolve([]),
            user ? enrollmentsAPI.getByStudentId(user.id) : Promise.resolve([]),
          ]);

        setCourses(coursesData);
        setCertificates(certificatesData);
        setEnrollments(enrollmentsData);

        setStats({
          totalCourses: coursesData.length,
          enrolledCourses: enrollmentsData.length,
          completedCourses: certificatesData.length,
          certificates: certificatesData.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user]);


  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20 relative overflow-hidden">
      {/* Abstract Background Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation Layer */}
      <nav className="relative z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Control <span className="text-red-600">Center</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Active Operator
                </span>
                <span className="text-sm font-mono text-gray-300">
                  {user?.name || "Unknown Entity"}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-5 py-2.5 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 border-l-4 border-red-600 pl-6 py-2">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight">
            Terminal <span className="text-gray-500">Access Granted</span>
          </h2>
          <p className="text-gray-400 font-light text-lg tracking-wide">
            Operator{" "}
            <span className="text-white font-mono">
              {user?.name?.split(" ")[0] || "Student"}
            </span>{" "}
            — Metrics and module connections active.
          </p>
        </div>

        {/* Stats Grid */}
        <WithSkeleton
          isLoading={isLoading}
          skeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          }
        >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-3xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center group-hover:border-white/30 transition-colors">
                <svg
                  className="w-6 h-6 text-white group-hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {stats.totalCourses}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
              Available Nodes
            </p>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-3xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center group-hover:border-white/30 transition-colors">
                <svg
                  className="w-6 h-6 text-white group-hover:text-red-400"
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
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {stats.enrolledCourses}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
              Active Uplinks
            </p>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-3xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center group-hover:border-white/30 transition-colors">
                <svg
                  className="w-6 h-6 text-white group-hover:text-red-400"
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
              <p className="text-3xl font-black text-white font-mono">
                {stats.completedCourses}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
              Executed Modules
            </p>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-3xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center group-hover:border-white/30 transition-colors">
                <svg
                  className="w-6 h-6 text-white group-hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {stats.certificates}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
              Cryptographic Tokens
            </p>
          </div>
        </div>
        </WithSkeleton>

        {/* Recent Courses */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>{" "}
              Directory Nodes
            </h3>
            <Link
              href="/courses"
              className="text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors flex items-center gap-1 group"
            >
              Scan All{" "}
              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
          <WithSkeleton
            isLoading={isLoading}
            skeleton={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </div>
            }
          >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-zinc-950 border border-white/5 p-8 hover:border-red-500/30 hover:bg-zinc-900 transition-all block group relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-red-600 transition-colors"></div>
                <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-red-50">
                  {course.title}
                </h4>
                <p className="text-gray-400 font-light text-sm mb-6 line-clamp-2">
                  {course.description || "System metadata missing"}
                </p>
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <span className="text-xs font-mono text-gray-500 px-2 py-1 bg-black border border-white/10 rounded">
                    {course.credits} UNIT
                  </span>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest group-hover:text-red-400">
                    Connect
                  </span>
                </div>
              </Link>
            ))}
          </div>
          </WithSkeleton>
        </div>

        {/* My Certificates */}
        {(isLoading || certificates.length > 0) && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>{" "}
                Issued Credentials
              </h3>
              <Link
                href="/certificates"
                className="text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors flex items-center gap-1 group"
              >
                Vault{" "}
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
            </div>
            <WithSkeleton
              isLoading={isLoading}
              skeleton={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CertCardSkeleton />
                  <CertCardSkeleton />
                  <CertCardSkeleton />
                </div>
              }
            >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.slice(0, 3).map((cert) => (
                <Link
                  key={cert.id}
                  href={`/certificates/${cert.id}`}
                  className="bg-black border border-red-500/20 rounded-xl p-8 hover:border-red-500/60 shadow-[0_0_20px_rgba(220,38,38,0.05)] hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all block relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-bl-full pointer-events-none group-hover:bg-red-900/20 transition-colors"></div>
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="w-12 h-12 bg-zinc-950 border border-red-500/30 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-500"
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
                    <span className="text-xs font-mono bg-zinc-950 border border-white/10 text-gray-400 px-3 py-1 rounded">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-wide group-hover:text-red-100">
                    {cert.course?.title || "Soroban Protocol"}
                  </h4>
                  <p className="text-sm font-light text-red-500/80">
                    On-Chain Certification
                  </p>
                </Link>
              ))}
            </div>
            </WithSkeleton>
          </div>
        )}

        {/* Audit Logs Section */}
        <div className="mt-20">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>{" "}
              Audit Trails <span className="text-gray-600">[Admin Only]</span>
            </h3>
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full">
              Live Monitoring
            </span>
          </div>
          <div className="bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
            <AuditLogList />
          </div>
        </div>
      </main>
    </div>
  );
}
