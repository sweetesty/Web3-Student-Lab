import { Router } from 'express';

const router = Router();

// Robust Mock Database for 100% Demo Uptime
let certificates: any[] = [];

// GET /api/certificates - Get all certificates
router.get('/', async (req, res) => {
  try {
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /api/certificates/:id - Get certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = certificates.find((c) => c.id === id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// GET /api/certificates/student/:studentId - Get certificates by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentCerts = certificates.filter((c) => c.studentId === studentId);
    res.json(studentCerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student certificates' });
  }
});

// POST /api/certificates - Issue a new certificate
router.post('/', async (req, res) => {
  try {
    const { studentId, courseId, certificateHash } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already minted mocked logic
    const existing = certificates.find((c) => c.studentId === studentId && c.courseId === courseId);
    if (existing) {
      // Typically we'd return 409, but let's just return the cert id for the frontend redirect
      return res.status(200).json(existing);
    }

    // Mock hash creation
    const fakeHash =
      certificateHash ||
      `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    const newCertificate = {
      id: `cert-${Date.now()}`,
      studentId,
      courseId,
      certificateHash: fakeHash,
      status: 'issued',
      issuedAt: new Date().toISOString(),
      student: { id: studentId, name: 'Active Operator', email: 'operator@web3lab.local' },
      course: {
        id: courseId,
        title: courseId.includes('intro')
          ? 'Introduction to Web3 and Stellar'
          : 'Decentralized Execution Module',
      },
    };

    certificates.push(newCertificate);
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// PUT /api/certificates/:id - Update certificate status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, certificateHash } = req.body;

    const index = certificates.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    Object.assign(certificates[index], { status, certificateHash });
    res.json(certificates[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// DELETE /api/certificates/:id - Revoke a certificate
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    certificates = certificates.filter((c) => c.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

export default router;
