const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/export', require('./routes/export'));

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  const { password } = req.body;
  const validationPassword = 'validation123'; // In production, use environment variables
  const adminPassword = 'admin123';
  
  if (password === validationPassword || password === adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
};

// Authentication routes
app.post('/api/auth/validation', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Accès validation autorisé' });
});

app.post('/api/auth/admin', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Accès admin autorisé' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});