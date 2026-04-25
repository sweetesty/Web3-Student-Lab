import { Job } from 'bullmq';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { exportQueue } from '../jobs/export.queue.js';

const EXPORTS_DIR = path.join(process.cwd(), 'exports');

const router = Router();

// POST /api/v1/export - Trigger an export
router.post('/', async (req, res) => {
  const { type, format } = req.body;
  const userId = (req as unknown as { user?: { id: string } }).user?.id || 'anonymous';

  if (!['students', 'audit', 'courses'].includes(type)) {
    return res.status(400).json({ error: 'Invalid export type' });
  }

  if (!['csv', 'json'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }

  const job = await exportQueue.add('export-job', {
    type,
    format,
    userId,
  });

  res.json({ jobId: job.id });
});

// GET /api/v1/export/:id/status - Get job status
router.get('/:id/status', async (req, res) => {
  const { id } = req.params;
  const job = await Job.fromId(exportQueue, id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const state = await job.getState();
  const progress = job.progress;
  const result = job.returnvalue;

  res.json({
    id: job.id,
    state,
    progress,
    result,
  });
});

// GET /api/v1/export/download/:fileName - Download the generated file
router.get('/download/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(EXPORTS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Check if file is older than 24 hours
  const stats = fs.statSync(filePath);
  const now = new Date().getTime();
  const endTime = new Date(stats.ctime).getTime() + 24 * 60 * 60 * 1000;

  if (now > endTime) {
    fs.unlinkSync(filePath);
    return res.status(410).json({ error: 'File has expired' });
  }

  res.download(filePath);
});

export default router;
