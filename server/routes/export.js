const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const db = require('../database');

// Export data in various formats
router.post('/data', async (req, res) => {
  const { format, quiz_id, status } = req.body;
  
  try {
    // Get submissions data
    let sql = `
      SELECT 
        s.id,
        s.user_name,
        s.timestamp,
        s.status,
        c.text_description as description,
        cat.name as category,
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
    
    db.all(sql, params, async (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `quiz_export_${timestamp}`;
      
      switch (format) {
        case 'json':
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(rows, null, 2));
          break;
          
        case 'csv':
          const csvPath = path.join(__dirname, '..', 'exports', `${filename}.csv`);
          
          // Ensure exports directory exists
          const exportsDir = path.dirname(csvPath);
          if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
          }
          
          const csvWriter = createCsvWriter({
            path: csvPath,
            header: [
              { id: 'description', title: 'Description' },
              { id: 'category', title: 'Catégorie' },
              { id: 'user_name', title: 'Utilisateur' },
              { id: 'quiz_name', title: 'Quiz' },
              { id: 'timestamp', title: 'Date' },
              { id: 'status', title: 'Statut' }
            ]
          });
          
          await csvWriter.writeRecords(rows);
          res.download(csvPath, `${filename}.csv`, (err) => {
            if (err) {
              console.error('Error downloading file:', err);
            }
            // Clean up file after download
            fs.unlink(csvPath, () => {});
          });
          break;
          
        case 'xlsx':
          // Prepare data for XLSX (simple format with description and category)
          const xlsxData = rows.map(row => ({
            description: row.description,
            catégorie: row.category
          }));
          
          const worksheet = XLSX.utils.json_to_sheet(xlsxData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Soumissions');
          
          const xlsxPath = path.join(__dirname, '..', 'exports', `${filename}.xlsx`);
          
          // Ensure exports directory exists
          const xlsxExportsDir = path.dirname(xlsxPath);
          if (!fs.existsSync(xlsxExportsDir)) {
            fs.mkdirSync(xlsxExportsDir, { recursive: true });
          }
          
          XLSX.writeFile(workbook, xlsxPath);
          res.download(xlsxPath, `${filename}.xlsx`, (err) => {
            if (err) {
              console.error('Error downloading file:', err);
            }
            // Clean up file after download
            fs.unlink(xlsxPath, () => {});
          });
          break;
          
        case 'sqlite':
          const dbPath = path.join(__dirname, '..', 'quiz_master.db');
          res.download(dbPath, `quiz_master_${timestamp}.db`);
          break;
          
        default:
          res.status(400).json({ error: 'Format non supporté' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;