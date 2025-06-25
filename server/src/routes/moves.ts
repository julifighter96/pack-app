import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth';

const router = express.Router();

// Create new move
router.post('/', authenticateToken, [
  body('customer_name').notEmpty().trim(),
  body('customer_email').isEmail().normalizeEmail(),
  body('customer_phone').optional().trim(),
  body('from_address').notEmpty().trim(),
  body('to_address').notEmpty().trim(),
  body('move_date').isISO8601(),
  body('move_time').optional().trim(),
  body('special_requirements').optional().trim()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      from_address,
      to_address,
      move_date,
      move_time,
      special_requirements
    } = req.body;

    const userId = (req as any).user?.userId;
    const reference = `UMZ-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Standard rooms to add automatically
    const standardRooms = [
      { name: 'Wohnzimmer', roomType: 'Wohnzimmer' },
      { name: 'Schlafzimmer', roomType: 'Schlafzimmer' },
      { name: 'Küche', roomType: 'Küche' },
      { name: 'Bad', roomType: 'Bad' },
      { name: 'Flur', roomType: 'Flur' }
    ];

    db.run(
      `INSERT INTO moves (
        reference, user_id, customer_name, customer_email, customer_phone,
        from_address, to_address, move_date, move_time, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference, userId, customer_name, customer_email, customer_phone, from_address, to_address, move_date, move_time, special_requirements],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create move' });
        }

        const moveId = this.lastID;

        // Add standard rooms
        const addStandardRooms = (): Promise<void> => {
          return new Promise<void>((resolve, reject) => {
            let completed = 0;
            const totalRooms = standardRooms.length;

            if (totalRooms === 0) {
              resolve();
              return;
            }

            standardRooms.forEach((room) => {
              db.run(
                'INSERT INTO rooms (move_id, name, room_type, volume) VALUES (?, ?, ?, ?)',
                [moveId, room.name, room.roomType, 0],
                function(err) {
                  if (err) {
                    console.error('Error adding standard room:', err);
                  }
                  completed++;
                  if (completed === totalRooms) {
                    resolve();
                  }
                }
              );
            });
          });
        };

        // Add standard rooms and then return response
        addStandardRooms().then(() => {
          res.status(201).json({
            message: 'Move created successfully with standard rooms',
            move: {
              id: moveId,
              reference,
              customer_name,
              customer_email,
              customer_phone,
              from_address,
              to_address,
              move_date,
              move_time,
              special_requirements,
              status: 'draft'
            }
          });
        }).catch((error) => {
          console.error('Error adding standard rooms:', error);
          // Still return success even if adding rooms fails
          res.status(201).json({
            message: 'Move created successfully (some rooms may not have been added)',
            move: {
              id: moveId,
              reference,
              customer_name,
              customer_email,
              customer_phone,
              from_address,
              to_address,
              move_date,
              move_time,
              special_requirements,
              status: 'draft'
            }
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all moves for user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    db.all(
      'SELECT * FROM moves WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, moves) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(moves);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific move
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    db.get(
      'SELECT * FROM moves WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, move) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!move) {
          return res.status(404).json({ error: 'Move not found' });
        }
        res.json(move);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update move
router.put('/:id', authenticateToken, [
  body('customer_name').optional().trim(),
  body('customer_email').optional().isEmail().normalizeEmail(),
  body('customer_phone').optional().trim(),
  body('from_address').optional().trim(),
  body('to_address').optional().trim(),
  body('move_date').optional().isISO8601(),
  body('move_time').optional().trim(),
  body('special_requirements').optional().trim(),
  body('status').optional().isIn(['draft', 'confirmed', 'completed', 'cancelled'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const updateFields = req.body;

    // Build dynamic update query
    const fields = Object.keys(updateFields).filter(key => updateFields[key] !== undefined);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateFields[field]);
    values.push(new Date().toISOString(), id, userId);

    db.run(
      `UPDATE moves SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update move' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Move not found' });
        }
        res.json({ message: 'Move updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete move
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    db.run(
      'DELETE FROM moves WHERE id = ? AND user_id = ?',
      [id, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete move' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Move not found' });
        }
        res.json({ message: 'Move deleted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add standard rooms to existing move
router.post('/:id/rooms/standard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    // Check if move exists and belongs to user
    db.get(
      'SELECT id FROM moves WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, move) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!move) {
          return res.status(404).json({ error: 'Move not found' });
        }

        // Standard rooms to add
        const standardRooms = [
          { name: 'Wohnzimmer', roomType: 'Wohnzimmer' },
          { name: 'Schlafzimmer', roomType: 'Schlafzimmer' },
          { name: 'Küche', roomType: 'Küche' },
          { name: 'Bad', roomType: 'Bad' },
          { name: 'Flur', roomType: 'Flur' }
        ];

        let completed = 0;
        const totalRooms = standardRooms.length;
        const addedRooms: any[] = [];

        if (totalRooms === 0) {
          return res.json({ message: 'No standard rooms to add', rooms: [] });
        }

        standardRooms.forEach((room) => {
          db.run(
            'INSERT INTO rooms (move_id, name, room_type, volume) VALUES (?, ?, ?, ?)',
            [id, room.name, room.roomType, 0],
            function(err) {
              if (err) {
                console.error('Error adding standard room:', err);
              } else {
                addedRooms.push({ id: this.lastID, ...room });
              }
              completed++;
              if (completed === totalRooms) {
                res.json({ 
                  message: 'Standard rooms added successfully', 
                  rooms: addedRooms 
                });
              }
            }
          );
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 