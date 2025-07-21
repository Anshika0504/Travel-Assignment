const express = require('express');
const router = express.Router();
const { generateItineraryPDF } = require('../controllers/itineraryController');

router.post('/api', generateItineraryPDF);

module.exports = router;
