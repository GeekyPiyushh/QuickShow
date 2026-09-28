const express = require('express');
const store = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/movies
router.get('/', (req, res) => {
  const movies = store.getMovies();
  return res.json({
    success: true,
    movies,
  });
});

// GET /api/movies/:id
router.get('/:id', (req, res) => {
  const movie = store.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({
      success: false,
      message: 'Movie not found',
    });
  }
  return res.json({
    success: true,
    movie,
  });
});

// POST /api/movies (Admin only)
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { title, description, genre, language, duration, releaseDate, poster, rating, status } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const genreList = Array.isArray(genre) ? genre : [genre].filter(Boolean);
    const newMovie = store.createMovie({
      title: title.trim(),
      description: description || '',
      overview: description || '',
      genre: genreList,
      genres: genreList.map((g, i) => ({ id: i + 1, name: g })),
      language: language || 'English',
      duration: Number(duration) || 120,
      runtime: Number(duration) || 120,
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      release_date: releaseDate || new Date().toISOString().split('T')[0],
      poster: poster || '',
      poster_path: poster || '',
      rating: Number(rating) || 7.0,
      vote_average: Number(rating) || 7.0,
      status: status || 'now_showing',
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie: newMovie,
    });
  } catch (err) {
    console.error('Error creating movie:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create movie',
    });
  }
});

module.exports = router;
