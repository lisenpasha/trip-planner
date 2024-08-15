const axios = require('axios');

/**
 * carbonService.js
 * 
 * This service interacts with the Carbon Interface API to calculate the carbon emissions for flights.
 * It is an additional feature designed to provide users with information about the environmental impact 
 * of their trips, specifically focusing on carbon emissions for flights.
 * 
 */


// This function sends a request to the Carbon Interface API to calculate the carbon emissions for a flight.
async function calculateFlightEmissions(passengers, legs, distanceUnit = 'km') {
  try {
    const response = await axios.post('https://www.carboninterface.com/api/v1/estimates', {
      type: 'flight',
      passengers,
      legs,
      distance_unit: distanceUnit
    }, {
      headers: {
        "Authorization": 'Bearer ' + process.env.CARBON_INTERFACE_API_KEY,
        "Content-Type": 'application/json'
      }
    });

    return response.data.data.attributes;
  } catch (error) {
    console.error('Error calculating flight emissions:', error);
    throw new Error('Failed to calculate carbon emissions for the flight');
  }
}

module.exports = {
    calculateFlightEmissions
};