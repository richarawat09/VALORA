import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/valora';

/**
 * Global cache for Mongoose connection across Next.js Server Actions and API invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging 30s
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully to VALORA database');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        cached.promise = null;
        const msg = err.message?.includes('EPERM') || err.message?.includes('ECONNREFUSED') || err.message?.includes('selection timed out')
          ? `Could not connect to MongoDB. Please configure your MongoDB Atlas URI (or start local MongoDB) in .env.local`
          : err.message;
        throw new Error(msg);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
