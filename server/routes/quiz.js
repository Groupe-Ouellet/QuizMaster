import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get currentIndex (shared progress) for a quiz
router.get('/:id/progress', (req, res) => {
  const quizId = req.params.id;
  db.get('SELECT currentIndex FROM quiz WHERE id = ?', [quizId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    res.json({ currentIndex: row.currentIndex });
  });
});

// Update currentIndex (shared progress) for a quiz
router.patch('/:id/progress', (req, res) => {
  const quizId = req.params.id;
  const { currentIndex } = req.body;
  if (typeof currentIndex !== 'number' || currentIndex < 0) {
    res.status(400).json({ error: 'Invalid currentIndex' });
    return;
  }
  db.run('UPDATE quiz SET currentIndex = ? WHERE id = ?', [currentIndex, quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: quizId, currentIndex });
  });
});

// PATCH only autoValidate
router.patch('/:id/autovalidate', (req, res) => {
  const quizId = req.params.id;
  const { autoValidate } = req.body;
  const sql = 'UPDATE quiz SET autoValidate = ? WHERE id = ?';
  db.run(sql, [autoValidate ? 1 : 0, quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: quizId, autoValidate });
  });
});

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
  const { name, description, isActive = true, autoValidate = false } = req.body;
  const sql = 'INSERT INTO quiz (name, description, isActive, autoValidate) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, description, isActive, autoValidate ? 1 : 0], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, description, isActive, autoValidate });
  });
});

// Update quiz
router.put('/:id', (req, res) => {
  const { name, description, isActive, autoValidate } = req.body;
  const quizId = req.params.id;
  const sql = 'UPDATE quiz SET name = ?, description = ?, isActive = ?, autoValidate = ? WHERE id = ?';
  db.run(sql, [name, description, isActive, autoValidate ? 1 : 0, quizId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: quizId, name, description, isActive, autoValidate });
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