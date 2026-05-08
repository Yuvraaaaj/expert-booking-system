const mongoose = require('mongoose');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Waits for a given number of milliseconds.
 * @param {number} ms
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects to MongoDB using Mongoose with retry logic.
 * Attempts up to MAX_RETRIES times, waiting RETRY_DELAY_MS between each attempt.
 * Exits the process if all attempts fail.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${MAX_RETRIES}...`);

      await mongoose.connect(uri, {
        // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology
        serverSelectionTimeoutMS: 5000, // Give up initial connection after 5s
        socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
      });

      console.log(`✅ MongoDB connected successfully: ${mongoose.connection.host}`);
      return; // Connection successful — exit the retry loop
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await wait(RETRY_DELAY_MS);
      } else {
        console.error('💀 All MongoDB connection attempts exhausted. Shutting down.');
        process.exit(1);
      }
    }
  }
};

// Handle mongoose disconnection events after initial connection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB runtime error: ${err.message}`);
});

module.exports = connectDB;
