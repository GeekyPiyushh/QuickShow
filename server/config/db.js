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
    if (data.users && data.users.length > 0) {
      for (const u of data.users) {
        await User.updateOne(
          { email: u.email.toLowerCase() },
          {
            $setOnInsert: {
              _id: u._id || ('usr_' + Date.now()),
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
    }

    // 2. Movies
    if (data.movies && data.movies.length > 0) {
      for (const m of data.movies) {
        const id = m.id || m._id;
        const exists = await Movie.findOne({ $or: [{ id: id }, { title: m.title }] });
        if (!exists) {
          await Movie.create({
            _id: String(m._id || id),
            id: id,
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
    }

    // 3. Theatres
    if (data.theatres && data.theatres.length > 0) {
      for (const t of data.theatres) {
        const exists = await Theatre.findOne({ $or: [{ _id: t._id }, { name: t.name }] });
        if (!exists) {
          await Theatre.create({
            _id: t._id || ('th_' + Date.now()),
            name: t.name,
            city: t.city || 'Downtown',
            location: t.location || '',
          });
        }
      }
    }

    // 4. Screens
    if (data.screens && data.screens.length > 0) {
      for (const sc of data.screens) {
        const exists = await Screen.findOne({ $or: [{ _id: sc._id }, { name: sc.name }] });
        if (!exists) {
          await Screen.create({
            _id: sc._id || ('sc_' + Date.now()),
            name: sc.name,
            theatre: sc.theatre,
            totalSeats: sc.totalSeats || 90,
          });
        }
      }
    }

    // 5. Shows
    if (data.shows && data.shows.length > 0) {
      for (const s of data.shows) {
        const sId = s._id || ('sh_' + Date.now());
        const exists = await Show.findOne({ _id: sId });
        if (!exists) {
          await Show.create({
            _id: sId,
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
    }

    // 6. Bookings
    if (data.bookings && data.bookings.length > 0) {
      for (const b of data.bookings) {
        const bId = b.bookingId || b._id;
        const exists = await Booking.findOne({ $or: [{ bookingId: bId }, { _id: b._id || bId }] });
        if (!exists) {
          await Booking.create({
            _id: b._id || bId,
            bookingId: bId,
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
          console.log(`[MongoDB] Migrated missing booking ${bId} to MongoDB`);
        }
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
    const store = require('../data/store');
    await store.loadFromMongo();
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
