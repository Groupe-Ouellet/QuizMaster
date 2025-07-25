import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get cards for a specific quiz
router.get('/quiz/:quizId', (req, res) => {
  const quizId = req.params.quizId;
  
  const sql = 'SELECT * FROM card WHERE quiz_id = ? ORDER BY id';
  
  db.all(sql, [quizId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ cards: rows });
  });
});

// Create new card
router.post('/', (req, res) => {
  const { text_description, quiz_id } = req.body;
  
  const sql = 'INSERT INTO card (text_description, quiz_id) VALUES (?, ?)';
  
  db.run(sql, [text_description, quiz_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: this.lastID, text_description, quiz_id });
  });
});

// Update card
router.put('/:id', (req, res) => {
  const { text_description } = req.body;
  const cardId = req.params.id;
  
  const sql = 'UPDATE card SET text_description = ? WHERE id = ?';
  
  db.run(sql, [text_description, cardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: cardId, text_description });
  });
});

// Delete card
router.delete('/:id', (req, res) => {
  const cardId = req.params.id;
  
  const sql = 'DELETE FROM card WHERE id = ?';
  
  db.run(sql, [cardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Card deleted successfully' });
  });
});

export default router;