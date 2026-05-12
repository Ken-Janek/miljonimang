require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const assignmentRoutes = require('./routes/assignments');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

// CORS middleware (if needed for frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/game', gameRoutes);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve game page
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   MILJONIMÄNG - Ülesande Valideeri    ║
║                                        ║
║  Server on käivitatud!                ║
║  Ava brauseris: http://localhost:${PORT}  ║
║                                        ║
║  Käsud:                               ║
║  - npm start     (tootmine)           ║
║  - npm run dev   (arendamine)         ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
