import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { connectDb, disconnectDb } from '../src/lib/db.js';
import { ensureSeeded, runSeed } from '../src/scripts/seed.js';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri());
  await ensureSeeded();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
  await runSeed();
});

afterAll(async () => {
  await disconnectDb();
  if (mongod) await mongod.stop();
});

