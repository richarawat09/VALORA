import mongoose from 'mongoose';

/**
 * Global cache for Mongoose and in-memory MongoDB across Next.js Server Actions and API invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongod: null, uri: null };
}

async function getMongoURI() {
  const envUri = process.env.MONGODB_URI;

  // If user provided a remote MongoDB Atlas connection string, use it directly
  if (envUri && envUri.startsWith('mongodb+srv://')) {
    return envUri;
  }

  // If we already spun up an in-memory server, reuse its URI
  if (cached.uri) {
    return cached.uri;
  }

  // If local URI provided, first test if local mongod is listening
  if (envUri && !envUri.includes('127.0.0.1:27017') && !envUri.includes('localhost:27017')) {
    return envUri;
  }

  // Test local 27017 connection with a short 1s timeout
  try {
    const testConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/valora', {
      serverSelectionTimeoutMS: 1200,
    }).asPromise();
    await testConn.close();
    cached.uri = 'mongodb://127.0.0.1:27017/valora';
    return cached.uri;
  } catch (err) {
    // Local MongoDB is not running, seamlessly start in-memory MongoDB
    console.log('Local MongoDB not detected on 27017. Initializing embedded MongoDB engine...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!cached.mongod) {
      cached.mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'valora',
        },
      });
    }
    cached.uri = cached.mongod.getUri();
    console.log('Embedded MongoDB engine active at:', cached.uri);
    return cached.uri;
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await getMongoURI();
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      };

      const conn = await mongoose.connect(uri, opts);
      console.log('Mongoose connected successfully to VALORA database');
      return conn;
    })().catch((err) => {
      console.error('MongoDB connection error:', err.message);
      cached.promise = null;
      throw err;
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
