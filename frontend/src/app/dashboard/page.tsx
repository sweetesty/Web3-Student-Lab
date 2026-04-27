"use client";

import AuditLogList from "@/components/dashboard/AuditLogList";
import LayoutGrid from "@/components/dashboard/LayoutGrid";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutPersistence } from "@/hooks/useLayoutPersistence";
import {
    Certificate,
    certificatesAPI,
    Course,
    coursesAPI,
    Enrollment,
    enrollmentsAPI,
} from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [_enrollments, setEnrollments] = useState<Enrollment[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
  });

  const { layout, saveLayout, resetLayout } = useLayoutPersistence(user?.id);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --- Panel content definitions ---

  const statsPanel = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Available Nodes", value: stats.totalCourses },
        { label: "Active Uplinks", value: stats.enrolledCourses },
        { label: "Executed Modules", value: stats.completedCourses },
        { label: "Cryptographic Tokens", value: stats.certificates },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-3xl group-hover:bg-red-500/10 transition-colors"></div>
          <p className="text-3xl font-black text-white font-mono">{value}</p>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
            {label}
          </p>
        </div>
      ))}
    </div>
  );

  const coursesPanel = (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.slice(0, 4).map((course) => (
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
    </div>
  );

  const certificatesPanel = (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>
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
      <div className="flex flex-col gap-4">
        {certificates.length === 0 ? (
          <p className="text-gray-600 text-sm font-mono">No credentials issued yet.</p>
        ) : (
          certificates.slice(0, 3).map((cert) => (
            <Link
              key={cert.id}
              href={`/certificates/${cert.id}`}
              className="bg-black border border-red-500/20 rounded-xl p-6 hover:border-red-500/60 transition-all block group"
            >
              <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-red-100">
                {cert.course?.title || "Soroban Protocol"}
              </h4>
              <p className="text-xs font-light text-red-500/80 mt-1">
                {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  const auditPanel = (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <span className="w-4 h-4 bg-red-600 rounded-sm inline-block"></span>
          Audit Trails{" "}
          <span className="text-gray-600">[Admin Only]</span>
        </h3>
        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full">
          Live Monitoring
        </span>
      </div>
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
        <AuditLogList />
      </div>
    </div>
  );

  const panelDefs = [
    { id: "stats", content: statsPanel },
    { id: "courses", content: coursesPanel },
    { id: "certificates", content: certificatesPanel },
    { id: "audit", content: auditPanel },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="relative z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Control <span className="text-red-600">Center</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Layout edit controls */}
              {editMode ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetLayout}
                    className="px-4 py-2 text-xs font-bold text-gray-400 bg-zinc-900 border border-white/10 rounded-lg hover:border-white/30 transition-all uppercase tracking-widest"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 bg-zinc-900 border border-white/10 rounded-lg hover:border-red-500/50 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Edit Layout
                </button>
              )}

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

      {/* Edit mode banner */}
      {editMode && (
        <div className="relative z-10 bg-red-600/10 border-b border-red-500/30 px-4 py-2 text-center">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
            Layout Edit Mode — Drag panels to reorder · Click 1/2/3 to resize columns · Changes are saved automatically
          </p>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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

        <LayoutGrid
          layout={layout}
          editMode={editMode}
          panels={panelDefs}
          onLayoutChange={saveLayout}
        />
      </main>
    </div>
  );
}
