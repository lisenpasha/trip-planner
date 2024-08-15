const mongoose = require("mongoose");
const Trip = require('../models/Trip');

const validAirports = [
  "ATL", "PEK", "LAX", "DXB", "HND", "ORD", "LHR", "PVG", "CDG", "DFW",
  "AMS", "FRA", "IST", "CAN", "JFK", "SIN", "DEN", "ICN", "BKK", "SFO",
  "LAS", "CLT", "MIA", "KUL", "SEA", "MUC", "EWR", "MAD", "HKG", "MCO",
  "PHX", "IAH", "SYD", "MEL", "GRU", "YYZ", "LGW", "BCN", "MAN", "BOM",
  "DEL", "ZRH", "SVO", "DME", "JNB", "ARN", "OSL", "CPH", "HEL", "VIE"
];

const validSortByOptions = ["fastest", "cheapest"];
const validTripTypeOptions = ["car", "flight", "train"];

// Helper function to validate presence of required parameters
function validateRequiredParams(req, res, requiredParams) {
  for (const param of requiredParams) {
    if (!req.query[param]) {
      res.status(400).json({ message: `Missing ${param} parameter.` });
      return false;
    }
  }
  return true;
}

// Helper function to validate origin and destination
function validateOriginAndDestination(req, res) {
  let { origin, destination } = req.query;

  origin = origin.toUpperCase();
  destination = destination.toUpperCase();

  // Check if origin and destination are different
  if (origin === destination) {
    res.status(400).json({ message: "Origin must be different from destination." });
    return false;
  }

  if (!validAirports.includes(origin)) {
    res.status(400).json({ message: "Invalid origin parameter." });
    return false;
  }

  if (!validAirports.includes(destination)) {
    res.status(400).json({ message: "Invalid destination parameter." });
    return false;
  }

  req.query.origin = origin;
  req.query.destination = destination;
  return true;
}

// Middleware for validating trip search
function validateTripSearch(req, res, next) {
  try {
    const requiredParams = ["origin", "destination", "sort_by"];
    if (!validateRequiredParams(req, res, requiredParams)) return;

    if (!validateOriginAndDestination(req, res)) return;

    req.query.sort_by = req.query.sort_by.toLowerCase();
    if (!validSortByOptions.includes(req.query.sort_by)) {
      return res.status(400).json({
        message: 'Invalid sort_by value. Must be "fastest" or "cheapest".',
      });
    }

    next();
  } catch (error) {
    console.error('Error during trip search validation:', error);
    res.status(500).json({
      message: "An error occurred during validation.",
      error: error.message,
    });
  }
}

// Middleware for validating trip aggregation
function validateTripAggregator(req, res, next) {
  try {
    const requiredParams = ["origin", "destination", "type"];
    if (!validateRequiredParams(req, res, requiredParams)) return;

    if (!validateOriginAndDestination(req, res)) return;

    req.query.type = req.query.type.toLowerCase();
    if (!validTripTypeOptions.includes(req.query.type)) {
      return res.status(400).json({
        message: `Invalid type value. Must be "car", "flight" or "train".`,
      });
    }

    next();
  } catch (error) {
    console.error('Error during trip aggregator validation:', error);
    res.status(500).json({
      message: "An error occurred during validation.",
      error: error.message,
    });
  }
}

// Middleware for validating best value trip
function validateBestValueTrip(req, res, next) {
  try {
    const requiredParams = ["origin", "destination"];
    if (!validateRequiredParams(req, res, requiredParams)) return;

    if (!validateOriginAndDestination(req, res)) return;

    next();
  } catch (error) {
    console.error('Error during best value trip validation:', error);
    res.status(500).json({
      message: "An error occurred during validation.",
      error: error.message,
    });
  }
}

// Middleware for validating trip ID
function validateTripId(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Trip ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid trip ID format." });
  }

  next();
}

// Middleware for validating trip object in the request body
async function validateTripObject(req, res, next) {
  let { origin, destination, cost, duration, type, id, display_name } = req.body;
  const external_id = id;

  if (!origin || !destination || !cost || !duration || !type || !external_id || !display_name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (typeof origin !== 'string' || typeof destination !== 'string' || typeof type !== 'string' || typeof display_name !== 'string') {
    return res.status(400).json({ message: 'Origin, destination, type, and display_name must be strings.' });
  }

  if (typeof cost !== 'number' || typeof duration !== 'number') {
    return res.status(400).json({ message: 'Cost and duration must be numbers.' });
  }

  try {
    const existingTrip = await Trip.findOne({ external_id });
    if (existingTrip) {
      return res.status(409).json({ message: 'Trip with this id already exists.' });
    }
  } catch (error) {
    console.error('Error during new trip object check:', error); 
    return res.status(500).json({ message: 'Error checking for existing trip', error: error.message });
  }

  req.body.external_id = external_id;
  delete req.body.id;

  next();
}

module.exports = {
  validateTripSearch,
  validateTripId,
  validateTripObject,
  validateTripAggregator,
  validateBestValueTrip,
};
