import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import quizRoutes from './routes/quiz.js';
import cardsRoutes from './routes/cards.js';
import categoriesRoutes from './routes/categories.js';
import submissionsRoutes from './routes/submissions.js';
import exportRoutes from './routes/export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7236;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/export', exportRoutes);

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