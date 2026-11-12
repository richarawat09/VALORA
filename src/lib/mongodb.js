import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

/**
 * Global cache for Mongoose and embedded MongoDB across Next.js Server Actions and API invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongod: null, uri: null };
}

async function canConnect(uri, timeoutMs = 1000) {
  let testConn;
  try {
    testConn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    }).asPromise();
    return true;
  } catch {
    return false;
  } finally {
    if (testConn) {
      await testConn.close().catch(() => {});
    }
  }
}

async function getMongoURI() {
  const envUri = process.env.MONGODB_URI;

  // If user provided a remote MongoDB Atlas connection string, use it directly
  if (envUri && envUri.startsWith('mongodb+srv://')) {
    return envUri;
  }

  // If we already resolved or started a server in this process, reuse its URI
  if (cached.uri) {
    return cached.uri;
  }

  // If custom non-default local URI provided, use it directly
  if (envUri && !envUri.includes('127.0.0.1:27017') && !envUri.includes('localhost:27017')) {
    return envUri;
  }

  // 1. Check standard local MongoDB on 27017
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/valora';
  if (await canConnect(defaultLocalUri, 1200)) {
    cached.uri = defaultLocalUri;
    return cached.uri;
  }

  // 2. Use persistent embedded MongoDB stored in .valora-db (unless explicitly disabled for tests)
  const useEphemeral = process.env.VALORA_EPHEMERAL_DB === '1';
  const persistentPort = 27018;
  const persistentUri = `mongodb://127.0.0.1:${persistentPort}/valora`;

  if (!useEphemeral && (await canConnect(persistentUri, 800))) {
    cached.uri = persistentUri;
    return cached.uri;
  }

  console.log(
    useEphemeral
      ? 'Initializing ephemeral embedded MongoDB engine...'
      : 'Local MongoDB not detected on 27017. Initializing persistent embedded MongoDB engine...'
  );

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  if (!cached.mongod) {
    if (useEphemeral) {
      cached.mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'valora',
        },
      });
    } else {
      const dbPath = path.join(process.cwd(), '.valora-db');
      fs.mkdirSync(dbPath, { recursive: true });
      cached.mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'valora',
          dbPath,
          storageEngine: 'wiredTiger',
          port: persistentPort,
        },
      });
    }
  }

  cached.uri = cached.mongod.getUri('valora');
  console.log('Embedded MongoDB engine active at:', cached.uri);
  return cached.uri;
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
