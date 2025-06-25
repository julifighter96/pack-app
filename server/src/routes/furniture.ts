import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken } from './auth';

const router = express.Router();

// Get all furniture categories
router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = await db.all(`
      SELECT * FROM furniture_categories 
      ORDER BY name
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching furniture categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get furniture for a specific room
router.get('/room/:roomId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const furniture = await db.all(`
      SELECT * FROM furniture 
      WHERE room_id = ? 
      ORDER BY name
    `, [roomId]);
    res.json(furniture);
  } catch (error) {
    console.error('Error fetching furniture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new furniture item
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roomId, name, category, length, width, height, quantity, weight, isCustom } = req.body;
    
    if (!roomId || !name || !category || !length || !width || !height || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate volume in cubic meters
    const volume = (length * width * height * quantity) / 1000000; // Convert from cm³ to m³

    const result: any = await db.run(`
      INSERT INTO furniture (room_id, name, category, length, width, height, quantity, weight, volume, is_custom) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [roomId, name, category, length, width, height, quantity, weight || 0, volume, isCustom || false]);

    // Update room volume
    await db.run(`
      UPDATE rooms 
      SET volume = (
        SELECT COALESCE(SUM(volume), 0) 
        FROM furniture 
        WHERE room_id = ?
      ) 
      WHERE id = ?
    `, [roomId, roomId]);

    const newFurniture = await db.get('SELECT * FROM furniture WHERE id = ?', [result.lastID]);
    res.status(201).json(newFurniture);
  } catch (error) {
    console.error('Error creating furniture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a furniture item
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, length, width, height, quantity, weight, isCustom } = req.body;
    
    // Calculate volume in cubic meters
    const volume = (length * width * height * quantity) / 1000000; // Convert from cm³ to m³

    await db.run(`
      UPDATE furniture 
      SET name = ?, category = ?, length = ?, width = ?, height = ?, quantity = ?, weight = ?, volume = ?, is_custom = ? 
      WHERE id = ?
    `, [name, category, length, width, height, quantity, weight || 0, volume, isCustom || false, id]);

    // Get room_id to update room volume
    const furniture: any = await db.get('SELECT room_id FROM furniture WHERE id = ?', [id]);
    
    if (furniture) {
      await db.run(`
        UPDATE rooms 
        SET volume = (
          SELECT COALESCE(SUM(volume), 0) 
          FROM furniture 
          WHERE room_id = ?
        ) 
        WHERE id = ?
      `, [furniture.room_id, furniture.room_id]);
    }

    const updatedFurniture = await db.get('SELECT * FROM furniture WHERE id = ?', [id]);
    res.json(updatedFurniture);
  } catch (error) {
    console.error('Error updating furniture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a furniture item
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get room_id before deleting
    const furniture: any = await db.get('SELECT room_id FROM furniture WHERE id = ?', [id]);
    
    // Delete the furniture
    await db.run('DELETE FROM furniture WHERE id = ?', [id]);
    
    // Update room volume if room exists
    if (furniture) {
      await db.run(`
        UPDATE rooms 
        SET volume = (
          SELECT COALESCE(SUM(volume), 0) 
          FROM furniture 
          WHERE room_id = ?
        ) 
        WHERE id = ?
      `, [furniture.room_id, furniture.room_id]);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting furniture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 