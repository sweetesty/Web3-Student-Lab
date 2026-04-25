'use client';

import { motion } from 'framer-motion';

interface WizardNavigationProps {
  canGoBack: boolean;
  canProceed: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function WizardNavigation({
  canGoBack,
  canProceed,
  isFirstStep,
  isLastStep,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-8 border-t border-zinc-800">
      <motion.button
        whileHover={canGoBack ? { x: -4 } : {}}
        whileTap={canGoBack ? { scale: 0.95 } : {}}
        onClick={onBack}
        disabled={!canGoBack || isSubmitting}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wider transition-all ${
          canGoBack && !isSubmitting
            ? 'text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
            : 'text-zinc-600 bg-zinc-900 border border-zinc-800 cursor-not-allowed'
        }`}
        type="button"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </motion.button>

      {isLastStep ? (
        <motion.button
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${
            canProceed && !isSubmitting
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              Complete Enrollment
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg ${
            canProceed && !isSubmitting
              ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          type="button"
        >
          Continue
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
