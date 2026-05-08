const express = require('express');
const {
  createBooking,
  updateBookingStatus,
  getMyBookings,
} = require('../controllers/bookingController');

const router = express.Router();

// POST /api/bookings  — Create a new booking
router.post('/', createBooking);

// GET  /api/bookings?email=user@example.com  — Fetch user's bookings
router.get('/', getMyBookings);

// PATCH /api/bookings/:id/status  — Update booking status
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
