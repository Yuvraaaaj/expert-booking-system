const mongoose = require('mongoose');

const CATEGORIES = [
  'Technology',
  'Business',
  'Health',
  'Finance',
  'Legal',
  'Education',
  'Marketing',
  'Design',
];

/**
 * Sub-schema for individual availability slots.
 * Each slot has a date, time, and booking status.
 */
const availableSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Slot date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      required: [true, 'Slot time is required'],
      match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true } // Keep sub-document IDs for easy slot lookups
);

/**
 * Expert schema.
 * Represents a professional offering bookable sessions.
 */
const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Expert name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },

    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience value seems too high'],
    },

    rating: {
      type: Number,
      default: 4.0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },

    avatar: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.+/,
        'Avatar must be a valid URL starting with http:// or https://',
      ],
    },

    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },

    availableSlots: {
      type: [availableSlotSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
expertSchema.index({ category: 1 });
expertSchema.index({ isActive: 1, rating: -1 }); // For listing active experts sorted by rating

// ── Virtuals ─────────────────────────────────────────────────────────────────
/** Number of available (unbooked) slots */
expertSchema.virtual('availableSlotCount').get(function () {
  return this.availableSlots.filter((s) => !s.isBooked).length;
});

const Expert = mongoose.model('Expert', expertSchema);

module.exports = Expert;
