const mongoose = require('mongoose');

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

/**
 * Booking schema.
 * Represents a user's session booking with an expert.
 * A compound unique index on { expert, date, timeSlot } prevents double-booking
 * at the database level.
 */
const bookingSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: [true, 'Expert reference is required'],
    },

    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^\+?[\d\s\-().]{7,20}$/,
        'Please provide a valid phone number',
      ],
    },

    date: {
      type: String,
      required: [true, 'Booking date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },

    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [/^\d{2}:\d{2}$/, 'Time slot must be in HH:MM format'],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    status: {
      type: String,
      enum: {
        values: BOOKING_STATUSES,
        message: `Status must be one of: ${BOOKING_STATUSES.join(', ')}`,
      },
      default: 'pending',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * Compound unique index — prevents double-booking the same expert slot.
 * The DB-level constraint is the last line of defence after application logic.
 * Only active (non-cancelled) bookings should ideally be counted, but
 * enforcing this purely at the index level requires a partial index in
 * MongoDB 3.2+. For simplicity we enforce uniqueness across all statuses here
 * and handle cancellation logic in the service layer.
 */
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    name: 'unique_expert_slot',
  }
);

// Index for quickly fetching all bookings of a specific expert
bookingSchema.index({ expert: 1, status: 1 });

// Index for fetching bookings by email (user's booking history)
bookingSchema.index({ email: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
