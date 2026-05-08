const express = require('express');
const { getAllExperts, getExpertById, getExpertSlots } = require('../controllers/expertController');

const router = express.Router();

// GET /api/experts?page=1&limit=9&category=Technology&search=john
router.get('/', getAllExperts);

// GET /api/experts/:id/slots
router.get('/:id/slots', getExpertSlots);

// GET /api/experts/:id
router.get('/:id', getExpertById);

module.exports = router;
