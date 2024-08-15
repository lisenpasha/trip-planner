const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  cost: { type: Number, required: true },
  duration: { type: Number, required: true },
  type: { type: String, required: true },
  external_id: { type: String, required: true },  // Renamed from 'id' for higher clarity
  display_name: { type: String, required: true }
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
