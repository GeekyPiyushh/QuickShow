const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

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

app.use('/api/admin', require('./routes/admin'));
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
  console.error('Unhandled error:', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Unable to save. Check database connectivity and retry.',
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log('QuickShow API listening on port ' + PORT));
  })
  .catch((err) => {
    console.error('Database initialization failed:', err.message || err);
    process.exit(1);
  });

