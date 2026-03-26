import { getProgress, recordCompletedStage } from '../../learning/progress.js';
import { Progress } from './types.js';

/**
 * Service to manage student progress in the learning platform.
 */
export const getStudentProgress = async (studentId: string): Promise<Progress> => {
  return await getProgress(studentId);
};

/**
 * Updates student progress by recording a completed lesson.
 */
export const updateProgress = async (studentId: string, lessonId: string): Promise<Progress> => {
  return await recordCompletedStage(studentId, lessonId);
};
