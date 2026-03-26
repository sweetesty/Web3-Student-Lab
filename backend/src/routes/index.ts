import { Router } from 'express';
import dashboardRouter from '../dashboard/dashboard.routes.js';
import feedbackRouter from '../feedback/feedback.routes.js';
import userRouter from '../user/routes.js';
import authRoutes from './auth/auth.routes.js';
import certificatesRouter from './certificates.js';
import coursesRouter from './courses.js';
import enrollmentsRouter from './enrollments.js';
import generatorRoutes from './generator/generator.routes.js';
import learningRoutes from './learning/learning.routes.js';
import studentsRouter from './students.js';

const router = Router();

// Mount all feature routers
router.use('/students', studentsRouter);
router.use('/courses', coursesRouter);
router.use('/certificates', certificatesRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/feedback', feedbackRouter);
router.use('/dashboard', dashboardRouter);
router.use('/auth', authRoutes);
router.use('/learning', learningRoutes);
router.use('/generator', generatorRoutes);
router.use('/user', userRouter);

// Placeholder routes for future features
router.use('/blockchain', (_req, res) => {
  res.json({ message: 'Blockchain feature - Full integration in progress' });
});

export default router;
