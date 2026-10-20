const { randomUUID } = require("crypto");
function fail(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  throw e;
}
const idOf = (x) => String(x?._id ?? x ?? "");
const active = (b) => b.status !== "cancelled";
function startAt(s) {
  const t = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(s.startTime || "");
  if (!t) return NaN;
  let h = Number(t[1]),
    m = Number(t[2]);
  if (m > 59 || (t[3] ? h < 1 || h > 12 : h > 23)) return NaN;
  if (t[3]) h = (h % 12) + (t[3].toUpperCase() === "PM" ? 12 : 0);
  return Date.parse(
    `${String(s.showDate).slice(0, 10)}T${String(h).padStart(2, "0")}:${t[2]}:00+05:30`,
  );
}
function seatIds(screen) {
  const capacity = Number(screen?.totalSeats || 90);
  return Array.from(
    { length: capacity },
    (_, i) => String.fromCharCode(65 + Math.floor(i / 9)) + ((i % 9) + 1),
  );
}
function movieFields(input) {
  const title = String(input.title || "").trim(),
    duration = Number(input.duration ?? input.runtime),
    rating = Number(input.rating ?? 0);
  if (!title || title.length > 200)
    fail("Enter a movie title (max 200 characters).");
  if (!Number.isInteger(duration) || duration < 1 || duration > 600)
    fail("Duration must be 1–600 minutes.");
  if (!Number.isFinite(rating) || rating < 0 || rating > 10)
    fail("Rating must be between 0 and 10.");
  if (!["now_showing", "coming_soon", "archived"].includes(input.status))
    fail("Invalid movie status.");
  const genre = Array.isArray(input.genre)
    ? input.genre
    : String(input.genre || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
  for (const field of ["poster", "trailer"])
    if (input[field] && !/^https?:\/\//i.test(input[field]))
      fail(`${field} must be an HTTP(S) URL.`);
  const description = String(input.description || ""),
    poster = String(input.poster || ""),
    releaseDate = String(input.releaseDate || "");
  if (releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate))
    fail("Invalid release date.");
  return {
    title,
    duration,
    runtime: duration,
    rating,
    vote_average: rating,
    status: input.status,
    genre,
    genres: genre.map((name, i) => ({ id: i + 1, name })),
    description,
    overview: description,
    poster,
    poster_path: poster,
    language: String(input.language || "English"),
    releaseDate,
    release_date: releaseDate,
    trailer: String(input.trailer || ""),
  };
}
function showFields(d, input, exclude) {
  const movie = d.movies.find((x) => idOf(x) === idOf(input.movie));
  const screen = d.screens.find((x) => idOf(x) === idOf(input.screen));
  const theatre = d.theatres.find((x) => idOf(x) === idOf(input.theatre));
  if (
    !movie ||
    movie.status === "archived" ||
    !screen ||
    !theatre ||
    idOf(screen.theatre) !== idOf(theatre)
  )
    fail("Choose a valid movie, theatre and matching screen.");
  const price = Number(input.price),
    start = startAt(input),
    buffer = Number(input.turnaroundMinutes ?? 15);
  if (!Number.isFinite(price) || price <= 0 || price > 100000)
    fail("Enter a valid positive ticket price.");
  if (!Number.isFinite(start) || start <= Date.now())
    fail("Choose a future show date and time (India time).");
  if (!Number.isInteger(buffer) || buffer < 0 || buffer > 120)
    fail("Turnaround must be 0–120 minutes.");
  const end = start + Number(movie.duration || movie.runtime || 120) * 60000;
  const overlap = d.shows.some(
    (s) =>
      idOf(s) !== String(exclude) &&
      s.status !== "cancelled" &&
      idOf(s.screen) === idOf(screen) &&
      start <
        startAt(s) +
          (Number(s.movie?.duration || s.movie?.runtime || 120) +
            Number(s.turnaroundMinutes ?? 15)) *
            60000 &&
      startAt(s) < end + buffer * 60000,
  );
  if (overlap)
    fail(
      "This screen already has an overlapping show (including turnaround time).",
      409,
    );
  return {
    movie: structuredClone(movie),
    theatre: structuredClone(theatre),
    screen: structuredClone(screen),
    price,
    showPrice: price,
    showDate: String(input.showDate).slice(0, 10),
    showDateTime: new Date(start).toISOString(),
    startTime: input.startTime,
    endTime: new Date(end).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    }),
    turnaroundMinutes: buffer,
    status: "scheduled",
  };
}
function cancelBooking(d, b) {
  if (!active(b)) return b;
  const show = d.shows.find((s) => idOf(s) === idOf(b.show));
  const seats = (b.bookedSeats || b.seats || []).map((s) => s.seatNumber || s);
  const held = new Set(
    d.bookings
      .filter((x) => x !== b && active(x) && idOf(x.show) === idOf(b.show))
      .flatMap((x) =>
        (x.bookedSeats || x.seats || []).map((s) => s.seatNumber || s),
      ),
  );
  if (show)
    show.bookedSeats = (show.bookedSeats || []).filter(
      (s) => !seats.includes(s) || held.has(s),
    );
  b.status = "cancelled";
  b.cancelledAt = new Date().toISOString();
  b.refundStatus = b.isPaid ? "review_required" : "not_applicable";
  return b;
}
module.exports = {
  fail,
  idOf,
  active,
  startAt,
  seatIds,
  movieFields,
  showFields,
  cancelBooking,
  newId: (p) => p + randomUUID(),
};
