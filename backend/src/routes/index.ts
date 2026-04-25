import { Router } from 'express';
import dashboardRouter from '../dashboard/dashboard.routes.js';
import feedbackRouter from '../feedback/feedback.routes.js';
import userRouter from '../user/routes.js';
import authRoutes from './auth/auth.routes.js';
import certificatesRouter from './certificates.routes.js';
import coursesRouter from './courses.js';
import enrollmentsRouter from './enrollments.js';
import generatorRoutes from './generator/generator.routes.js';
import learningRoutes from './learning/learning.routes.js';
import studentsRouter from './students.js';
import blockchainRouter from '../blockchain/balance.js';
import auditRouter from './audit.js';
import webhookRouter from './webhooks.js';

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
router.use('/audit', auditRouter);

// Blockchain routes
router.use('/blockchain', blockchainRouter);

router.use('/webhooks', webhookRouter);

export default router;
