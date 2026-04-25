'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnrollmentWizard } from '@/components/enrollment/EnrollmentWizard';
import { enrollmentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function EnrollmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [courseId, setCourseId] = useState<string | undefined>();
  const [courseTitle, setCourseTitle] = useState<string | undefined>();
  const [courseCredits, setCourseCredits] = useState<number | undefined>();
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('courseId');
    const title = searchParams.get('courseTitle');
    const credits = searchParams.get('credits');

    if (id) setCourseId(id);
    if (title) setCourseTitle(decodeURIComponent(title));
    if (credits) setCourseCredits(parseInt(credits, 10));

    async function loadUserData() {
      if (user?.id) {
        try {
          const enrollments = await enrollmentsAPI.getByStudentId(user.id);
          const completed = enrollments
            .filter((e) => e.status === 'completed')
            .map((e) => e.courseId);
          setCompletedCourses(completed);
        } catch (error) {
          console.error('Failed to load user enrollments:', error);
        }
      }
      setIsLoading(false);
    }

    loadUserData();
  }, [searchParams, user]);

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-500 font-mono uppercase tracking-widest text-sm">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
        <div className="text-center bg-zinc-950 border border-red-500/50 p-12 rounded-2xl max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
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
            Authentication Required
          </h2>
          <p className="text-zinc-400 mb-8">
            Please sign in to enroll in courses and track your progress.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Courses
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-medium text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Multi-Step Enrollment
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Course Enrollment
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Complete the 5-step wizard to customize your learning experience. Your progress is
            automatically saved every 30 seconds.
          </p>
        </div>

        <EnrollmentWizard
          initialCourseId={courseId}
          initialCourseTitle={courseTitle}
          initialCourseCredits={courseCredits}
          coursePrerequisites={[]}
          completedCourseIds={completedCourses}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-red-500 font-mono uppercase tracking-widest text-sm">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <EnrollmentContent />
    </Suspense>
  );
}
