const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_MOVIES = [
  {
    _id: "324544",
    id: 324544,
    title: "In the Lost Lands",
    overview: "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
    description: "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
    poster: "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    poster_path: "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
    genre: ["Action", "Fantasy", "Adventure"],
    genres: [{ id: 28, name: "Action" }, { id: 14, name: "Fantasy" }, { id: 12, name: "Adventure" }],
    language: "English",
    duration: 102,
    runtime: 102,
    rating: 6.4,
    vote_average: 6.4,
    releaseDate: "2025-02-27",
    status: "now_showing",
  },
  {
    _id: "1232546",
    id: 1232546,
    title: "Until Dawn",
    overview: "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
    description: "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
    poster: "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
    poster_path: "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
    genre: ["Horror", "Mystery"],
    genres: [{ id: 27, name: "Horror" }, { id: 9648, name: "Mystery" }],
    language: "English",
    duration: 98,
    runtime: 98,
    rating: 7.2,
    vote_average: 7.2,
    releaseDate: "2025-03-10",
    status: "now_showing",
  },
  {
    _id: "558449",
    id: 558449,
    title: "Gladiator II",
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    description: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    poster: "https://image.tmdb.org/t/p/original/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    poster_path: "https://image.tmdb.org/t/p/original/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnExvufwn49Scu6.jpg",
    genre: ["Action", "Adventure", "Drama"],
    genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 18, name: "Drama" }],
    language: "English",
    duration: 148,
    runtime: 148,
    rating: 7.8,
    vote_average: 7.8,
    releaseDate: "2024-11-22",
    status: "now_showing",
  },
  {
    _id: "693134",
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    description: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    poster: "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    poster_path: "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520044.jpg",
    genre: ["Science Fiction", "Adventure"],
    genres: [{ id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }],
    language: "English",
    duration: 166,
    runtime: 166,
    rating: 8.5,
    vote_average: 8.5,
    releaseDate: "2024-03-01",
    status: "now_showing",
  }
];

const INITIAL_THEATRES = [
  { _id: "th_01", name: "SnapSeat Grand Multiplex", city: "Downtown", location: "Downtown Plaza, 4th Floor" },
  { _id: "th_02", name: "CineStar IMAX & Dolby", city: "Metro", location: "Metro Heights Mall, Level 3" }
];

const INITIAL_SCREENS = [
  { _id: "sc_01", name: "Screen 1 (Dolby Atmos)", theatre: INITIAL_THEATRES[0], totalSeats: 90 },
  { _id: "sc_02", name: "Screen 2 (Gold Class)", theatre: INITIAL_THEATRES[0], totalSeats: 60 },
  { _id: "sc_03", name: "IMAX Laser Hall", theatre: INITIAL_THEATRES[1], totalSeats: 120 }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const INITIAL_SHOWS = [
  {
    _id: "sh_01",
    movie: INITIAL_MOVIES[0],
    theatre: INITIAL_THEATRES[0],
    screen: INITIAL_SCREENS[0],
    showDate: today,
    showDateTime: `${today}T10:00:00.000Z`,
    startTime: "10:00 AM",
    endTime: "11:42 AM",
    price: 250,
    showPrice: 250,
    bookedSeats: ["A3", "A4", "B2"]
  },
  {
    _id: "sh_02",
    movie: INITIAL_MOVIES[1],
    theatre: INITIAL_THEATRES[0],
    screen: INITIAL_SCREENS[1],
    showDate: today,
    showDateTime: `${today}T14:30:00.000Z`,
    startTime: "02:30 PM",
    endTime: "04:08 PM",
    price: 300,
    showPrice: 300,
    bookedSeats: ["C5", "D1", "D2"]
  },
  {
    _id: "sh_03",
    movie: INITIAL_MOVIES[2],
    theatre: INITIAL_THEATRES[1],
    screen: INITIAL_SCREENS[2],
    showDate: today,
    showDateTime: `${today}T18:00:00.000Z`,
    startTime: "06:00 PM",
    endTime: "08:28 PM",
    price: 450,
    showPrice: 450,
    bookedSeats: ["E8", "F3", "G6"]
  },
  {
    _id: "sh_04",
    movie: INITIAL_MOVIES[3],
    theatre: INITIAL_THEATRES[1],
    screen: INITIAL_SCREENS[2],
    showDate: tomorrow,
    showDateTime: `${tomorrow}T20:00:00.000Z`,
    startTime: "08:00 PM",
    endTime: "10:46 PM",
    price: 450,
    showPrice: 450,
    bookedSeats: []
  }
];

function seedDefaultData() {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('password123', 10);

  const adminUser = {
    _id: "usr_admin",
    name: "Administrator",
    email: "admin@example.com",
    password: adminPasswordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  const demoUser = {
    _id: "usr_piyush",
    name: "Piyush Tehalani",
    email: "piyush@example.com",
    password: userPasswordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  const initialBookings = [
    {
      _id: "BK17275001",
      bookingId: "BK17275001",
      user: { _id: demoUser._id, name: demoUser.name, email: demoUser.email },
      show: INITIAL_SHOWS[0],
      seats: [{ seatNumber: "A3" }, { seatNumber: "A4" }],
      bookedSeats: ["A3", "A4"],
      totalAmount: 500,
      amount: 500,
      isPaid: true,
      bookedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "BK17275002",
      bookingId: "BK17275002",
      user: { _id: "usr_guest", name: "Rahul Verma", email: "rahul@example.com" },
      show: INITIAL_SHOWS[1],
      seats: [{ seatNumber: "C5" }],
      bookedSeats: ["C5"],
      totalAmount: 300,
      amount: 300,
      isPaid: true,
      bookedAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return {
    users: [adminUser, demoUser],
    movies: INITIAL_MOVIES,
    theatres: INITIAL_THEATRES,
    screens: INITIAL_SCREENS,
    shows: INITIAL_SHOWS,
    bookings: initialBookings,
  };
}

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initial = seedDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      this.data = initial;
    } else {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
      } catch (err) {
        console.error('Error reading db.json, re-seeding:', err.message);
        this.data = seedDefaultData();
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err.message);
    }
  }

  // Users
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u._id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  getAllUsers() {
    return this.data.users.map(({ password, ...rest }) => rest);
  }

  // Movies
  getMovies() {
    return this.data.movies;
  }

  getMovieById(id) {
    return this.data.movies.find(m => m._id === id || String(m.id) === String(id));
  }

  createMovie(movieData) {
    const id = Date.now().toString();
    const newMovie = {
      _id: id,
      id: Number(id) || Date.now(),
      ...movieData,
      createdAt: new Date().toISOString(),
    };
    this.data.movies.unshift(newMovie);
    this.save();
    return newMovie;
  }

  // Theatres & Screens
  getTheatres() {
    return this.data.theatres;
  }

  getScreens() {
    return this.data.screens;
  }

  // Shows
  getShows() {
    return this.data.shows;
  }

  getShowById(id) {
    return this.data.shows.find(s => s._id === id || String(s.id) === String(id));
  }

  createShow(showData) {
    const movieObj = typeof showData.movie === 'object' ? showData.movie : this.getMovieById(showData.movie);
    const screenObj = typeof showData.screen === 'object' ? showData.screen : this.data.screens.find(sc => sc._id === showData.screen);
    const theatreObj = typeof showData.theatre === 'object' ? showData.theatre : this.data.theatres.find(th => th._id === showData.theatre);

    const newShow = {
      _id: 'sh_' + Date.now() + Math.random().toString(36).substring(2, 6),
      movie: movieObj || { title: 'Movie' },
      theatre: theatreObj || { name: 'Cinema' },
      screen: screenObj || { name: 'Screen 1' },
      showDate: showData.showDate,
      showDateTime: showData.showDateTime || showData.showDate,
      startTime: showData.startTime,
      endTime: showData.endTime,
      price: Number(showData.price) || 200,
      showPrice: Number(showData.price) || 200,
      bookedSeats: [],
      createdAt: new Date().toISOString(),
    };
    this.data.shows.unshift(newShow);
    this.save();
    return newShow;
  }

  // Bookings
  createBooking(bookingData) {
    const bookingId = 'BK' + Date.now();
    const newBooking = {
      _id: bookingId,
      bookingId: bookingId,
      ...bookingData,
      isPaid: true,
      bookedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Update booked seats on the show
    const showId = bookingData.show?._id || bookingData.show;
    const show = this.getShowById(showId);
    if (show) {
      if (!Array.isArray(show.bookedSeats)) show.bookedSeats = [];
      const newSeatIds = Array.isArray(bookingData.seats)
        ? bookingData.seats.map(s => (typeof s === 'object' ? s.seatNumber : s))
        : (bookingData.bookedSeats || []);
      show.bookedSeats.push(...newSeatIds);
    }

    this.data.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  getUserBookings(userId) {
    return this.data.bookings.filter(b => b.user?._id === userId || b.userId === userId);
  }

  getAllBookings() {
    return this.data.bookings;
  }
}

const store = new Store();
module.exports = store;
