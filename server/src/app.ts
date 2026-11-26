import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env, isAllowedOrigin } from './config/env.js';
import { getDbStatus } from './lib/db.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { adminRouter } from './modules/admin.routes.js';
import { authRouter } from './modules/auth.routes.js';
import { coverageCatalogRouter } from './modules/coverageCatalog.routes.js';
import { estimatesRouter } from './modules/estimates.routes.js';
import { inspectionsRouter } from './modules/inspections.routes.js';
import { engagementRouter, handleContactSubmission } from './modules/leadsAndContact.routes.js';
import { projectsRouter, warrantiesRouter } from './modules/projectsWarranties.routes.js';
import { asyncHandler } from './middleware/errors.js';
import { contactLimiter } from './middleware/rateLimit.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors((req, callback) => {
      const origin = req.headers.origin;
      const forwardedHost = req.headers['x-forwarded-host'];
      const rawHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
      const requestHost = (rawHost ?? req.headers.host)?.split(',')[0]?.trim();

      if (isAllowedOrigin(origin, requestHost)) {
        callback(null, { origin: true, credentials: true });
        return;
      }
      callback(new Error('Not allowed by CORS'));
    }),
  );

  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParser());
  app.use(globalLimiter);

  const healthHandler = (_req: express.Request, res: express.Response) => {
    const dbStatus = getDbStatus();
    const ok = dbStatus === 'connected';
    res.status(ok ? 200 : 503).json({
      ok,
      service: 'auren-roofing-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/api/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  // Legacy homepage / contact page endpoint preserved + persisted in MongoDB CRM
  app.post('/api/contact', contactLimiter, asyncHandler(handleContactSubmission));

  // Complex versioned API surface
  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(`${env.API_PREFIX}/estimates`, estimatesRouter);
  app.use(`${env.API_PREFIX}/inspections`, inspectionsRouter);
  app.use(`${env.API_PREFIX}/projects`, projectsRouter);
  app.use(`${env.API_PREFIX}/warranties`, warrantiesRouter);
  app.use(`${env.API_PREFIX}/admin`, adminRouter);
  app.use(`${env.API_PREFIX}`, coverageCatalogRouter);
  app.use(`${env.API_PREFIX}`, engagementRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
