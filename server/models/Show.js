const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  _id: { type: String },
  movie: { type: mongoose.Schema.Types.Mixed, required: true },
  theatre: { type: mongoose.Schema.Types.Mixed },
  screen: { type: mongoose.Schema.Types.Mixed },
  showDate: { type: String, required: true },
  showDateTime: { type: String },
  startTime: { type: String, default: '10:00 AM' },
  endTime: { type: String, default: '12:00 PM' },
  price: { type: Number, default: 200 },
  showPrice: { type: Number, default: 200 },
  bookedSeats: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Show', showSchema);
