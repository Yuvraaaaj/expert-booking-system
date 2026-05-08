const Expert = require('../models/Expert');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/experts
 * Query params: page, limit, category, search
 */
const getAllExperts = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const skip  = (page - 1) * limit;

    // ── Build filter object ────────────────────────────────────────────────
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      // Case-insensitive partial match on name
      filter.name = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // ── Run count + data queries in parallel ───────────────────────────────
    const [total, experts] = await Promise.all([
      Expert.countDocuments(filter),
      Expert.find(filter)
        .select('-__v')                    // Exclude internal Mongoose field
        .sort({ rating: -1, reviewCount: -1 }) // Best-rated first
        .skip(skip)
        .limit(limit)
        .lean(),                           // Return plain JS objects (faster)
    ]);

    res.status(200).json({
      success: true,
      data: experts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experts/:id
 * Returns full expert document including all availableSlots
 */
const getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id).select('-__v').lean();

    if (!expert) {
      throw new ApiError(404, `Expert with id '${req.params.id}' not found`);
    }

    res.status(200).json({
      success: true,
      data: expert,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experts/:id/slots
 * Returns available slots for an expert, optionally filtered by date
 */
const getExpertSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const expert = await Expert.findById(id).select('availableSlots').lean();

    if (!expert) {
      throw new ApiError(404, `Expert with id '${id}' not found`);
    }

    let slots = expert.availableSlots || [];
    if (date) {
      slots = slots.filter(slot => slot.date === date);
    }

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllExperts, getExpertById, getExpertSlots };
