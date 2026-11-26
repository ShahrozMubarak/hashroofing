import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { ERROR_CODES, PROJECT_STAGES, STAFF_ROLES } from '../config/constants.js';
import { buildWarrantyPdfBuffer } from '../lib/pdf.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { AuditLogModel } from '../models/crm.model.js';
import { ProjectModel, WarrantyModel } from '../models/project.model.js';

export const projectsRouter = Router();
export const warrantiesRouter = Router();

// Public Portal Track: look up project + matching warranty by ref + phone last 4
projectsRouter.get(
  '/track',
  asyncHandler(async (req, res) => {
    const projectRef = String(req.query.ref ?? '').trim().toUpperCase();
    const last4 = String(req.query.last4 ?? '').trim();
    if (!projectRef || !last4) {
      throw new AppError(400, ERROR_CODES.VALIDATION_FAILED, 'Project reference and phone last 4 digits are required.');
    }

    const project = await ProjectModel.findOne({ projectRef, phoneLast4: last4 }).lean();
    if (!project) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Project not found matching those details.');
    }
    const warranty = await WarrantyModel.findOne({ projectRef: project.projectRef }).lean();

    res.json({ ok: true, data: { project, warranty, stages: PROJECT_STAGES } });
  }),
);

// Authenticated homeowner projects
projectsRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projects = await ProjectModel.find({ email: req.authUser!.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, data: projects });
  }),
);

// Homeowner decision on a pending Change Order via Portal
const coDecisionSchema = z.object({
  phoneLast4: z.string().trim().length(4),
  decision: z.enum(['APPROVED', 'DECLINED']),
});

projectsRouter.patch(
  '/:projectRef/change-orders/:changeOrderId',
  validate(coDecisionSchema),
  asyncHandler(async (req, res) => {
    const { phoneLast4, decision } = req.body as z.infer<typeof coDecisionSchema>;
    const project = await ProjectModel.findOne({
      projectRef: String(req.params.projectRef).trim().toUpperCase(),
      phoneLast4,
    });
    if (!project) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Project not found.');

    const co = project.changeOrders.find((c) => c.id === req.params.changeOrderId);
    if (!co) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Change order not found.');
    if (co.status !== 'PENDING') {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Change order has already been decided.');
    }

    co.status = decision;
    co.decidedAt = new Date();
    if (decision === 'APPROVED') {
      project.contractTotalUsd += co.amountDeltaUsd;
    }
    project.fieldLogs.push({
      id: uuid(),
      stage: project.stage,
      authorName: project.homeownerName,
      note: `Homeowner ${decision.toLowerCase()} change order: ${co.title} ($${co.amountDeltaUsd}).`,
      weatherNote: 'Portal Action',
      createdAt: new Date(),
    });
    await project.save();

    res.json({ ok: true, data: project });
  }),
);

// Warranty Verify & Claim Endpoints
warrantiesRouter.get(
  '/verify',
  asyncHandler(async (req, res) => {
    const code = String(req.query.code ?? '').trim().toUpperCase();
    if (!code) throw new AppError(400, ERROR_CODES.VALIDATION_FAILED, 'Certificate code required.');
    const warranty = await WarrantyModel.findOne({ certificateCode: code }).lean();
    if (!warranty) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'No active warranty certificate found for that code.');
    res.json({ ok: true, data: warranty });
  }),
);

warrantiesRouter.get(
  '/:code/pdf',
  asyncHandler(async (req, res) => {
    const code = String(req.params.code).trim().toUpperCase();
    const warranty = await WarrantyModel.findOne({ certificateCode: code }).lean();
    if (!warranty) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Certificate not found.');
    const project = await ProjectModel.findOne({ projectRef: warranty.projectRef }).lean();
    const pdf = await buildWarrantyPdfBuffer(warranty, project);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${warranty.certificateCode}.pdf"`);
    res.send(pdf);
  }),
);

const warrantyClaimSchema = z.object({
  issueTitle: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(1500),
  severity: z.enum(['ROUTINE', 'URGENT']).default('ROUTINE'),
});

warrantiesRouter.post(
  '/:code/claims',
  validate(warrantyClaimSchema),
  asyncHandler(async (req, res) => {
    const warranty = await WarrantyModel.findOne({
      certificateCode: String(req.params.code).trim().toUpperCase(),
    });
    if (!warranty) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Warranty certificate not found.');

    warranty.claims.push({
      id: uuid(),
      ...req.body,
      status: 'OPEN',
      createdAt: new Date(),
    });
    await warranty.save();
    res.status(201).json({ ok: true, data: warranty });
  }),
);

// Admin: Issue warranty directly for a project
const issueWarrantySchema = z.object({
  projectRef: z.string().trim().min(4),
  workmanshipYears: z.coerce.number().int().min(1).max(30).default(15),
  manufacturerYears: z.coerce.number().int().min(10).max(60).default(50),
  transferable: z.boolean().default(true),
});

warrantiesRouter.post(
  '/issue',
  requireAuth,
  requireRole(...STAFF_ROLES),
  validate(issueWarrantySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof issueWarrantySchema>;
    const project = await ProjectModel.findOne({ projectRef: body.projectRef.toUpperCase() });
    if (!project) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Project not found.');

    const existing = await WarrantyModel.findOne({ projectRef: project.projectRef });
    if (existing) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Warranty already issued for this project.');
    }

    const certificateCode = `AUR-WRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const warranty = await WarrantyModel.create({
      certificateCode,
      projectRef: project.projectRef,
      homeownerName: project.homeownerName,
      propertyAddress: project.propertyAddress,
      zip: project.zip,
      materialName: project.materialName,
      workmanshipYears: body.workmanshipYears,
      manufacturerYears: body.manufacturerYears,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + body.workmanshipYears * 365 * 86400000),
      transferable: body.transferable,
      status: 'ACTIVE',
      claims: [],
    });

    project.stage = 'WARRANTY_ACTIVE';
    await project.save();

    await AuditLogModel.create({
      actorId: req.authUser!.sub,
      actorEmail: req.authUser!.email,
      actorRole: req.authUser!.role,
      action: 'WARRANTY_ISSUED',
      entityType: 'warranty',
      entityId: warranty._id,
      metadata: { certificateCode, projectRef: project.projectRef },
    });

    res.status(201).json({ ok: true, data: warranty });
  }),
);
