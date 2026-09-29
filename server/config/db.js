const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

let isConnected = false;

async function seedFromDbJson() {
  try {
    const dbJsonPath = path.join(__dirname, '..', 'data', 'db.json');
    if (!fs.existsSync(dbJsonPath)) return;

    const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    // 1. Users
    const userCount = await User.countDocuments();
    if (userCount === 0 && data.users && data.users.length > 0) {
      console.log(`[MongoDB] Migrating ${data.users.length} users to MongoDB...`);
      for (const u of data.users) {
        await User.updateOne(
          { email: u.email.toLowerCase() },
          { $setOnInsert: { name: u.name, email: u.email.toLowerCase(), password: u.password, role: u.role || 'user', createdAt: u.createdAt || new Date() } },
          { upsert: true }
        );
      }
    }

    // 2. Movies
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0 && data.movies && data.movies.length > 0) {
      console.log(`[MongoDB] Migrating ${data.movies.length} movies to MongoDB...`);
      for (const m of data.movies) {
        await Movie.create({
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
        });
      }
    }

    // 3. Theatres
    const theatreCount = await Theatre.countDocuments();
    if (theatreCount === 0 && data.theatres && data.theatres.length > 0) {
      console.log(`[MongoDB] Migrating ${data.theatres.length} theatres to MongoDB...`);
      for (const t of data.theatres) {
        await Theatre.create({
          name: t.name,
          city: t.city || 'Downtown',
          location: t.location || '',
        });
      }
    }

    // 4. Screens
    const screenCount = await Screen.countDocuments();
    if (screenCount === 0 && data.screens && data.screens.length > 0) {
      console.log(`[MongoDB] Migrating ${data.screens.length} screens to MongoDB...`);
      for (const sc of data.screens) {
        await Screen.create({
          name: sc.name,
          theatre: sc.theatre,
          totalSeats: sc.totalSeats || 90,
        });
      }
    }

    // 5. Shows
    const showCount = await Show.countDocuments();
    if (showCount === 0 && data.shows && data.shows.length > 0) {
      console.log(`[MongoDB] Migrating ${data.shows.length} shows to MongoDB...`);
      for (const s of data.shows) {
        await Show.create({
          movie: s.movie,
          theatre: s.theatre,
          screen: s.screen,
          showDate: s.showDate,
          showDateTime: s.showDateTime,
          startTime: s.startTime || '10:00 AM',
          endTime: s.endTime || '12:00 PM',
          price: s.price || s.showPrice || 200,
          showPrice: s.showPrice || s.price || 200,
          bookedSeats: s.bookedSeats || [],
        });
      }
    }

    // 6. Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && data.bookings && data.bookings.length > 0) {
      console.log(`[MongoDB] Migrating ${data.bookings.length} bookings to MongoDB...`);
      for (const b of data.bookings) {
        await Booking.create({
          bookingId: b.bookingId || b._id,
          user: b.user,
          userId: b.userId || (b.user && b.user._id),
          show: b.show,
          seats: b.seats || [],
          bookedSeats: b.bookedSeats || [],
          totalAmount: b.totalAmount || b.amount || 0,
          amount: b.amount || b.totalAmount || 0,
          isPaid: b.isPaid !== undefined ? b.isPaid : true,
          bookedAt: b.bookedAt || b.createdAt || new Date(),
        });
      }
    }

    console.log('[MongoDB] ✅ Migration & Synchronization complete! Ready in MongoDB Compass.');
  } catch (err) {
    console.warn('[MongoDB] Seed migration notice:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/snapseat';
  try {
    console.log(`[MongoDB] Attempting connection to: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('====================================================');
    console.log(`[MongoDB] Connected successfully! Database: snapseat`);
    console.log(`[MongoDB] You can view this in MongoDB Compass at:`);
    console.log(`         ${uri}`);
    console.log('====================================================');

    await seedFromDbJson();
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to MongoDB server: ${err.message}`);
    console.warn(`[MongoDB] Running with local db.json storage until MongoDB is started.`);
    isConnected = false;
    return false;
  }
}

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  models: { User, Movie, Theatre, Screen, Show, Booking }
};
