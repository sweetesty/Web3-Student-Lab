import { Router } from 'express';

const router = Router();

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
}

// Robust Mock Database for 100% Demo Uptime
let enrollments: Enrollment[] = [];

// GET /api/enrollments - Get all enrollments
router.get('/', async (req, res) => {
  try {
    res.json(enrollments);
  } catch {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// GET /api/enrollments/:id - Get enrollment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = enrollments.find(e => e.id === id);

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch {
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
});

// POST /api/enrollments - Enroll a student in a course
router.post('/', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Auto-create an enrollment if it doesn't already exist
    const existing = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existing) {
      return res.status(200).json(existing);
    }

    const newEnrollment = {
      id: `enr-${Date.now()}`,
      studentId,
      courseId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
    };
    
    enrollments.push(newEnrollment);
    res.status(201).json(newEnrollment);
  } catch {
    res.status(500).json({ error: 'Failed to enroll student' });
  }
});

// PUT /api/enrollments/:id - Update enrollment status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const index = enrollments.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollments[index] = { ...enrollments[index], status };
    res.json(enrollments[index]);
  } catch {
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
});

// DELETE /api/enrollments/:id - Unenroll a student from a course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    enrollments = enrollments.filter(e => e.id !== id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to unenroll student' });
  }
});

export default router;
