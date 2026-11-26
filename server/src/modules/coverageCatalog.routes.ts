import { Router } from 'express';
import { z } from 'zod';
import { STAFF_ROLES } from '../config/constants.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { CoverageZoneModel, MaterialSystemModel } from '../models/catalog.model.js';
import { AuditLogModel, CaseStudyModel, ReviewModel } from '../models/crm.model.js';

export const coverageCatalogRouter = Router();

export async function findZoneByZip(zip: string) {
  const clean = zip.trim().slice(0, 5);
  const zones = await CoverageZoneModel.find({ active: true }).lean();
  const exact = zones.find((z) => z.featuredZips.includes(clean));
  if (exact) return exact;
  return zones.find((z) => z.zipPrefixes.some((p) => clean.startsWith(p))) ?? null;
}

// Public: List all active service coverage zones
coverageCatalogRouter.get(
  '/coverage',
  asyncHandler(async (_req, res) => {
    const zones = await CoverageZoneModel.find({ active: true }).sort({ city: 1 }).lean();
    res.json({ ok: true, data: zones });
  }),
);

// Public: Instant ZIP coverage & climate engineering check
coverageCatalogRouter.get(
  '/coverage/check',
  asyncHandler(async (req, res) => {
    const zip = String(req.query.zip ?? '').trim();
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      throw new AppError(400, 'VALIDATION_FAILED', 'Please provide a valid 5-digit U.S. ZIP code.');
    }
    const zone = await findZoneByZip(zip);
    if (!zone) {
      res.json({
        ok: true,
        data: {
          zip: zip.slice(0, 5),
          covered: false,
          message:
            'This ZIP is outside our 5 primary hubs. Submit a request and our regional coordinator will confirm crew travel scheduling.',
        },
      });
      return;
    }

    res.json({
      ok: true,
      data: {
        zip: zip.slice(0, 5),
        covered: true,
        hubName: zone.hubName,
        city: zone.city,
        state: zone.state,
        climateZone: zone.climateZone,
        windRatingMph: zone.windRatingMph,
        snowLoadPsf: zone.snowLoadPsf,
        inspectionLeadDays: zone.inspectionLeadDays,
        notes: zone.notes,
      },
    });
  }),
);

// Public: Material systems comparison catalog
coverageCatalogRouter.get(
  '/materials',
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const filter: Record<string, unknown> = { active: true };
    if (category && category !== 'All') filter.category = category;
    const materials = await MaterialSystemModel.find(filter).sort({ sortOrder: 1 }).lean();
    res.json({ ok: true, data: materials });
  }),
);

// Public: Architectural portfolio case studies
coverageCatalogRouter.get(
  '/showcase',
  asyncHandler(async (req, res) => {
    const service = typeof req.query.service === 'string' ? req.query.service : undefined;
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const filter: Record<string, unknown> = {};
    if (service && service !== 'All') filter.service = service;
    if (city && city !== 'All') filter.city = city;
    const items = await CaseStudyModel.find(filter).sort({ completedYear: -1 }).lean();
    res.json({ ok: true, data: items });
  }),
);

// Public: Approved reviews + homeowner submission
coverageCatalogRouter.get(
  '/reviews',
  asyncHandler(async (_req, res) => {
    const reviews = await ReviewModel.find({ approved: true }).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, data: reviews });
  }),
);

const createReviewSchema = z.object({
  homeownerName: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  service: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(800),
});

coverageCatalogRouter.post(
  '/reviews',
  validate(createReviewSchema),
  asyncHandler(async (req, res) => {
    const review = await ReviewModel.create({ ...req.body, approved: false });
    res.status(201).json({
      ok: true,
      data: review,
      message: 'Thank you — your review is queued for moderation.',
    });
  }),
);

// Admin: Create / update material system
const materialSchema = z.object({
  slug: z.string().trim().min(2),
  name: z.string().trim().min(2),
  category: z.enum(['Metal', 'Asphalt', 'Cedar', 'Slate', 'Solar']),
  summary: z.string().trim().min(5),
  pricePerSqFtLow: z.coerce.number().positive(),
  pricePerSqFtHigh: z.coerce.number().positive(),
  warrantyYears: z.coerce.number().int().positive(),
  fireClass: z.string().default('Class A'),
  windRatingMph: z.coerce.number().int().positive(),
  minPitchRatio: z.coerce.number().min(1),
  solarReady: z.boolean().default(true),
  lifespanLabel: z.string().trim().min(2),
});

coverageCatalogRouter.post(
  '/admin/materials',
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate(materialSchema),
  asyncHandler(async (req, res) => {
    const item = await MaterialSystemModel.create(req.body);
    await AuditLogModel.create({
      actorId: req.authUser!.sub,
      actorEmail: req.authUser!.email,
      actorRole: req.authUser!.role,
      action: 'MATERIAL_CREATED',
      entityType: 'material',
      entityId: item._id,
    });
    res.status(201).json({ ok: true, data: item });
  }),
);

