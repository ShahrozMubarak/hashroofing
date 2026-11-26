import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './lib/db.js';
import { ensureSeeded } from './scripts/seed.js';

async function startDev() {
  let mongod: MongoMemoryServer | null = null;
  let mongoUri = env.MONGODB_URI;

  if (!mongoUri) {
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
  }

  await connectDb(mongoUri);
  await ensureSeeded();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(
      `Auren Roofing Complex API listening on http://localhost:${env.PORT} (${mongod ? 'in-memory MongoDB + seeded data' : 'configured MongoDB'})`,
    );
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDb();
      if (mongod) await mongod.stop();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

startDev().catch((err) => {
  console.error('Failed to start Auren dev server:', err);
  process.exit(1);
});

