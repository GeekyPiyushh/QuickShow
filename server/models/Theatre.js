const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  _id: { type: String, default: () => 'th_' + Date.now() },
  name: { type: String, required: true },
  city: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Theatre', theatreSchema);
