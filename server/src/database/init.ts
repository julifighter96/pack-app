import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Erstelle das data-Verzeichnis, falls es nicht existiert
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pack-app.db');

export const db = new sqlite3.Database(dbPath);

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'customer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Room types table
      db.run(`
        CREATE TABLE IF NOT EXISTS room_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          icon TEXT NOT NULL
        )
      `);

      // Furniture categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS furniture_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          room_type TEXT NOT NULL,
          default_length REAL NOT NULL,
          default_width REAL NOT NULL,
          default_height REAL NOT NULL,
          default_weight REAL NOT NULL
        )
      `);

      // Moves table
      db.run(`
        CREATE TABLE IF NOT EXISTS moves (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          from_address TEXT NOT NULL,
          to_address TEXT NOT NULL,
          move_date DATE NOT NULL,
          move_time TIME,
          special_requirements TEXT,
          status TEXT DEFAULT 'draft',
          total_volume REAL DEFAULT 0,
          total_weight REAL DEFAULT 0,
          estimated_cost REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Rooms table
      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          move_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          room_type TEXT NOT NULL,
          volume REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (move_id) REFERENCES moves (id) ON DELETE CASCADE
        )
      `);

      // Furniture table
      db.run(`
        CREATE TABLE IF NOT EXISTS furniture (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          length REAL NOT NULL,
          width REAL NOT NULL,
          height REAL NOT NULL,
          quantity INTEGER DEFAULT 1,
          weight REAL DEFAULT 0,
          volume REAL DEFAULT 0,
          is_custom BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
        )
      `);

      // Services table
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          move_id INTEGER NOT NULL,
          service_type TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          price REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (move_id) REFERENCES moves (id) ON DELETE CASCADE
        )
      `);

      // Materials table
      db.run(`
        CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          move_id INTEGER NOT NULL,
          material_type TEXT NOT NULL,
          quantity INTEGER DEFAULT 0,
          price_per_unit REAL DEFAULT 0,
          total_price REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (move_id) REFERENCES moves (id) ON DELETE CASCADE
        )
      `);

      // Move history table for versioning
      db.run(`
        CREATE TABLE IF NOT EXISTS move_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          move_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          changes TEXT,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (move_id) REFERENCES moves (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Insert default room types
      db.run(`
        INSERT OR IGNORE INTO room_types (name, icon) VALUES 
        ('Wohnzimmer', '🛋️'),
        ('Schlafzimmer', '🛏️'),
        ('Küche', '🍳'),
        ('Bad', '🚿'),
        ('Keller', '🏠'),
        ('Dachboden', '🏠'),
        ('Flur', '🚪'),
        ('Arbeitszimmer', '💻'),
        ('Kinderzimmer', '🧸'),
        ('Gästezimmer', '🛏️'),
        ('Abstellraum', '📦'),
        ('Garten', '🌳')
      `);

      // Insert default furniture categories
      db.run(`
        INSERT OR IGNORE INTO furniture_categories (name, room_type, default_length, default_width, default_height, default_weight) VALUES 
        ('Sofa', 'Wohnzimmer', 200, 80, 85, 80),
        ('Fernseher', 'Wohnzimmer', 120, 70, 5, 25),
        ('Tisch', 'Wohnzimmer', 140, 80, 75, 30),
        ('Stühle', 'Wohnzimmer', 45, 45, 90, 8),
        ('Bett', 'Schlafzimmer', 160, 200, 40, 60),
        ('Kleiderschrank', 'Schlafzimmer', 200, 60, 220, 100),
        ('Nachttisch', 'Schlafzimmer', 50, 40, 60, 15),
        ('Kühlschrank', 'Küche', 60, 60, 180, 80),
        ('Herd', 'Küche', 60, 60, 85, 50),
        ('Spülmaschine', 'Küche', 60, 60, 85, 45),
        ('Waschbecken', 'Küche', 60, 60, 85, 20),
        ('Toilette', 'Bad', 70, 60, 85, 25),
        ('Dusche', 'Bad', 80, 80, 200, 30),
        ('Waschbecken', 'Bad', 60, 50, 85, 15)
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
} 