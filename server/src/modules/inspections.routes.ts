import { Router } from 'express';
import { z } from 'zod';
import { ERROR_CODES, STAFF_ROLES, VALID_SERVICES } from '../config/constants.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { AuditLogModel } from '../models/crm.model.js';
import { InspectionModel } from '../models/inspection.model.js';
import { findZoneByZip } from './coverageCatalog.routes.js';

export const inspectionsRouter = Router();

const TIME_SLOTS = [
  '08:00 AM – 09:30 AM',
  '10:00 AM – 11:30 AM',
  '01:00 PM – 02:30 PM',
  '03:30 PM – 05:00 PM',
];

inspectionsRouter.get(
  '/slots',
  asyncHandler(async (req, res) => {
    const zip = String(req.query.zip ?? '98101').trim();
    const date = String(req.query.date ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(400, ERROR_CODES.VALIDATION_FAILED, 'Date must be YYYY-MM-DD.');
    }
    const zone = await findZoneByZip(zip);
    const hubName = zone?.hubName ?? 'Seattle Hub';

    const booked = await InspectionModel.find({
      hubName,
      scheduledDate: date,
      status: { $in: ['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED'] },
    }).lean();
    const taken = new Set(booked.map((b) => b.timeSlot));

    res.json({
      ok: true,
      data: {
        zip: zip.slice(0, 5),
        hubName,
        covered: Boolean(zone),
        date,
        slots: TIME_SLOTS.map((slot) => ({ slot, available: !taken.has(slot) })),
      },
    });
  }),
);

const bookInspectionSchema = z.object({
  homeownerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(40),
  propertyAddress: z.string().trim().min(5).max(200),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  service: z.enum(VALID_SERVICES),
  mode: z.enum(['ON_SITE', 'DRONE_AERIAL']).default('ON_SITE'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().refine((v) => TIME_SLOTS.includes(v), 'Select a valid time slot.'),
  concerns: z.string().trim().max(1000).optional().default(''),
});

inspectionsRouter.post(
  '/',
  validate(bookInspectionSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof bookInspectionSchema>;
    const zone = await findZoneByZip(body.zip);
    const hubName = zone?.hubName ?? 'Seattle Hub';

    const conflict = await InspectionModel.findOne({
      hubName,
      scheduledDate: body.scheduledDate,
      timeSlot: body.timeSlot,
      status: { $in: ['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED'] },
    });

    if (conflict) {
      throw new AppError(
        409,
        ERROR_CODES.SLOT_UNAVAILABLE,
        'That inspection window is already booked for this hub. Pick another slot.',
      );
    }

    const digits = body.phone.replace(/\D/g, '');
    const inspectionRef = `AUR-INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const inspection = await InspectionModel.create({
      inspectionRef,
      homeownerName: body.homeownerName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      phoneLast4: digits.slice(-4),
      propertyAddress: body.propertyAddress,
      zip: body.zip.slice(0, 5),
      hubName,
      service: body.service,
      mode: body.mode,
      scheduledDate: body.scheduledDate,
      timeSlot: body.timeSlot,
      concerns: body.concerns,
      status: 'SCHEDULED',
    });

    res.status(201).json({ ok: true, data: inspection });
  }),
);

inspectionsRouter.get(
  '/lookup',
  asyncHandler(async (req, res) => {
    const inspectionRef = String(req.query.ref ?? '').trim().toUpperCase();
    const last4 = String(req.query.last4 ?? '').trim();
    const item = await InspectionModel.findOne({ inspectionRef, phoneLast4: last4 }).lean();
    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'No inspection found matching those details.');
    }
    res.json({ ok: true, data: item });
  }),
);

const reportSchema = z.object({
  deckingScore: z.coerce.number().int().min(0).max(100),
  flashingScore: z.coerce.number().int().min(0).max(100),
  ventilationScore: z.coerce.number().int().min(0).max(100),
  surfaceScore: z.coerce.number().int().min(0).max(100),
  drainageScore: z.coerce.number().int().min(0).max(100),
  summary: z.string().trim().min(5).max(1000),
  recommendedAction: z.string().trim().min(5).max(500),
});

inspectionsRouter.post(
  '/:id/report',
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate(reportSchema),
  asyncHandler(async (req, res) => {
    const ins = await InspectionModel.findById(req.params.id);
    if (!ins) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Inspection not found.');

    const b = req.body as z.infer<typeof reportSchema>;
    const overallHealthIndex = Math.round(
      b.deckingScore * 0.25 +
        b.flashingScore * 0.25 +
        b.surfaceScore * 0.25 +
        b.ventilationScore * 0.15 +
        b.drainageScore * 0.1,
    );

    ins.status = 'COMPLETED';
    ins.report = {
      deckingScore: b.deckingScore,
      flashingScore: b.flashingScore,
      ventilationScore: b.ventilationScore,
      surfaceScore: b.surfaceScore,
      drainageScore: b.drainageScore,
      overallHealthIndex,
      summary: b.summary,
      recommendedAction: b.recommendedAction,
      completedAt: new Date(),
    };
    await ins.save();

    await AuditLogModel.create({
      actorId: req.authUser!.sub,
      actorEmail: req.authUser!.email,
      actorRole: req.authUser!.role,
      action: 'INSPECTION_REPORT_SUBMITTED',
      entityType: 'inspection',
      entityId: ins._id,
      metadata: { overallHealthIndex },
    });

    res.json({ ok: true, data: ins });
  }),
);

