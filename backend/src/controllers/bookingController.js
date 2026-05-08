const Joi      = require('joi');
const Expert   = require('../models/Expert');
const Booking  = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const { getIO } = require('../config/socket');

// ── Joi schema for createBooking ──────────────────────────────────────────────
const createBookingSchema = Joi.object({
  expertId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({
      'string.pattern.base': 'expertId must be a valid MongoDB ObjectId',
      'any.required': 'expertId is required',
    }),

  userName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'userName is required',
  }),

  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'Please provide a valid email address',
  }),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'phone must be exactly 10 digits',
      'any.required': 'phone is required',
    }),

  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'date must be in YYYY-MM-DD format',
      'any.required': 'date is required',
    }),

  timeSlot: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'timeSlot must be in HH:MM format',
      'any.required': 'timeSlot is required',
    }),

  notes: Joi.string().max(500).optional().allow(''),
});

// ── Joi schema for updateBookingStatus ────────────────────────────────────────
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'status must be one of: pending, confirmed, completed, cancelled',
      'any.required': 'status is required',
    }),
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Creates a booking with atomic slot reservation to prevent race conditions.
 */
const createBooking = async (req, res, next) => {
  try {
    // 1. Validate request body
    const { error, value } = createBookingSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      const apiErr = new ApiError(422, 'Validation failed');
      apiErr.errors = errors;
      return next(apiErr);
    }

    const { expertId, userName, email, phone, date, timeSlot, notes } = value;

    // 2. Verify expert exists and is active
    const expertExists = await Expert.findOne({ _id: expertId, isActive: true }).lean();
    if (!expertExists) {
      throw new ApiError(404, 'Expert not found or is no longer active');
    }

    // 3. ATOMIC slot reservation — prevents race conditions
    //    Update only if the exact slot exists AND is NOT already booked.
    //    Uses arrayFilters to target the specific sub-document.
    const updated = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        availableSlots: {
          $elemMatch: {
            date,
            time: timeSlot,
            isBooked: false,       // Must be available
          },
        },
      },
      {
        $set: { 'availableSlots.$[slot].isBooked': true },
      },
      {
        arrayFilters: [{ 'slot.date': date, 'slot.time': timeSlot, 'slot.isBooked': false }],
        new: true,
      }
    );

    // If no document was modified, the slot was already taken
    if (!updated) {
      throw new ApiError(409, 'This slot is already booked. Please choose another time.');
    }

    // 4. Create the Booking document
    const booking = await Booking.create({
      expert:   expertId,
      userName,
      email,
      phone,
      date,
      timeSlot,
      notes,
      status: 'pending',
    });

    // 5. Emit real-time event so connected clients update their UI instantly
    try {
      const io = getIO();
      io.to(`expert_${expertId}`).emit('slotBooked', {
        expertId,
        date,
        timeSlot,
        bookingId: booking._id,
      });
    } catch (_) {
      // Socket.io not critical — log but don't fail the request
      console.warn('⚠️  Socket.io emit failed (non-fatal):', _.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/bookings/:id/status
 * Updates the status of an existing booking.
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    // Validate body
    const { error, value } = updateStatusSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      const apiErr = new ApiError(422, 'Validation failed');
      apiErr.errors = errors;
      return next(apiErr);
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: value.status },
      { new: true, runValidators: true }
    ).populate('expert', 'name category');

    if (!booking) {
      throw new ApiError(404, `Booking with id '${req.params.id}' not found`);
    }

    // If cancelled → free the slot back on the Expert document
    if (value.status === 'cancelled') {
      await Expert.updateOne(
        { _id: booking.expert._id },
        {
          $set: { 'availableSlots.$[slot].isBooked': false },
        },
        {
          arrayFilters: [
            { 'slot.date': booking.date, 'slot.time': booking.timeSlot },
          ],
        }
      );

      // Notify room about freed slot
      try {
        const io = getIO();
        io.to(`expert_${booking.expert._id}`).emit('slotFreed', {
          expertId: booking.expert._id,
          date: booking.date,
          timeSlot: booking.timeSlot,
        });
      } catch (_) {
        console.warn('⚠️  Socket.io emit failed (non-fatal):', _.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to '${value.status}'`,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/bookings?email=xxx
 * Returns all bookings for a given email address.
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      throw new ApiError(400, 'email query parameter is required');
    }

    const bookings = await Booking.find({ email: email.toLowerCase().trim() })
      .populate('expert', 'name category avatar hourlyRate')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, updateBookingStatus, getMyBookings };
