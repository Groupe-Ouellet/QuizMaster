const express = require('express');
const router = express.Router();
const db = require('../database');

// Create new submission
router.post('/', (req, res) => {
  const { user_name, card_id, category_id } = req.body;
  
  const sql = 'INSERT INTO submission (user_name, card_id, category_id) VALUES (?, ?, ?)';
  
  db.run(sql, [user_name, card_id, category_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: this.lastID, user_name, card_id, category_id, status: 'pending' });
  });
});

// Get pending submissions for validation
router.get('/pending', (req, res) => {
  const sql = `
    SELECT 
      s.id,
      s.user_name,
      s.timestamp,
      s.status,
      c.text_description as card_description,
      cat.name as category_name,
      cat.id as category_id
    FROM submission s
    JOIN card c ON s.card_id = c.id
    JOIN category cat ON s.category_id = cat.id
    WHERE s.status = 'pending'
    ORDER BY cat.name, s.timestamp ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Group by category
    const groupedSubmissions = rows.reduce((acc, submission) => {
      const categoryName = submission.category_name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(submission);
      return acc;
    }, {});
    
    res.json({ submissions: groupedSubmissions });
  });
});

// Update submission status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const submissionId = req.params.id;
  
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  
  const sql = 'UPDATE submission SET status = ? WHERE id = ?';
  
  db.run(sql, [status, submissionId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: submissionId, status });
  });
});

// Get all submissions for export
router.get('/export', (req, res) => {
  const { quiz_id, status } = req.query;
  
  let sql = `
    SELECT 
      s.id,
      s.user_name,
      s.timestamp,
      s.status,
      c.text_description as card_description,
      cat.name as category_name,
      q.name as quiz_name
    FROM submission s
    JOIN card c ON s.card_id = c.id
    JOIN category cat ON s.category_id = cat.id
    JOIN quiz q ON c.quiz_id = q.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (quiz_id && quiz_id !== 'all') {
    conditions.push('q.id = ?');
    params.push(quiz_id);
  }
  
  if (status === 'approved') {
    conditions.push("s.status = 'approved'");
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY q.name, s.timestamp ASC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ submissions: rows });
  });
});

module.exports = router;