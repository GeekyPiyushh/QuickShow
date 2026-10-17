const router = require("express").Router();
const store = require("../data/store");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { movieFields, newId } = require("../utils/adminDomain");
router.get("/", (req, res) =>
  res.json({
    success: true,
    movies: store.getMovies().filter((m) => m.status !== "archived"),
  }),
);
router.get("/:id", (req, res) => {
  const movie = store.getMovieById(req.params.id);
  res
    .status(movie ? 200 : 404)
    .json({
      success: !!movie,
      movie,
      message: movie ? undefined : "Movie not found",
    });
});
router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const movie = await store.mutate((d) => {
      const m = {
        ...movieFields(req.body),
        _id: newId("mv_"),
        createdAt: new Date().toISOString(),
      };
      d.movies.unshift(m);
      return m;
    });
    res.status(201).json({ success: true, movie });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
