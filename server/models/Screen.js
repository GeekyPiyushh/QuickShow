const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'sc_' + Date.now() },
  name: { type: String, required: true },
  theatre: { type: mongoose.Schema.Types.Mixed },
  totalSeats: { type: Number, default: 90 },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Screen', screenSchema);
