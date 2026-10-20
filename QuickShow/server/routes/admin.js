const router = require("express").Router();
const store = require("../data/store");
const { authenticate, requireAdmin } = require("../middleware/auth");
const {
  fail,
  idOf,
  active,
  startAt,
  movieFields,
  showFields,
  cancelBooking,
} = require("../utils/adminDomain");
router.use(authenticate, requireAdmin);
router.get("/data", (req, res) =>
  res.json({
    success: true,
    movies: store.getMovies(),
    shows: store.getShows(),
    bookings: store.getAllBookings(),
    users: store.getAllUsers(),
    theatres: store.getTheatres(),
    screens: store.getScreens(),
  }),
);
router.put("/movies/:id", async (req, res, next) => {
  try {
    const movie = await store.mutate((d) => {
      const m = d.movies.find((x) => idOf(x) === req.params.id);
      if (!m) fail("Movie not found", 404);
      const fields = movieFields({ ...m, ...req.body });
      const future = d.shows.filter(
        (s) =>
          idOf(s.movie) === idOf(m) &&
          s.status !== "cancelled" &&
          startAt(s) > Date.now(),
      );
      if (fields.status === "archived" && future.length)
        fail("Cancel upcoming shows before archiving this movie.", 409);
      if (fields.duration !== Number(m.duration || m.runtime) && future.length)
        fail("Duration cannot change while future shows are scheduled.", 409);
      Object.assign(m, fields);
      for (const s of future) s.movie = structuredClone(m);
      return m;
    });
    res.json({ success: true, movie });
  } catch (e) {
    next(e);
  }
});
router.put("/shows/:id", async (req, res, next) => {
  try {
    const show = await store.mutate((d) => {
      const s = d.shows.find((x) => idOf(x) === req.params.id);
      if (!s) fail("Show not found", 404);
      if (s.status === "cancelled")
        fail("A cancelled show cannot be edited.", 409);
      if (
        (s.bookedSeats || []).length ||
        d.bookings.some((b) => active(b) && idOf(b.show) === idOf(s))
      )
        fail("This show has bookings. Cancel bookings before editing.", 409);
      Object.assign(s, showFields(d, { ...s, ...req.body }, s._id));
      return s;
    });
    res.json({ success: true, show });
  } catch (e) {
    next(e);
  }
});
router.post("/shows/:id/cancel", async (req, res, next) => {
  try {
    const show = await store.mutate((d) => {
      const s = d.shows.find((x) => idOf(x) === req.params.id);
      if (!s) fail("Show not found", 404);
      if (s.status === "cancelled") return s;
      if (startAt(s) <= Date.now())
        fail("Past or started shows cannot be cancelled.");
      for (const b of d.bookings.filter((b) => idOf(b.show) === idOf(s)))
        cancelBooking(d, b);
      s.status = "cancelled";
      return s;
    });
    res.json({ success: true, show });
  } catch (e) {
    next(e);
  }
});
router.post("/bookings/:id/cancel", async (req, res, next) => {
  try {
    const booking = await store.mutate((d) => {
      const b = d.bookings.find((x) => idOf(x) === req.params.id);
      if (!b) fail("Booking not found", 404);
      if (!active(b)) return b;
      const s = d.shows.find((s) => idOf(s) === idOf(b.show));
      if (!s)
        fail(
          "Legacy booking has no linked show; manual review is required.",
          409,
        );
      if (startAt(s) <= Date.now())
        fail("Bookings can only be cancelled before the show starts.");
      return cancelBooking(d, b);
    });
    res.json({ success: true, booking });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
