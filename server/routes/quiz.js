import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all active quizzes
router.get('/active', (req, res) => {
  const sql = 'SELECT * FROM quiz WHERE isActive = 1 ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ quizzes: rows });
  });
});

// Get all quizzes (for admin)
router.get('/all', (req, res) => {
  const sql = 'SELECT * FROM quiz ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ quizzes: rows });
  });
});

// Get quiz by ID with cards and categories
router.get('/:id', (req, res) => {
  const quizId = req.params.id;
  
  // Get quiz details
  db.get('SELECT * FROM quiz WHERE id = ?', [quizId], (err, quiz) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Get cards
    db.all('SELECT * FROM card WHERE quiz_id = ? ORDER BY id', [quizId], (err, cards) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get categories
      db.all('SELECT * FROM category WHERE quiz_id = ? ORDER BY id', [quizId], (err, categories) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({
          quiz,
          cards,
          categories
        });
      });
    });
  });
});

// Create new quiz
router.post('/', (req, res) => {
  const { name, description, isActive = true } = req.body;
  
  const sql = 'INSERT INTO quiz (name, description, isActive) VALUES (?, ?, ?)';
  
  db.run(sql, [name, description, isActive], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: this.lastID, name, description, isActive });
  });
});

// Update quiz
router.put('/:id', (req, res) => {
  const { name, description, isActive } = req.body;
  const quizId = req.params.id;
  
  const sql = 'UPDATE quiz SET name = ?, description = ?, isActive = ? WHERE id = ?';
  
  db.run(sql, [name, description, isActive, quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: quizId, name, description, isActive });
  });
});

// Toggle quiz active status
router.patch('/:id/toggle', (req, res) => {
  const quizId = req.params.id;
  
  const sql = 'UPDATE quiz SET isActive = NOT isActive WHERE id = ?';
  
  db.run(sql, [quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get updated quiz
    db.get('SELECT * FROM quiz WHERE id = ?', [quizId], (err, quiz) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(quiz);
    });
  });
});

// Delete quiz
router.delete('/:id', (req, res) => {
  const quizId = req.params.id;
  
  const sql = 'DELETE FROM quiz WHERE id = ?';
  
  db.run(sql, [quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  });
});

export default router;