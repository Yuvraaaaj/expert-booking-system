import api from './axios';

/**
 * Create a new booking.
 * @param {{ expertId, clientName, clientEmail, slot, date, notes? }} data
 */
export const createBooking = (data) => api.post('/bookings', data);

/**
 * Get all bookings for a client by email.
 * @param {string} email
 */
export const getMyBookings = (email) =>
  api.get('/bookings', { params: { email } });

/**
 * Get a single booking by ID.
 * @param {string} id
 */
export const getBookingById = (id) => api.get(`/bookings/${id}`);

/**
 * Update booking status (confirm, cancel, complete).
 * @param {string} id
 * @param {'confirmed'|'cancelled'|'completed'|'pending'} status
 */
export const updateStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });

/**
 * Cancel a booking.
 * @param {string} id
 */
export const cancelBooking = (id) => updateStatus(id, 'cancelled');
