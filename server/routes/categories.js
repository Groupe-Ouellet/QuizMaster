const express = require('express');
const router = express.Router();
const db = require('../database');

// Get categories for a specific quiz
router.get('/quiz/:quizId', (req, res) => {
  const quizId = req.params.quizId;
  
  const sql = 'SELECT * FROM category WHERE quiz_id = ? ORDER BY id';
  
  db.all(sql, [quizId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ categories: rows });
  });
});

// Create new category
router.post('/', (req, res) => {
  const { name, quiz_id } = req.body;
  
  const sql = 'INSERT INTO category (name, quiz_id) VALUES (?, ?)';
  
  db.run(sql, [name, quiz_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: this.lastID, name, quiz_id });
  });
});

// Update category
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const categoryId = req.params.id;
  
  const sql = 'UPDATE category SET name = ? WHERE id = ?';
  
  db.run(sql, [name, categoryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: categoryId, name });
  });
});

// Delete category
router.delete('/:id', (req, res) => {
  const categoryId = req.params.id;
  
  const sql = 'DELETE FROM category WHERE id = ?';
  
  db.run(sql, [categoryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Category deleted successfully' });
  });
});

module.exports = router;