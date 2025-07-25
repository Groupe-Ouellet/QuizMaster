const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'quiz_master.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create tables
  db.serialize(() => {
    // Quiz table
    db.run(`CREATE TABLE IF NOT EXISTS quiz (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Card table
    db.run(`CREATE TABLE IF NOT EXISTS card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_description TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quiz (id) ON DELETE CASCADE
    )`);

    // Category table
    db.run(`CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quiz (id) ON DELETE CASCADE
    )`);

    // Submission table
    db.run(`CREATE TABLE IF NOT EXISTS submission (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      card_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
    )`);

    // Insert sample data
    insertSampleData();
  });
}

function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM quiz", (err, row) => {
    if (err) {
      console.error('Error checking existing data:', err);
      return;
    }

    if (row.count === 0) {
      // Insert sample quiz
      db.run(`INSERT INTO quiz (name, description, isActive) VALUES 
        ('Quiz Fruits et Légumes', 'Associez chaque aliment à sa catégorie correcte.', 1),
        ('Quiz Animaux', 'Classifiez les animaux selon leur habitat naturel.', 1)
      `, function(err) {
        if (err) {
          console.error('Error inserting sample quiz:', err);
          return;
        }

        const quiz1Id = 1;
        const quiz2Id = 2;

        // Insert sample categories for quiz 1
        db.run(`INSERT INTO category (name, quiz_id) VALUES 
          ('Fruit', ${quiz1Id}),
          ('Légume', ${quiz1Id})
        `);

        // Insert sample cards for quiz 1
        db.run(`INSERT INTO card (text_description, quiz_id) VALUES 
          ('Orange', ${quiz1Id}),
          ('Tomate', ${quiz1Id}),
          ('Pomme', ${quiz1Id}),
          ('Carotte', ${quiz1Id}),
          ('Banane', ${quiz1Id}),
          ('Brocoli', ${quiz1Id})
        `);

        // Insert sample categories for quiz 2
        db.run(`INSERT INTO category (name, quiz_id) VALUES 
          ('Terrestres', ${quiz2Id}),
          ('Aquatiques', ${quiz2Id}),
          ('Aériens', ${quiz2Id})
        `);

        // Insert sample cards for quiz 2
        db.run(`INSERT INTO card (text_description, quiz_id) VALUES 
          ('Lion', ${quiz2Id}),
          ('Dauphin', ${quiz2Id}),
          ('Aigle', ${quiz2Id}),
          ('Éléphant', ${quiz2Id}),
          ('Requin', ${quiz2Id}),
          ('Faucon', ${quiz2Id})
        `);

        console.log('Sample data inserted successfully');
      });
    }
  });
}

module.exports = db;