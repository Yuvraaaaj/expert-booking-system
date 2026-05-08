import api from './axios';

/**
 * Fetch all experts with optional query params.
 * @param {{ search?: string, category?: string, page?: number, limit?: number }} params
 */
export const getAllExperts = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  return api.get('/experts', { params: cleanParams });
};

/**
 * Fetch a single expert by ID.
 * @param {string} id
 */
export const getExpertById = (id) => api.get(`/experts/${id}`);

/**
 * Fetch available slots for an expert on a given date.
 * @param {string} expertId
 * @param {string} date  ISO date string "YYYY-MM-DD"
 */
export const getExpertSlots = (expertId, date) =>
  api.get(`/experts/${expertId}/slots`, { params: { date } });
