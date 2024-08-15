const Trip = require("../models/Trip");
const axios = require("axios");
const { calculateFlightEmissions } = require("./carbonService");

// Helper function for sorting
function sortTrips(trips, sortBy) {
  if (sortBy === "fastest") {
    return trips.sort((a, b) => a.duration - b.duration);
  } else if (sortBy === "cheapest") {
    return trips.sort((a, b) => a.cost - b.cost);
  }
  return trips;
}

async function getTripsFromExternalAPI(origin, destination) {
  try {
    // Construct the URL with query parameters
    const url =
      `https://z0qw1e7jpd.execute-api.eu-west-1.amazonaws.com/default/trips?origin=${origin}&destination=${destination}`;

    const response = await axios.get(url, {
      headers: { "x-api-key": process.env.API_KEY },
    });

    return response.data
  } catch (error) {
    console.error("Error fetching trips from external API:", error);
    res.status(500).json({
      message: "Error fetching trips from external API:",
      error: error.message,
    });
  }
}

// Fetch trips from external API and sort them, including carbon emission data
async function getTrips(origin, destination, sortBy) {
  try {

    let trips= await getTripsFromExternalAPI(origin, destination);
    
    trips = trips.filter((trip) =>
      trip.origin === origin && trip.destination === destination
    );

    if (trips.length === 0) {
      return null; // Return null to indicate that no trips were found for the specified origin and destination
    }

    trips = sortTrips(trips, sortBy);

    // Add carbon emission data to each trip if the type is 'flight'
    for (let trip of trips) {
      if (trip.type === "flight") {
        const legs = [
          {
            departure_airport: trip.origin,
            destination_airport: trip.destination,
          },
        ];
        const emissions = await calculateFlightEmissions(1, legs); //Calculates emissions for 1 person for 1 way flight
        trip.carbon_kg = emissions.carbon_kg;
        trip.carbon_mt = emissions.carbon_mt;
      }
    }
    return trips;
  } catch (error) {
    console.error("Error while executing getTrips function:", error);
  }
}

// Fetch trips from external API and aggregate them by type accordingly
async function aggregateTripsByType(origin, destination, type) {
  try {
    const trips = await getTripsFromExternalAPI(origin, destination);

    const filteredTrips = trips.filter((trip) => trip.type === type);

    if (filteredTrips.length === 0) {
      return null;
    }

    const totalTrips = filteredTrips.length;
    const totalCost = filteredTrips.reduce((acc, trip) => acc + trip.cost, 0);
    const totalDuration = filteredTrips.reduce(
      (acc, trip) => acc + trip.duration,
      0,
    );

    const averageCost = totalCost / totalTrips;
    const averageDuration = totalDuration / totalTrips;

    return {
      origin,
      destination,
      type,
      total_trips: totalTrips,
      average_cost: averageCost,
      average_duration: averageDuration,
    };
  } catch (error) {
    console.error("Error in aggregateTripsByType:", error);
    throw error;
  }
}

async function findBestValueTrip(origin, destination) {
  try {
    const trips = await getTripsFromExternalAPI(origin, destination);

    const bestValueTrip = trips.reduce((prev, current) => {
      const prevValueScore = prev.cost / prev.duration;
      const currentValueScore = current.cost / current.duration;
      return prevValueScore < currentValueScore ? prev : current;
    });

    return bestValueTrip;
  } catch (error) {
    console.error('Error in findBestValueTrip:', error);
    throw error;
  }
}


// Save a new trip to the database
async function saveTrip(tripData) {
  try {
    const newTrip = new Trip(tripData);
    await newTrip.save();
    return newTrip;
  } catch (error) {
    console.error("Error saving trip to database:", error);
  }
}

// List all saved trips from the database
async function listSavedTrips() {
  try {
    return await Trip.find();
  } catch (error) {
    console.error("Error listing saved trips:", error);
  }
}

// Delete a trip by ID from the database
async function deleteTripById(id) {
  try {
    const result = await Trip.deleteOne({ _id: id });
    return result.deletedCount > 0; // Returns true if a trip was deleted, false if not
  } catch (error) {
    console.error("Error deleting trip from database:", error);
  }
}

// Export all functions
module.exports = {
  getTrips,
  saveTrip,
  listSavedTrips,
  deleteTripById,
  aggregateTripsByType,
  findBestValueTrip
};
