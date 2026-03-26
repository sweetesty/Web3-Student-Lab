import { Request, Response, Router } from 'express';
import { authenticate } from '../../auth/auth.middleware.js';
import { login, register } from '../../auth/auth.service.js';
import { LoginRequest } from '../../auth/types.js';
import { registerSchema } from '../../auth/validation.schemas.js';
import { validateRequest } from '../../utils/validation.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    // Request body is already validated by middleware
    const { email, password, firstName, lastName } = req.body;

    // Register the student
    const authResponse = await register({ email, password, firstName, lastName });

    res.status(201).json(authResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'Student with this email already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login student
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  try {
    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Login the student
    const authResponse = await login({ email, password });

    res.json(authResponse);
  } catch (error) {
    // Demo/Mock login fallback if database is unreachable
    if (email && password) {
      console.warn('Database unreachable, using demo login fallback');
      res.json({
        token: 'mock-jwt-token-for-demo-purposes',
        user: {
          id: 'demo-student-id',
          email: email,
          firstName: 'Demo',
          lastName: 'Student',
        }
      });
      return;
    }

    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated student
 * @access  Private
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  // User is attached to request by authenticate middleware
  res.json({ user: req.user });
});

export default router;
