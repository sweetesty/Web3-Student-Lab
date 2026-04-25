'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Confirmation, EnrollmentWizardState } from '@/lib/enrollment/types';

interface Step5ConfirmationProps {
  data: Confirmation;
  wizardState: EnrollmentWizardState;
  onUpdate: (data: Partial<Confirmation>) => void;
  errors: string[];
}

export function Step5Confirmation({
  data,
  wizardState,
  onUpdate,
  errors,
}: Step5ConfirmationProps) {
  const [showDetails, setShowDetails] = useState(true);

  const { step1_courseSelection, step2_prerequisites, step3_goals, step4_schedule } =
    wizardState.steps;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          Confirm Enrollment
        </h2>
        <p className="text-zinc-400 text-sm">
          Review your selections and complete your enrollment
        </p>
      </div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          {errors.map((error, index) => (
            <p key={index} className="text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          ))}
        </motion.div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-between px-4"
      >
        <span className="font-medium">Enrollment Summary</span>
        <svg
          className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Course Selection
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Course:</span>
                <span className="text-white font-medium">
                  {step1_courseSelection.selectedCourseTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Credits:</span>
                <span className="text-white">{step1_courseSelection.selectedCourseCredits}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Prerequisites Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Skill Assessment:</span>
                <span className={step2_prerequisites.hasRequiredSkills ? 'text-green-400' : 'text-amber-400'}>
                  {step2_prerequisites.skillAssessmentScore > 0
                    ? `${step2_prerequisites.skillAssessmentScore}%`
                    : 'Prerequisites met'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Prep Materials:</span>
                <span className={step2_prerequisites.prepMaterialsViewed ? 'text-green-400' : 'text-zinc-500'}>
                  {step2_prerequisites.prepMaterialsViewed ? 'Viewed' : 'Optional'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs">
                3
              </span>
              Learning Plan
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Pace:</span>
                <span className="text-white capitalize">{step3_goals.pace}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Weekly Hours:</span>
                <span className="text-white">{step3_goals.estimatedHoursPerWeek}h</span>
              </div>
              <div>
                <span className="text-zinc-400">Objectives:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {step3_goals.objectives.map((obj) => (
                    <span key={obj} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs">
                4
              </span>
              Schedule
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Study Days:</span>
                <span className="text-white">{step4_schedule.preferredDays.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Time:</span>
                <span className="text-white">
                  {step4_schedule.preferredTimeStart} - {step4_schedule.preferredTimeEnd}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Completion:</span>
                <span className="text-white">
                  {new Date(step4_schedule.targetCompletionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h3 className="font-bold text-white">Terms & Conditions</h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                data.termsAccepted
                  ? 'border-red-500 bg-red-500'
                  : 'border-zinc-600'
              }`}
            >
              {data.termsAccepted && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={data.termsAccepted}
              onChange={(e) => onUpdate({ termsAccepted: e.target.checked })}
              className="sr-only"
            />
            <span className="text-zinc-400 text-sm">
              I agree to the{' '}
              <a href="#" className="text-red-500 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-red-500 hover:underline">
                Privacy Policy
              </a>
              . I understand that my progress will be tracked and stored securely.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                data.emailConfirmed
                  ? 'border-red-500 bg-red-500'
                  : 'border-zinc-600'
              }`}
            >
              {data.emailConfirmed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={data.emailConfirmed}
              onChange={(e) => onUpdate({ emailConfirmed: e.target.checked })}
              className="sr-only"
            />
            <span className="text-zinc-400 text-sm">
              Send me email notifications about course updates, deadlines, and progress reminders.
            </span>
          </label>
        </div>

        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h4 className="font-bold text-white mb-2">What happens next?</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You will receive a confirmation email immediately
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Course access will be granted within 24 hours
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your personalized learning schedule will be activated
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Progress tracking begins on your first study day
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
