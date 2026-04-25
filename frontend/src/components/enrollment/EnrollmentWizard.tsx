'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnrollmentWizard } from '@/hooks/useEnrollmentWizard';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { Step1CourseSelection } from './Step1CourseSelection';
import { Step2Prerequisites } from './Step2Prerequisites';
import { Step3Goals } from './Step3Goals';
import { Step4Schedule } from './Step4Schedule';
import { Step5Confirmation } from './Step5Confirmation';
import { enrollmentsAPI, Enrollment } from '@/lib/api';
import { CourseWithPrerequisites } from '@/lib/enrollment/types';

interface EnrollmentWizardProps {
  initialCourseId?: string;
  initialCourseTitle?: string;
  initialCourseCredits?: number;
  coursePrerequisites?: string[];
  completedCourseIds?: string[];
  onComplete?: (enrollment: Enrollment) => void;
  onCancel?: () => void;
}

export function EnrollmentWizard({
  initialCourseId,
  initialCourseTitle,
  initialCourseCredits,
  coursePrerequisites = [],
  completedCourseIds = [],
  onComplete,
  onCancel,
}: EnrollmentWizardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const course: CourseWithPrerequisites | undefined = initialCourseId
    ? {
        id: initialCourseId,
        title: initialCourseTitle || '',
        credits: initialCourseCredits || 0,
        prerequisites: coursePrerequisites,
        instructor: '',
        estimatedHours: 40,
        difficulty: 'intermediate',
      }
    : undefined;

  const wizard = useEnrollmentWizard({
    course,
    completedCourseIds,
  });

  const handleSubmit = async () => {
    const validation = wizard.validateCurrentStep();
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const studentId = 'current-user';
      const enrollment = await enrollmentsAPI.enroll(
        studentId,
        wizard.state.steps.step1_courseSelection.selectedCourseId
      );

      wizard.clearSavedState();
      onComplete?.(enrollment);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to complete enrollment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepErrors = useCallback(
    (step: number): string[] => {
      return wizard.state.validationErrors[`step${step}`] || [];
    },
    [wizard.state.validationErrors]
  );

  const renderCurrentStep = () => {
    const stepProps = {
      errors: getStepErrors(wizard.currentStep),
    };

    switch (wizard.currentStep) {
      case 1:
        return (
          <Step1CourseSelection
            data={wizard.state.steps.step1_courseSelection}
            onUpdate={wizard.updateStep1}
            {...stepProps}
          />
        );
      case 2:
        return (
          <Step2Prerequisites
            data={wizard.state.steps.step2_prerequisites}
            onUpdate={wizard.updateStep2}
            coursePrerequisites={coursePrerequisites}
            completedCourseIds={completedCourseIds}
            {...stepProps}
          />
        );
      case 3:
        return (
          <Step3Goals
            data={wizard.state.steps.step3_goals}
            onUpdate={wizard.updateStep3}
            {...stepProps}
          />
        );
      case 4:
        return (
          <Step4Schedule
            data={wizard.state.steps.step4_schedule}
            onUpdate={wizard.updateStep4}
            {...stepProps}
          />
        );
      case 5:
        return (
          <Step5Confirmation
            data={wizard.state.steps.step5_confirmation}
            wizardState={wizard.state}
            onUpdate={wizard.updateStep5}
            {...stepProps}
          />
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    'Course Selection',
    'Prerequisites Check',
    'Learning Goals',
    'Schedule Planning',
    'Confirmation',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {showResumePrompt ? (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Resume Enrollment?</h2>
              <p className="text-zinc-400 mb-6">
                You have an unfinished enrollment from{' '}
                {wizard.lastSaved
                  ? new Date(wizard.lastSaved).toLocaleDateString()
                  : 'previously'}
                . Would you like to continue where you left off?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    wizard.resume();
                    setShowResumePrompt(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={() => {
                    wizard.reset();
                    setShowResumePrompt(false);
                  }}
                  className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <WizardProgress
                currentStep={wizard.currentStep}
                totalSteps={5}
                stepLabels={stepTitles}
              />
            </div>

            <div className="p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wizard.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCurrentStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {submitError}
                </p>
              </motion.div>
            )}

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
              <WizardNavigation
                canGoBack={wizard.canGoBack}
                canProceed={wizard.validationResult.isValid}
                isFirstStep={wizard.isFirstStep}
                isLastStep={wizard.isLastStep}
                onBack={wizard.prevStep}
                onNext={() => {
                  wizard.validateCurrentStep();
                  wizard.nextStep();
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {wizard.lastSaved && (
              <div className="px-6 pb-4 text-center">
                <p className="text-zinc-600 text-xs">
                  Auto-saved: {new Date(wizard.lastSaved).toLocaleTimeString()}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
