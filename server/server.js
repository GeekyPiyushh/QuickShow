const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const theatresRoutes = require('./routes/theatres');
const showsRoutes = require('./routes/shows');
const bookingsRoutes = require('./routes/bookings');
const usersRoutes = require('./routes/users');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api', theatresRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QuickShow Backend API',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(` QuickShow API Server running on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
  await connectDB();
});
