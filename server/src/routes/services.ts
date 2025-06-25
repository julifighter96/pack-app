import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken } from './auth';

const router = express.Router();

// Get services for move
router.get('/move/:moveId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { moveId } = req.params;
    const userId = (req as any).user?.userId;

    // Verify move belongs to user
    db.get('SELECT id FROM moves WHERE id = ? AND user_id = ?', [moveId, userId], (err, move) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!move) {
        return res.status(404).json({ error: 'Move not found' });
      }

      db.all(
        'SELECT * FROM services WHERE move_id = ? ORDER BY created_at',
        [moveId],
        (err, services) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(services);
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add service
router.post('/', authenticateToken, [
  body('moveId').isInt(),
  body('serviceType').notEmpty().trim(),
  body('quantity').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moveId, serviceType, quantity = 1, price = 0 } = req.body;
    const userId = (req as any).user?.userId;

    // Verify move belongs to user
    db.get('SELECT id FROM moves WHERE id = ? AND user_id = ?', [moveId, userId], (err, move) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!move) {
        return res.status(404).json({ error: 'Move not found' });
      }

      db.run(
        'INSERT INTO services (move_id, service_type, quantity, price) VALUES (?, ?, ?, ?)',
        [moveId, serviceType, quantity, price],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add service' });
          }

          res.status(201).json({
            message: 'Service added successfully',
            service: {
              id: this.lastID,
              moveId,
              serviceType,
              quantity,
              price
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update service
router.put('/:id', authenticateToken, [
  body('quantity').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const updateFields = req.body;

    // Verify service belongs to user's move
    db.get(
      'SELECT s.id FROM services s JOIN moves m ON s.move_id = m.id WHERE s.id = ? AND m.user_id = ?',
      [id, userId],
      (err, service) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!service) {
          return res.status(404).json({ error: 'Service not found' });
        }

        const fields = Object.keys(updateFields).filter(key => updateFields[key] !== undefined);
        if (fields.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updateFields[field]);
        values.push(id);

        db.run(
          `UPDATE services SET ${setClause} WHERE id = ?`,
          values,
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update service' });
            }
            res.json({ message: 'Service updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete service
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    // Verify service belongs to user's move
    db.get(
      'SELECT s.id FROM services s JOIN moves m ON s.move_id = m.id WHERE s.id = ? AND m.user_id = ?',
      [id, userId],
      (err, service) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!service) {
          return res.status(404).json({ error: 'Service not found' });
        }

        db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete service' });
          }
          res.json({ message: 'Service deleted successfully' });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Materials routes
router.get('/materials/move/:moveId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { moveId } = req.params;
    const userId = (req as any).user?.userId;

    // Verify move belongs to user
    db.get('SELECT id FROM moves WHERE id = ? AND user_id = ?', [moveId, userId], (err, move) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!move) {
        return res.status(404).json({ error: 'Move not found' });
      }

      db.all(
        'SELECT * FROM materials WHERE move_id = ? ORDER BY created_at',
        [moveId],
        (err, materials) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(materials);
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add material
router.post('/materials', authenticateToken, [
  body('moveId').isInt(),
  body('materialType').notEmpty().trim(),
  body('quantity').isInt({ min: 0 }),
  body('pricePerUnit').optional().isFloat({ min: 0 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moveId, materialType, quantity, pricePerUnit = 0 } = req.body;
    const userId = (req as any).user?.userId;
    const totalPrice = quantity * pricePerUnit;

    // Verify move belongs to user
    db.get('SELECT id FROM moves WHERE id = ? AND user_id = ?', [moveId, userId], (err, move) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!move) {
        return res.status(404).json({ error: 'Move not found' });
      }

      db.run(
        'INSERT INTO materials (move_id, material_type, quantity, price_per_unit, total_price) VALUES (?, ?, ?, ?, ?)',
        [moveId, materialType, quantity, pricePerUnit, totalPrice],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add material' });
          }

          res.status(201).json({
            message: 'Material added successfully',
            material: {
              id: this.lastID,
              moveId,
              materialType,
              quantity,
              pricePerUnit,
              totalPrice
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 