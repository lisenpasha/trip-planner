const tripService = require('../services/tripService');

// Search trips
async function searchTrips(req, res) {
  const { origin, destination, sort_by } = req.query;
  try {
    const trips = await tripService.getTrips(origin, destination, sort_by);
    if (trips === null) {
      return res.status(404).json({ message: 'No trips available for the specified origin and destination.' });
    }
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error); 
    res.status(500).json({ message: 'Error fetching trips', error: error.message });
  }
}

// Trip Type Aggregation (Extra Feature)
async function aggregateTrips(req, res) {
  const { origin, destination, type } = req.query;

  try {
    const aggregatedData = await tripService.aggregateTripsByType(origin, destination, type);
    if (!aggregatedData) {
      return res.status(404).json({ message: 'No trips found for the specified criteria.' });
    }
    res.json(aggregatedData);
  } catch (error) {
    console.error('Error aggregating trips:', error);
    res.status(500).json({ message: 'Error aggregating trips', error: error.message });
  }
}

async function getBestValueTrip(req, res) {
  const { origin, destination } = req.query;

  try {
    const bestValueTrip = await tripService.findBestValueTrip(origin, destination);
    if (!bestValueTrip) {
      return res.status(404).json({ message: 'No trips found for the specified criteria.' });
    }
    res.json(bestValueTrip);
  } catch (error) {
    console.error('Error fetching best value trip:', error);
    res.status(500).json({ message: 'Error fetching best value trip', error: error.message });
  }
}

// Save a trip
async function saveTrip(req, res) {
  const tripData = req.body;
  try {
    const newTrip = await tripService.saveTrip(tripData);
    res.status(201).json({ 
      message: 'Trip saved successfully', 
      newTrip
    })
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ message: 'Error saving trip', error });
  }
}

// List all saved trips
async function listTrips(req, res) {
  try {
    const trips = await tripService.listSavedTrips();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching saved trips:', error);
    res.status(500).json({ message: 'Error fetching trips', error });
  }
}

// Delete a trip by ID
async function deleteTrip(req, res) {
  const { id } = req.params;
  try {
    const deleteSuccess = await tripService.deleteTripById(id);
    if (!deleteSuccess) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    res.status(200).json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Error deleting trip', error });
  }
}

// Export all functions
module.exports = {
  searchTrips,
  saveTrip,
  listTrips,
  deleteTrip,
  aggregateTrips,
  getBestValueTrip
};
