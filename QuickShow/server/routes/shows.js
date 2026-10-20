const router = require("express").Router();
const store = require("../data/store");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { showFields, newId, seatIds } = require("../utils/adminDomain");
router.get("/", (req, res) =>
  res.json({
    success: true,
    shows: store.getShows().filter((s) => s.status !== "cancelled"),
  }),
);
router.get("/:id/seats", (req, res) => {
  const show = store.getShowById(req.params.id);
  res
    .status(show ? 200 : 404)
    .json({
      success: !!show,
      show,
      bookedSeats: show?.bookedSeats || [],
      seats: show ? seatIds(show.screen) : [],
      message: show ? undefined : "Show not found",
    });
});
router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const show = await store.mutate((d) => {
      const s = {
        ...showFields(d, req.body),
        _id: newId("sh_"),
        bookedSeats: [],
        createdAt: new Date().toISOString(),
      };
      d.shows.unshift(s);
      return s;
    });
    res.status(201).json({ success: true, show });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
