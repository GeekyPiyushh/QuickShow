const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/snapseat';

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Compass at:', uri);

  const dbJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'db.json'), 'utf8'));
  const Movie = require('./models/Movie');
  const User = require('./models/User');

  // Upsert all 21 movies
  for (const m of dbJson.movies) {
    await Movie.updateOne(
      { title: m.title },
      {
        $set: {
          id: m.id || m._id,
          title: m.title,
          overview: m.overview || m.description || '',
          description: m.description || m.overview || '',
          poster: m.poster || m.poster_path || '',
          poster_path: m.poster_path || m.poster || '',
          backdrop_path: m.backdrop_path || '',
          genre: m.genre || [],
          genres: m.genres || [],
          language: m.language || 'English',
          duration: m.duration || m.runtime || 120,
          runtime: m.runtime || m.duration || 120,
          rating: m.rating || m.vote_average || 7.0,
          vote_average: m.vote_average || m.rating || 7.0,
          releaseDate: m.releaseDate || m.release_date || '2025-01-01',
          release_date: m.release_date || m.releaseDate || '2025-01-01',
          status: m.status || 'now_showing',
        }
      },
      { upsert: true }
    );
  }

  // Upsert all users
  for (const u of dbJson.users) {
    await User.updateOne(
      { email: u.email.toLowerCase() },
      {
        $set: {
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password,
          role: u.role || 'user',
          theatreId: u.theatreId || null,
          theatreName: u.theatreName || null,
          createdAt: u.createdAt || new Date(),
        }
      },
      { upsert: true }
    );
  }

  const finalMovieCount = await Movie.countDocuments();
  const finalUserCount = await User.countDocuments();
  const finalBookingCount = await mongoose.connection.db.collection('bookings').countDocuments();
  const finalTheatreCount = await mongoose.connection.db.collection('theatres').countDocuments();
  const finalScreenCount = await mongoose.connection.db.collection('screens').countDocuments();
  const finalShowCount = await mongoose.connection.db.collection('shows').countDocuments();

  console.log('\n=============================================');
  console.log(' MONGODB COMPASS DATABASE: snapseat');
  console.log(' - Movies Collection    :', finalMovieCount, 'documents');
  console.log(' - Users Collection     :', finalUserCount, 'documents');
  console.log(' - Theatres Collection  :', finalTheatreCount, 'documents');
  console.log(' - Screens Collection   :', finalScreenCount, 'documents');
  console.log(' - Shows Collection     :', finalShowCount, 'documents');
  console.log(' - Bookings Collection  :', finalBookingCount, 'documents');
  console.log('=============================================\n');

  process.exit(0);
}

run().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
