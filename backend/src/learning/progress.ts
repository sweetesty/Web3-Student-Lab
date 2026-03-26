import { prisma } from '../db/index.js';

/**
 * Interface representing the student's progress data.
 */
export interface Progress {
  userId: string;
  completedLessons: string[];
  currentModule: string;
  percentage: number;
}

/**
 * Records a completed module/stage for a student ID.
 * This function persists the student's progress to the database.
 *
 * @param studentId - The unique identifier for the student.
 * @param lessonId - The identifier for the lesson/stage being completed.
 * @param currentModule - Optional identifier for the current learning module.
 * @returns A promise that resolves to the updated Progress record.
 */
export const recordCompletedStage = async (
  studentId: string,
  lessonId: string,
  currentModule: string = 'mod-1'
): Promise<Progress> => {
  // Fetch existing progress
  const existingProgress = await prisma.learningProgress.findUnique({
    where: { userId: studentId },
  });

  let completedLessons: string[] = [];

  if (existingProgress) {
    // Avoid duplicate completed lessons
    completedLessons = existingProgress.completedLessons.includes(lessonId)
      ? existingProgress.completedLessons
      : [...existingProgress.completedLessons, lessonId];
  } else {
    completedLessons = [lessonId];
  }

  // Define logic for percentage calculation
  // Flexible mechanism for calculating progress based on a fixed total (e.g., 10 modules/lessons)
  const totalStages = 10;
  const percentage = Math.min(100, Math.round((completedLessons.length / totalStages) * 100));

  // Update or create the progress record
  const progressRecord = await prisma.learningProgress.upsert({
    where: { userId: studentId },
    update: {
      completedLessons,
      currentModule,
      percentage,
      updatedAt: new Date(),
    },
    create: {
      userId: studentId,
      completedLessons,
      currentModule,
      percentage,
    },
  });

  return {
    userId: progressRecord.userId,
    completedLessons: progressRecord.completedLessons,
    currentModule: progressRecord.currentModule,
    percentage: progressRecord.percentage,
  };
};

/**
 * Retrieves progress for a specific student.
 *
 * @param studentId - The identifier for the student.
 * @returns A promise resolving to the Progress object, or a default one if no record exists.
 */
export const getProgress = async (studentId: string): Promise<Progress> => {
  const record = await prisma.learningProgress.findUnique({
    where: { userId: studentId },
  });

  if (!record) {
    return {
      userId: studentId,
      completedLessons: [],
      currentModule: 'mod-1',
      percentage: 0,
    };
  }

  return {
    userId: record.userId,
    completedLessons: record.completedLessons,
    currentModule: record.currentModule,
    percentage: record.percentage,
  };
};
