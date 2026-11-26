import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/lib/db.js';
import { ensureSeeded } from '../server/src/scripts/seed.js';

let appPromise: Promise<ReturnType<typeof createApp>> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await connectDb();
      await ensureSeeded();
      return createApp();
    })().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await connectDb();
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('Vercel Auren API initialization error:', err);
    if (!res.headersSent) {
      res.status(503).json({
        ok: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Auren backend service is temporarily unavailable.',
        },
      });
    }
  }
}

