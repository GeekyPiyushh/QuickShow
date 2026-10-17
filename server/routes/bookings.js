const router = require("express").Router();
const store = require("../data/store");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { fail, idOf, startAt, seatIds, newId } = require("../utils/adminDomain");
router.get("/my", authenticate, (req, res) =>
  res.json({ success: true, bookings: store.getUserBookings(req.user._id) }),
);
router.get("/", authenticate, requireAdmin, (req, res) =>
  res.json({ success: true, bookings: store.getAllBookings() }),
);
router.post("/", authenticate, async (req, res, next) => {
  try {
    const booking = await store.mutate((d) => {
      const show = d.shows.find((s) => idOf(s) === idOf(req.body.show));
      if (!show || show.status === "cancelled" || startAt(show) <= Date.now())
        fail("Select an available future show.");
      const seats = Array.isArray(req.body.seats)
        ? req.body.seats.map((s) => s?.seatNumber || s)
        : [];
      const valid = new Set(seatIds(show.screen));
      if (
        !seats.length ||
        seats.length > 5 ||
        new Set(seats).size !== seats.length ||
        seats.some((s) => !valid.has(s))
      )
        fail("Select 1–5 unique valid seats.");
      if (seats.some((s) => (show.bookedSeats || []).includes(s)))
        fail("One or more seats were just booked. Please choose again.", 409);
      show.bookedSeats = [...(show.bookedSeats || []), ...seats];
      const id = newId("BK"),
        totalAmount = Number(show.price) * seats.length;
      const b = {
        _id: id,
        bookingId: id,
        user: { _id: req.user._id, name: req.user.name, email: req.user.email },
        userId: req.user._id,
        show: structuredClone(show),
        seats: seats.map((seatNumber) => ({ seatNumber })),
        bookedSeats: seats,
        totalAmount,
        amount: totalAmount,
        isPaid: false,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        bookedAt: new Date().toISOString(),
      };
      d.bookings.unshift(b);
      return b;
    });
    res.status(201).json({ success: true, booking });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
