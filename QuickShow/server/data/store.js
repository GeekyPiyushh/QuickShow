const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");

const DB_FILE = process.env.DATA_FILE || path.join(__dirname, "db.json");

const INITIAL_MOVIES = [
  {
    _id: "324544",
    id: 324544,
    title: "In the Lost Lands",
    overview:
      "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
    description:
      "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
    poster:
      "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    poster_path:
      "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
    genre: ["Action", "Fantasy", "Adventure"],
    genres: [
      { id: 28, name: "Action" },
      { id: 14, name: "Fantasy" },
      { id: 12, name: "Adventure" },
    ],
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
    overview:
      "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
    description:
      "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
    poster:
      "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
    poster_path:
      "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
    genre: ["Horror", "Mystery"],
    genres: [
      { id: 27, name: "Horror" },
      { id: 9648, name: "Mystery" },
    ],
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
    overview:
      "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    description:
      "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    poster:
      "https://image.tmdb.org/t/p/original/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    poster_path:
      "https://image.tmdb.org/t/p/original/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnExvufwn49Scu6.jpg",
    genre: ["Action", "Adventure", "Drama"],
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
    ],
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
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    description:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    poster:
      "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    poster_path:
      "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520044.jpg",
    genre: ["Science Fiction", "Adventure"],
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" },
    ],
    language: "English",
    duration: 166,
    runtime: 166,
    rating: 8.5,
    vote_average: 8.5,
    releaseDate: "2024-03-01",
    status: "now_showing",
  },
];

const INITIAL_THEATRES = [
  {
    _id: "th_01",
    name: "QuickShow Grand Multiplex",
    city: "Downtown",
    location: "Downtown Plaza, 4th Floor",
  },
  {
    _id: "th_02",
    name: "CineStar IMAX & Dolby",
    city: "Metro",
    location: "Metro Heights Mall, Level 3",
  },
];

const INITIAL_SCREENS = [
  {
    _id: "sc_01",
    name: "Screen 1 (Dolby Atmos)",
    theatre: INITIAL_THEATRES[0],
    totalSeats: 90,
  },
  {
    _id: "sc_02",
    name: "Screen 2 (Gold Class)",
    theatre: INITIAL_THEATRES[0],
    totalSeats: 60,
  },
  {
    _id: "sc_03",
    name: "IMAX Laser Hall",
    theatre: INITIAL_THEATRES[1],
    totalSeats: 120,
  },
];

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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
    bookedSeats: ["A3", "A4", "B2"],
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
    bookedSeats: ["C5", "D1", "D2"],
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
    bookedSeats: ["E8", "F3", "G6"],
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
    bookedSeats: [],
  },
];

function seedDefaultData() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("password123", 10);

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
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "BK17275002",
      bookingId: "BK17275002",
      user: {
        _id: "usr_guest",
        name: "Rahul Verma",
        email: "rahul@example.com",
      },
      show: INITIAL_SHOWS[1],
      seats: [{ seatNumber: "C5" }],
      bookedSeats: ["C5"],
      totalAmount: 300,
      amount: 300,
      isPaid: true,
      bookedAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
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

const { randomUUID } = require("crypto");
const models = () =>
  Object.fromEntries(
    ["User", "Movie", "Theatre", "Screen", "Show", "Booking"].map((name, i) => [
      ["users", "movies", "theatres", "screens", "shows", "bookings"][i],
      require("../models/" + name),
    ]),
  );
class Store {
  constructor() {
    this.data = fs.existsSync(DB_FILE)
      ? JSON.parse(fs.readFileSync(DB_FILE, "utf8"))
      : seedDefaultData();
    this.mongo = false;
    this.isReplicaSet = false;
    this.rawIds = new Map();
    this.queue = Promise.resolve();
    if (!fs.existsSync(DB_FILE)) this.save(this.data);
  }
  save(data = this.data) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(DB_FILE + ".tmp", DB_FILE);
  }
  async loadFromMongo(isReplicaSet = false) {
    this.isReplicaSet = Boolean(isReplicaSet);
    this.rawIds = new Map();
    const result = {};
    for (const [key, Model] of Object.entries(models())) {
      const docs = await Model.find().lean();
      for (const d of docs) {
        this.rawIds.set(String(d._id), d._id);
      }
      result[key] = JSON.parse(JSON.stringify(docs));
    }
    this.data = result;
    this.mongo = true;
  }
  mutate(fn) {
    const task = this.queue.then(async () => {
      const next = structuredClone(this.data);
      const result = fn(next);
      if (this.mongo) {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState !== 1)
          throw new Error("Database unavailable. Please retry.");

        const diffs = [];
        for (const [key, Model] of Object.entries(models())) {
          const oldList = this.data[key];
          const newList = next[key];
          const oldMap = new Map(oldList.map((x) => [String(x._id), x]));
          const newMap = new Map(newList.map((x) => [String(x._id), x]));

          const changed = newList.filter(
            (x) => JSON.stringify(oldMap.get(String(x._id))) !== JSON.stringify(x),
          );
          const deleted = oldList.filter((x) => !newMap.has(String(x._id)));

          if (changed.length || deleted.length) {
            diffs.push({ key, Model, changed, deleted, oldMap });
          }
        }

        if (this.isReplicaSet) {
          const session = await mongoose.startSession();
          try {
            await session.withTransaction(async () => {
              for (const { Model, changed, deleted } of diffs) {
                for (const doc of changed) {
                  const docIdStr = String(doc._id);
                  const mongoId = this.rawIds.get(docIdStr) || doc._id;
                  const docToWrite = { ...doc, _id: mongoId };
                  await Model.replaceOne({ _id: mongoId }, docToWrite, {
                    upsert: true,
                    session,
                    runValidators: true,
                  });
                  this.rawIds.set(docIdStr, mongoId);
                }
                for (const doc of deleted) {
                  const docIdStr = String(doc._id);
                  const mongoId = this.rawIds.get(docIdStr) || doc._id;
                  await Model.deleteOne({ _id: mongoId }, { session });
                  this.rawIds.delete(docIdStr);
                }
              }
            });
          } finally {
            await session.endSession();
          }
        } else {
          // Standalone MongoDB safe persistence with compensating rollback journal
          const rollbackActions = [];
          try {
            for (const { Model, changed, deleted, oldMap } of diffs) {
              for (const doc of changed) {
                const docIdStr = String(doc._id);
                const isExisting = oldMap.has(docIdStr);
                const mongoId = this.rawIds.get(docIdStr) || doc._id;
                const docToWrite = { ...doc, _id: mongoId };

                if (isExisting) {
                  const oldDoc = oldMap.get(docIdStr);
                  const oldDocToWrite = { ...oldDoc, _id: mongoId };
                  rollbackActions.push(async () => {
                    await Model.replaceOne({ _id: mongoId }, oldDocToWrite, {
                      upsert: true,
                    });
                  });
                } else {
                  rollbackActions.push(async () => {
                    await Model.deleteOne({ _id: mongoId });
                    this.rawIds.delete(docIdStr);
                  });
                }

                await Model.replaceOne({ _id: mongoId }, docToWrite, {
                  upsert: true,
                  runValidators: true,
                });
                this.rawIds.set(docIdStr, mongoId);
              }

              for (const doc of deleted) {
                const docIdStr = String(doc._id);
                const mongoId = this.rawIds.get(docIdStr) || doc._id;
                const oldDocToWrite = { ...doc, _id: mongoId };

                rollbackActions.push(async () => {
                  await Model.replaceOne({ _id: mongoId }, oldDocToWrite, {
                    upsert: true,
                  });
                  this.rawIds.set(docIdStr, mongoId);
                });

                await Model.deleteOne({ _id: mongoId });
                this.rawIds.delete(docIdStr);
              }
            }
          } catch (writeErr) {
            for (let i = rollbackActions.length - 1; i >= 0; i--) {
              try {
                await rollbackActions[i]();
              } catch (rbErr) {
                console.error("Compensating rollback error:", rbErr.message || rbErr);
              }
            }
            throw writeErr;
          }
        }
      } else {
        this.save(next);
      }
      this.data = next;
      return result;
    });
    this.queue = task.catch(() => {});
    return task;
  }
  findUserByEmail(email) {
    return this.data.users.find(
      (x) => x.email?.toLowerCase() === email?.trim().toLowerCase(),
    );
  }
  findUserById(id) {
    return this.data.users.find((x) => String(x._id) === String(id));
  }
  getAllUsers() {
    return this.data.users.map(({ password, ...u }) => u);
  }
  getMovies() {
    return this.data.movies;
  }
  getMovieById(id) {
    return this.data.movies.find(
      (x) => String(x._id) === String(id) || String(x.id) === String(id),
    );
  }
  getShows() {
    return this.data.shows;
  }
  getShowById(id) {
    return this.data.shows.find((x) => String(x._id) === String(id));
  }
  getTheatres() {
    return this.data.theatres;
  }
  getScreens() {
    return this.data.screens;
  }
  getAllBookings() {
    return this.data.bookings;
  }
  getUserBookings(id) {
    return this.data.bookings.filter(
      (x) => String(x.userId || x.user?._id) === String(id),
    );
  }
  createUser(input) {
    return this.mutate((d) => {
      if (
        d.users.some((x) => x.email.toLowerCase() === input.email.toLowerCase())
      )
        throw new Error("Email already registered");
      const u = {
        ...input,
        _id: "usr_" + randomUUID(),
        createdAt: new Date().toISOString(),
      };
      d.users.push(u);
      return u;
    });
  }
}
module.exports = new Store();
