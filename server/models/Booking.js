const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  _id: { type: String },
  bookingId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.Mixed },
  userId: { type: String },
  show: { type: mongoose.Schema.Types.Mixed },
  seats: [{ type: mongoose.Schema.Types.Mixed }],
  bookedSeats: [{ type: String }],
  totalAmount: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: true },
  bookedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Booking', bookingSchema);
