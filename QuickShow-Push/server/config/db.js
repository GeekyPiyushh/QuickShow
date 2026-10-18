const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");

async function connectDB() {
  const store = require("../data/store");
  if (process.env.STORAGE_MODE === "file" || !process.env.MONGODB_URI) {
    console.log("Storage: atomic local JSON (single server).");
    return;
  }
  // MongoDB is authoritative when configured. Never silently fall back on outage.
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  let isReplicaSet = false;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    isReplicaSet = Boolean(hello.setName);
  } catch (err) {
    console.warn("Could not inspect replica set status:", err.message);
  }

  const names = ["User", "Movie", "Theatre", "Screen", "Show", "Booking"];
  const keys = ["users", "movies", "theatres", "screens", "shows", "bookings"];
  const counts = await Promise.all(
    names.map((n) => require("../models/" + n).countDocuments()),
  );
  // Import existing JSON only into an entirely empty database, once.
  if (counts.every((n) => n === 0)) {
    if (isReplicaSet) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          for (let i = 0; i < names.length; i++) {
            if (store.data[keys[i]].length) {
              await require("../models/" + names[i]).insertMany(
                store.data[keys[i]],
                { session },
              );
            }
          }
        });
      } finally {
        await session.endSession();
      }
    } else {
      for (let i = 0; i < names.length; i++) {
        if (store.data[keys[i]].length) {
          await require("../models/" + names[i]).insertMany(
            store.data[keys[i]],
          );
        }
      }
    }
  }
  await store.loadFromMongo(isReplicaSet);
  console.log(
    `Storage: MongoDB connected (${isReplicaSet ? "replica set transactions enabled" : "standalone safe persistence active"}).`,
  );
}

module.exports = { connectDB };

