import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';

const router = express.Router();

// JWT Token verification middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    (req as any).user = user;
    next();
  });
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 3 }),
  body('name').notEmpty().trim(),
  body('phone').optional().trim()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      db.run(
        'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
        [email, passwordHash, name, phone],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { userId: this.lastID, email, role: 'customer' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              email,
              name,
              role: 'customer'
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.get(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = ?',
      [email],
      async (err, user: { id: number; email: string; password_hash: string; name: string; role: string } | undefined) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 