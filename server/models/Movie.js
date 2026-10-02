const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  _id: { type: String, default: () => String(Date.now()) },
  id: { type: mongoose.Schema.Types.Mixed },
  title: { type: String, required: true },
  overview: { type: String, default: '' },
  description: { type: String, default: '' },
  poster: { type: String, default: '' },
  poster_path: { type: String, default: '' },
  backdrop_path: { type: String, default: '' },
  genre: [{ type: String }],
  genres: [{ id: mongoose.Schema.Types.Mixed, name: String }],
  language: { type: String, default: 'English' },
  duration: { type: Number, default: 120 },
  runtime: { type: Number, default: 120 },
  rating: { type: Number, default: 7.0 },
  vote_average: { type: Number, default: 7.0 },
  releaseDate: { type: String },
  release_date: { type: String },
  status: { type: String, default: 'now_showing' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Movie', movieSchema);
