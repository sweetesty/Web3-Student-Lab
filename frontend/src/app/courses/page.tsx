"use client";

import { Course, coursesAPI } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await coursesAPI.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-zinc-950 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-medium text-xs mb-4 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Active Curriculum
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                Modules
              </h1>
              <p className="text-gray-400 font-light text-lg">
                Master Soroban and Stellar via hands-on progression
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 text-sm font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-red-500/50 hover:text-red-500 transition-all uppercase tracking-wide flex items-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>{" "}
              Access Control
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Abstract Glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Search Bar */}
        <div className="mb-12 relative z-10">
          <div className="relative max-w-xl">
            <label htmlFor="course-search" className="sr-only">Search courses</label>
            <input
              id="course-search"
              type="search"
              placeholder="SEARCH NODE DIRECTORY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-xl border border-white/20 bg-black text-white font-mono focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors uppercase tracking-wide placeholder-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              aria-label="Search courses by title or description"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-red-600"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="relative z-10">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-2xl bg-zinc-950/50 backdrop-blur-sm" role="status">
              <div className="w-20 h-20 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20" aria-hidden="true">
                <svg
                  className="h-10 w-10 text-red-500"
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
              <h3 className="mt-2 text-xl font-black text-white uppercase tracking-widest">
                No Modules Found
              </h3>
              <p className="mt-2 text-gray-500 font-light">
                {searchTerm
                  ? "Adjust query parameters"
                  : "Environment uninitialized"}
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              aria-live="polite"
              aria-label={`${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} found`}
            >
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group bg-zinc-950 border border-white/10 rounded-2xl p-8 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  aria-label={`${course.title} - ${course.credits} credits, taught by ${course.instructor}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-[100px] pointer-events-none group-hover:bg-red-600/10 transition-colors" aria-hidden="true"></div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="w-14 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-colors" aria-hidden="true">
                      <svg
                        className="w-7 h-7 text-white group-hover:text-red-500 transition-colors"
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
                    <span className="text-xs font-bold font-mono tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-full uppercase">
                      {course.credits} Cr
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-red-50 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 font-light text-sm mb-8 line-clamp-2 flex-grow">
                    {course.description || "System metadata missing"}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {course.instructor}
                    </span>
                    <span className="inline-flex items-center gap-2 text-red-500 font-bold uppercase text-xs tracking-widest group-hover:text-red-400 transition-colors" aria-hidden="true">
                      Enter Node{" "}
                      <span className="transform group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
