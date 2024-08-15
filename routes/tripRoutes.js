const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { validateTripSearch,validateTripId, validateTripObject, validateTripAggregator, validateBestValueTrip } = require('../middlewares/validateTrips');


// Apply the middlewares where needed
router.get('/search', validateTripSearch, tripController.searchTrips);
router.post('/', validateTripObject, tripController.saveTrip);
router.get('/', tripController.listTrips);
router.delete('/:id', validateTripId,tripController.deleteTrip);

// Extra
router.get('/aggregate', validateTripAggregator ,tripController.aggregateTrips);
router.get('/best-value', validateBestValueTrip, tripController.getBestValueTrip);

module.exports = router;
