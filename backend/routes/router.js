const express = require('express');
const router = express.Router();
const { createItinerary } = require('../controllers/itineraryController'); // ✅ use the correct name

router.post('/api', createItinerary); // ✅ also update here

module.exports = router;
