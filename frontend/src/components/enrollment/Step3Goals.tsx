'use client';

import { motion } from 'framer-motion';
import { LearningGoals, PACE_OPTIONS, LEARNING_OBJECTIVES, MILESTONE_OPTIONS } from '@/lib/enrollment/types';

interface Step3GoalsProps {
  data: LearningGoals;
  onUpdate: (data: Partial<LearningGoals>) => void;
  errors: string[];
}

export function Step3Goals({ data, onUpdate, errors }: Step3GoalsProps) {
  const toggleObjective = (objective: string) => {
    const current = data.objectives;
    const updated = current.includes(objective)
      ? current.filter((o) => o !== objective)
      : [...current, objective];
    onUpdate({ objectives: updated });
  };

  const toggleMilestone = (milestone: string) => {
    const current = data.milestones;
    const updated = current.includes(milestone)
      ? current.filter((m) => m !== milestone)
      : [...current, milestone];
    onUpdate({ milestones: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          Learning Goals
        </h2>
        <p className="text-zinc-400 text-sm">
          Define your objectives and set your learning pace
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

      <div className="space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
            1
          </span>
          Learning Objectives
        </h3>
        <p className="text-zinc-400 text-sm">Select what you want to achieve (max 5)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEARNING_OBJECTIVES.map((objective) => {
            const isSelected = data.objectives.includes(objective);
            return (
              <motion.button
                key={objective}
                onClick={() => toggleObjective(objective)}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {objective}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
            2
          </span>
          Learning Pace
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {PACE_OPTIONS.map((pace) => {
            const isSelected = data.pace === pace.value;
            return (
              <motion.button
                key={pace.value}
                onClick={() => onUpdate({ pace: pace.value })}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                }`}
              >
                <p className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                  {pace.label}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{pace.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
            3
          </span>
          Weekly Time Commitment
        </h3>
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm">Hours per week</span>
            <span className="text-white font-bold">{data.estimatedHoursPerWeek}h</span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            value={data.estimatedHoursPerWeek}
            onChange={(e) => onUpdate({ estimatedHoursPerWeek: parseInt(e.target.value) })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>1h</span>
            <span>20h</span>
            <span>40h</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
            4
          </span>
          Milestones
        </h3>
        <p className="text-zinc-400 text-sm">Set your key achievement markers (max 4)</p>
        <div className="space-y-2">
          {MILESTONE_OPTIONS.map((milestone) => {
            const isSelected = data.milestones.includes(milestone);
            return (
              <motion.button
                key={milestone}
                onClick={() => toggleMilestone(milestone)}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {milestone}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
