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
app.use(cors({
  origin: 'https://quizmaster.ptranet.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Additional headers for better compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://quizmaster.ptranet.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Domain restriction middleware - only allow quizmaster.ptranet.com
app.use((req, res, next) => {
  const allowedHost = 'quizmaster.ptranet.com';
  const requestHost = req.get('host');
  const requestOrigin = req.get('origin');
  const cfConnectingIp = req.get('cf-connecting-ip'); // Cloudflare IP
  const xForwardedHost = req.get('x-forwarded-host'); // Cloudflare forwarded host
  const xRealIp = req.get('x-real-ip'); // Real IP from proxy
  
  // Debug logging
  console.log('Request from:', { 
    host: requestHost, 
    origin: requestOrigin, 
    cfConnectingIp,
    xForwardedHost,
    xRealIp,
    url: req.url 
  });
  
  // Check if host matches allowed domain (with or without port)
  const isAllowedHost = requestHost === allowedHost || 
                       requestHost === `${allowedHost}:${PORT}` ||
                       requestHost === `${allowedHost}:80` ||
                       requestHost === `${allowedHost}:443` ||
                       xForwardedHost === allowedHost ||
                       xForwardedHost === `${allowedHost}:${PORT}` ||
                       xForwardedHost === `${allowedHost}:80` ||
                       xForwardedHost === `${allowedHost}:443`;
  
  // Check if origin matches (for CORS requests)
  const isAllowedOrigin = !requestOrigin || 
                          requestOrigin === `https://${allowedHost}` ||
                          requestOrigin === `http://${allowedHost}`;
  
  // Allow Cloudflare requests (they have cf-connecting-ip header)
  const isCloudflareRequest = cfConnectingIp !== undefined;
  
  if ((isAllowedHost && isAllowedOrigin) || isCloudflareRequest) {
    next();
  } else {
    console.log('Access denied for:', { 
      host: requestHost, 
      origin: requestOrigin, 
      cfConnectingIp,
      xForwardedHost 
    });
    // Block requests from other domains
    res.status(403).json({ 
      error: 'Access denied', 
      message: 'This application is only accessible from quizmaster.ptranet.com',
      debug: { host: requestHost, origin: requestOrigin, cfConnectingIp, xForwardedHost }
    });
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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