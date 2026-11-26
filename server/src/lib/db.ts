import mongoose from 'mongoose';
import { env } from '../config/env.js';

let connectPromise: Promise<void> | null = null;

export async function connectDb(uri = env.MONGODB_URI): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (connectPromise) return connectPromise;

  if (!uri) {
    throw new Error('MONGODB_URI is required to connect.');
  }

  mongoose.set('strictQuery', true);
  connectPromise = mongoose
    .connect(uri, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 0,
    })
    .then(() => undefined)
    .catch((err) => {
      connectPromise = null;
      throw err;
    });

  return connectPromise;
}

export async function disconnectDb(): Promise<void> {
  connectPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function getDbStatus(): 'connected' | 'connecting' | 'disconnecting' | 'disconnected' {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
}

