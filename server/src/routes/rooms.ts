import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken } from './auth';

const router = express.Router();

// Get all room types
router.get('/types', authenticateToken, async (req: Request, res: Response) => {
  try {
    const roomTypes = await db.all(`
      SELECT * FROM room_types 
      ORDER BY name
    `);
    res.json(roomTypes);
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rooms for a specific move
router.get('/move/:moveId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { moveId } = req.params;
    const rooms = await db.all(`
      SELECT * FROM rooms 
      WHERE move_id = ? 
      ORDER BY name
    `, [moveId]);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new room
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { moveId, name, roomType } = req.body;
    
    if (!moveId || !name || !roomType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result: any = await db.run(`
      INSERT INTO rooms (move_id, name, room_type, volume) 
      VALUES (?, ?, ?, 0)
    `, [moveId, name, roomType]);

    const newRoom = await db.get('SELECT * FROM rooms WHERE id = ?', [result.lastID]);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a room
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, roomType } = req.body;
    
    await db.run(`
      UPDATE rooms 
      SET name = ?, room_type = ? 
      WHERE id = ?
    `, [name, roomType, id]);

    const updatedRoom = await db.get('SELECT * FROM rooms WHERE id = ?', [id]);
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a room
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete all furniture in this room first
    await db.run('DELETE FROM furniture WHERE room_id = ?', [id]);
    
    // Delete the room
    await db.run('DELETE FROM rooms WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 