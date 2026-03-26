import { Request, Response, Router } from 'express';
import { getStudentProgress, updateProgress } from './learning.service.js';
import { Module } from './types.js';

const router = Router();

// Mock data
const modules: Module[] = [
  {
    id: 'mod-1',
    title: 'Blockchain Fundamentals',
    description: 'Learn the basics of blockchain technology',
    lessons: [
      {
        id: 'lesson-1',
        title: 'What is Blockchain?',
        description: 'Introduction to distributed ledger technology',
        difficulty: 'beginner',
        completed: false,
      },
      {
        id: 'lesson-2',
        title: 'How Transactions Work',
        description: 'Understanding transaction flow in blockchain',
        difficulty: 'beginner',
        completed: false,
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Smart Contracts',
    description: 'Introduction to smart contracts and Soroban',
    lessons: [
      {
        id: 'lesson-3',
        title: 'Smart Contract Basics',
        description: 'What are smart contracts and how they work',
        difficulty: 'intermediate',
        completed: false,
      },
      {
        id: 'lesson-4',
        title: 'Writing Soroban Contracts',
        description: 'Learn to write smart contracts in Rust',
        difficulty: 'intermediate',
        completed: false,
      },
    ],
  },
];

/**
 * @route   GET /api/learning/modules
 * @desc    Get all learning modules
 * @access  Public
 */
router.get('/modules', (req: Request, res: Response) => {
  try {
    const difficulty = req.query.difficulty as string | undefined;

    let filteredModules = modules;

    if (difficulty) {
      filteredModules = modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.filter((lesson) => lesson.difficulty === difficulty),
      }));
    }

    res.json({ modules: filteredModules });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/learning/modules/:moduleId
 * @desc    Get a specific module by ID
 * @access  Public
 */
router.get('/modules/:moduleId', (req: Request, res: Response) => {
  try {
    const moduleId = req.params.moduleId as string;
    const module = modules.find((m) => m.id === moduleId);

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    res.json({ module });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/learning/progress/:userId
 * @desc    Get user learning progress
 * @access  Public
 */
router.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const progress = await getStudentProgress(userId);

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/learning/progress/:userId/complete
 * @desc    Mark a lesson as complete
 * @access  Public
 */
router.post('/progress/:userId/complete', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { lessonId } = req.body;

    if (!lessonId) {
      res.status(400).json({ error: 'Lesson ID is required' });
      return;
    }

    // Verify lesson exists
    const lessonExists = modules.some((mod) => mod.lessons.some((l) => l.id === lessonId));

    if (!lessonExists) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const progress = await updateProgress(userId, lessonId);

    res.json({ progress, message: 'Lesson marked as complete' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
