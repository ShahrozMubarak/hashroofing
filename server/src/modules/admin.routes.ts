import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { ERROR_CODES, LEAD_STAGES, PROJECT_STAGES, ROLES, STAFF_ROLES } from '../config/constants.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { CoverageZoneModel, MaterialSystemModel } from '../models/catalog.model.js';
import { AuditLogModel, LeadModel, ReviewModel, StormClaimModel } from '../models/crm.model.js';
import { EstimateModel } from '../models/estimate.model.js';
import { InspectionModel } from '../models/inspection.model.js';
import { ProjectModel, WarrantyModel } from '../models/project.model.js';
import { UserModel } from '../models/user.model.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(...STAFF_ROLES));

// Executive Dashboard Analytics + Pipeline Charts
adminRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const [
      leads,
      estimates,
      inspections,
      projects,
      claims,
      warranties,
      zones,
      materials,
    ] = await Promise.all([
      LeadModel.find().lean(),
      EstimateModel.find().lean(),
      InspectionModel.find().lean(),
      ProjectModel.find().lean(),
      StormClaimModel.find().lean(),
      WarrantyModel.find().lean(),
      CoverageZoneModel.find().lean(),
      MaterialSystemModel.find().lean(),
    ]);

    const contractVolumeUsd = projects.reduce((sum, p) => sum + p.contractTotalUsd, 0);
    const quotePipelineUsd = estimates.reduce(
      (sum, e) => sum + Math.round((e.totalLowUsd + e.totalHighUsd) / 2),
      0,
    );
    const openEmergencyClaims = claims.filter((c) => c.status !== 'CLOSED').length;
    const scheduledInspections = inspections.filter((i) => i.status === 'SCHEDULED').length;

    const hubBreakdownMap = new Map<string, { hub: string; jobs: number; quotes: number; volumeUsd: number }>();
    for (const z of zones) {
      hubBreakdownMap.set(z.hubName, { hub: z.city, jobs: 0, quotes: 0, volumeUsd: 0 });
    }
    for (const p of projects) {
      const entry = hubBreakdownMap.get(p.hubName) || { hub: p.hubName, jobs: 0, quotes: 0, volumeUsd: 0 };
      entry.jobs += 1;
      entry.volumeUsd += p.contractTotalUsd;
      hubBreakdownMap.set(p.hubName, entry);
    }
    for (const e of estimates) {
      const entry = hubBreakdownMap.get(e.hubName) || { hub: e.hubName, jobs: 0, quotes: 0, volumeUsd: 0 };
      entry.quotes += 1;
      hubBreakdownMap.set(e.hubName, entry);
    }

    const stageCounts = PROJECT_STAGES.map((stage) => ({
      stage,
      count: projects.filter((p) => p.stage === stage).length,
    }));

    res.json({
      ok: true,
      data: {
        kpis: {
          contractVolumeUsd,
          quotePipelineUsd,
          activeProjects: projects.filter((p) => p.stage !== 'WARRANTY_ACTIVE').length,
          totalLeads: leads.length,
          newLeads: leads.filter((l) => l.stage === 'NEW').length,
          scheduledInspections,
          openEmergencyClaims,
          activeWarranties: warranties.filter((w) => w.status === 'ACTIVE').length,
          materialCount: materials.length,
        },
        hubBreakdown: [...hubBreakdownMap.values()],
        stageBreakdown: stageCounts,
      },
    });
  }),
);

// Leads CRM + Conversion
adminRouter.get(
  '/leads',
  asyncHandler(async (_req, res) => {
    const leads = await LeadModel.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, data: leads });
  }),
);

adminRouter.patch(
  '/leads/:id',
  validate(
    z.object({
      stage: z.enum(LEAD_STAGES).optional(),
      assignedTo: z.string().trim().max(80).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Lead not found.');
    res.json({ ok: true, data: lead });
  }),
);

// Estimates & Projects Management
adminRouter.get(
  '/estimates',
  asyncHandler(async (_req, res) => {
    const items = await EstimateModel.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, data: items });
  }),
);

adminRouter.get(
  '/inspections',
  asyncHandler(async (_req, res) => {
    const items = await InspectionModel.find().sort({ scheduledDate: 1 }).lean();
    res.json({ ok: true, data: items });
  }),
);

adminRouter.get(
  '/projects',
  asyncHandler(async (_req, res) => {
    const items = await ProjectModel.find().sort({ updatedAt: -1 }).lean();
    res.json({ ok: true, data: items });
  }),
);

// Convert an approved Estimate into an Active Construction Project
adminRouter.post(
  '/estimates/:id/convert',
  validate(
    z.object({
      propertyAddress: z.string().trim().min(5).max(200),
      crewLead: z.string().trim().min(2).max(100).default('Elena Cho — Senior Crew Lead'),
      permitNumber: z.string().trim().max(60).optional().default('PENDING-CITY'),
    }),
  ),
  asyncHandler(async (req, res) => {
    const est = await EstimateModel.findById(req.params.id);
    if (!est) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Estimate not found.');
    if (est.status === 'CONVERTED') {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Estimate already converted into a project.');
    }

    const projectRef = `AUR-PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetDate = new Date(Date.now() + (est.estimatedDays + 7) * 86400000).toISOString().slice(0, 10);
    const midpoint = Math.round((est.totalLowUsd + est.totalHighUsd) / 2);

    const project = await ProjectModel.create({
      projectRef,
      title: `${est.homeownerName} — ${est.materialName}`,
      homeownerName: est.homeownerName,
      email: est.email,
      phone: est.phone,
      phoneLast4: est.phoneLast4,
      propertyAddress: req.body.propertyAddress,
      zip: est.zip,
      hubName: est.hubName,
      service: est.service,
      materialName: est.materialName,
      stage: 'PROPOSAL_APPROVED',
      crewLead: req.body.crewLead,
      permitNumber: req.body.permitNumber,
      contractTotalUsd: midpoint,
      targetCompletionDate: targetDate,
      estimateRef: est.quoteNumber,
      fieldLogs: [
        {
          id: uuid(),
          stage: 'PROPOSAL_APPROVED',
          authorName: req.authUser!.name,
          note: `Project initialized from estimate ${est.quoteNumber}.`,
          weatherNote: 'Pre-construction kickoff',
          createdAt: new Date(),
        },
      ],
    });

    est.status = 'CONVERTED';
    await est.save();

    await AuditLogModel.create({
      actorId: req.authUser!.sub,
      actorEmail: req.authUser!.email,
      actorRole: req.authUser!.role,
      action: 'PROJECT_CREATED_FROM_ESTIMATE',
      entityType: 'project',
      entityId: project._id,
      metadata: { projectRef, quoteNumber: est.quoteNumber },
    });

    res.status(201).json({ ok: true, data: project });
  }),
);

// Advance Project Stage + Field Log Entry
adminRouter.patch(
  '/projects/:id/stage',
  validate(
    z.object({
      stage: z.enum(PROJECT_STAGES),
      note: z.string().trim().min(3).max(500),
      weatherNote: z.string().trim().max(80).default('Clear'),
      weatherHold: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Project not found.');

    project.stage = req.body.stage;
    if (typeof req.body.weatherHold === 'boolean') {
      project.weatherHold = req.body.weatherHold;
    }
    project.fieldLogs.push({
      id: uuid(),
      stage: req.body.stage,
      authorName: req.authUser!.name,
      note: req.body.note,
      weatherNote: req.body.weatherNote,
      createdAt: new Date(),
    });
    await project.save();

    await AuditLogModel.create({
      actorId: req.authUser!.sub,
      actorEmail: req.authUser!.email,
      actorRole: req.authUser!.role,
      action: 'PROJECT_STAGE_UPDATED',
      entityType: 'project',
      entityId: project._id,
      metadata: { projectRef: project.projectRef, stage: req.body.stage },
    });

    res.json({ ok: true, data: project });
  }),
);

// Issue a Change Order onto an Active Project
adminRouter.post(
  '/projects/:id/change-orders',
  validate(
    z.object({
      title: z.string().trim().min(4).max(150),
      reason: z.string().trim().min(5).max(400),
      amountDeltaUsd: z.coerce.number().min(-5000).max(50000),
    }),
  ),
  asyncHandler(async (req, res) => {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Project not found.');

    project.changeOrders.push({
      id: uuid(),
      ...req.body,
      status: 'PENDING',
      createdAt: new Date(),
      decidedAt: null,
    });
    await project.save();
    res.status(201).json({ ok: true, data: project });
  }),
);

// Storm Claims, Coverage Hubs, Reviews & Security Audit
adminRouter.get(
  '/storm-claims',
  asyncHandler(async (_req, res) => {
    const claims = await StormClaimModel.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, data: claims });
  }),
);

adminRouter.patch(
  '/storm-claims/:id',
  validate(z.object({ status: z.enum(['TRIAGED', 'TARP_DISPATCHED', 'ADJUSTER_MEETING', 'CONVERTED', 'CLOSED']) })),
  asyncHandler(async (req, res) => {
    const claim = await StormClaimModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!claim) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Storm claim not found.');
    res.json({ ok: true, data: claim });
  }),
);

adminRouter.get(
  '/coverage',
  asyncHandler(async (_req, res) => {
    const hubs = await CoverageZoneModel.find().sort({ hubName: 1 }).lean();
    res.json({ ok: true, data: hubs });
  }),
);

adminRouter.patch(
  '/coverage/:id',
  validate(z.object({ active: z.boolean().optional(), inspectionLeadDays: z.coerce.number().int().min(1).max(21).optional() })),
  asyncHandler(async (req, res) => {
    const hub = await CoverageZoneModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hub) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Hub not found.');
    res.json({ ok: true, data: hub });
  }),
);

adminRouter.get(
  '/reviews',
  asyncHandler(async (_req, res) => {
    const reviews = await ReviewModel.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, data: reviews });
  }),
);

adminRouter.patch(
  '/reviews/:id',
  validate(z.object({ approved: z.boolean() })),
  asyncHandler(async (req, res) => {
    const review = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Review not found.');
    res.json({ ok: true, data: review });
  }),
);

adminRouter.get(
  '/staff',
  requireRole(ROLES.OWNER),
  asyncHandler(async (_req, res) => {
    const users = await UserModel.find({}, '-passwordHash').sort({ role: 1, name: 1 }).lean();
    res.json({ ok: true, data: users });
  }),
);

adminRouter.get(
  '/audit',
  asyncHandler(async (_req, res) => {
    const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ ok: true, data: logs });
  }),
);

