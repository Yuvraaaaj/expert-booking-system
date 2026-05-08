/**
 * seed.js — Populates the database with 12 diverse experts and realistic slots.
 * Run with: npm run seed
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Expert   = require('./models/Expert');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns an array of date strings (YYYY-MM-DD) for the next N days from today */
const getNextNDays = (n) => {
  const dates = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

/** Randomly mark `count` slots as booked */
const withRandomBooked = (slots, count = 2) => {
  const indices = new Set();
  while (indices.size < Math.min(count, slots.length)) {
    indices.add(Math.floor(Math.random() * slots.length));
  }
  return slots.map((slot, i) => ({ ...slot, isBooked: indices.has(i) }));
};

/** Build availableSlots for an expert: 7 days × 7 time slots */
const buildSlots = (bookedCount = 2) => {
  const TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const dates = getNextNDays(7);

  const slots = [];
  for (const date of dates) {
    for (const time of TIMES) {
      slots.push({ date, time, isBooked: false });
    }
  }
  return withRandomBooked(slots, bookedCount);
};

/** Generate a ui-avatars URL */
const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128&bold=true`;

// ── Seed data ─────────────────────────────────────────────────────────────────

const EXPERTS = [
  // ── Technology ──────────────────────────────────────────────────────────────
  {
    name: 'Arjun Mehta',
    category: 'Technology',
    bio: 'Full-stack engineer and cloud architect with deep expertise in distributed systems, Kubernetes, and AWS. Mentored 200+ engineers across Fortune 500 companies.',
    experience: 12,
    rating: 4.9,
    reviewCount: 318,
    hourlyRate: 220,
    bookedCount: 3,
  },
  {
    name: 'Sofia Petrov',
    category: 'Technology',
    bio: 'AI/ML engineer specialising in NLP and computer vision. Formerly at Google Brain. Published 15+ research papers and holds 4 patents.',
    experience: 9,
    rating: 4.8,
    reviewCount: 204,
    hourlyRate: 260,
    bookedCount: 2,
  },

  // ── Business ────────────────────────────────────────────────────────────────
  {
    name: 'Marcus Thompson',
    category: 'Business',
    bio: 'Serial entrepreneur with 3 successful exits. Expert in go-to-market strategy, fundraising, and scaling startups from $0 to $10M ARR.',
    experience: 15,
    rating: 4.7,
    reviewCount: 512,
    hourlyRate: 300,
    bookedCount: 3,
  },
  {
    name: 'Priya Sharma',
    category: 'Business',
    bio: 'MBA from Wharton. Specialises in operational excellence, OKR frameworks, and building high-performance teams. Former McKinsey consultant.',
    experience: 10,
    rating: 4.6,
    reviewCount: 287,
    hourlyRate: 250,
    bookedCount: 2,
  },

  // ── Health ──────────────────────────────────────────────────────────────────
  {
    name: 'Dr. Amara Osei',
    category: 'Health',
    bio: 'Board-certified physician with a focus on preventive medicine and corporate wellness. Advisor to several health-tech startups.',
    experience: 18,
    rating: 4.9,
    reviewCount: 643,
    hourlyRate: 180,
    bookedCount: 2,
  },
  {
    name: 'Yuki Nakamura',
    category: 'Health',
    bio: 'Certified nutritionist and performance coach. Helped over 500 clients achieve sustainable health goals through evidence-based nutrition.',
    experience: 7,
    rating: 4.5,
    reviewCount: 198,
    hourlyRate: 120,
    bookedCount: 2,
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    name: 'Robert Chen',
    category: 'Finance',
    bio: 'CFA charterholder with 14 years in investment banking and portfolio management. Specialises in equity analysis and alternative investments.',
    experience: 14,
    rating: 4.8,
    reviewCount: 421,
    hourlyRate: 280,
    bookedCount: 3,
  },
  {
    name: 'Fatima Al-Hassan',
    category: 'Finance',
    bio: 'Personal finance expert and certified financial planner. Passionate about financial literacy and helping young professionals build wealth.',
    experience: 8,
    rating: 4.6,
    reviewCount: 334,
    hourlyRate: 150,
    bookedCount: 2,
  },

  // ── Legal ───────────────────────────────────────────────────────────────────
  {
    name: 'James O\'Brien',
    category: 'Legal',
    bio: 'Corporate attorney with expertise in IP law, SaaS contracts, and startup legal structures. Advised 100+ startups through seed and Series A rounds.',
    experience: 20,
    rating: 4.7,
    reviewCount: 289,
    hourlyRate: 290,
    bookedCount: 2,
  },

  // ── Education ───────────────────────────────────────────────────────────────
  {
    name: 'Dr. Elena Vasquez',
    category: 'Education',
    bio: 'EdD in Learning Sciences. Expert in curriculum design, e-learning, and adult education methodologies. Consultant to top universities worldwide.',
    experience: 16,
    rating: 4.8,
    reviewCount: 376,
    hourlyRate: 130,
    bookedCount: 2,
  },

  // ── Marketing ───────────────────────────────────────────────────────────────
  {
    name: 'Kai Williams',
    category: 'Marketing',
    bio: 'Growth marketer with expertise in SEO, paid media, and conversion optimisation. Scaled multiple DTC brands from 6 to 8 figures in revenue.',
    experience: 11,
    rating: 4.7,
    reviewCount: 452,
    hourlyRate: 200,
    bookedCount: 3,
  },

  // ── Design ──────────────────────────────────────────────────────────────────
  {
    name: 'Laila Bergström',
    category: 'Design',
    bio: 'Senior UX/UI designer with a background in cognitive psychology. Crafted award-winning digital products for companies including Adobe and Spotify.',
    experience: 9,
    rating: 4.9,
    reviewCount: 267,
    hourlyRate: 175,
    bookedCount: 2,
  },
];

// ── Main seed function ────────────────────────────────────────────────────────

const seed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing experts
    const deleted = await Expert.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing expert(s)`);

    // Build expert documents
    const expertDocs = EXPERTS.map(({ bookedCount, ...rest }) => ({
      ...rest,
      avatar: avatar(rest.name),
      availableSlots: buildSlots(bookedCount),
      isActive: true,
    }));

    const inserted = await Expert.insertMany(expertDocs);
    console.log(`🌱 Seeded ${inserted.length} experts successfully!\n`);

    // Summary table
    inserted.forEach((e) => {
      const booked    = e.availableSlots.filter((s) => s.isBooked).length;
      const available = e.availableSlots.length - booked;
      console.log(`  ✓ ${e.name.padEnd(22)} [${e.category.padEnd(12)}]  ⭐ ${e.rating}  💲${e.hourlyRate}/hr  📅 ${available} slots free`);
    });

    console.log('\n✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

seed();
