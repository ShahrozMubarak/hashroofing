import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './lib/db.js';
import { ensureSeeded } from './scripts/seed.js';

async function start() {
  await connectDb();
  await ensureSeeded();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`Auren Roofing Complex API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

start().catch((err) => {
  console.error('Failed to start Auren server:', err);
  process.exit(1);
});

