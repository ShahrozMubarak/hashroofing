import { Router } from 'express';
import { z } from 'zod';
import { ERROR_CODES, VALID_SERVICES } from '../config/constants.js';
import { buildEstimatePdfBuffer } from '../lib/pdf.js';
import { generateOpaqueToken } from '../lib/tokens.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { MaterialSystemModel } from '../models/catalog.model.js';
import { EstimateModel } from '../models/estimate.model.js';
import { findZoneByZip } from './coverageCatalog.routes.js';

export const estimatesRouter = Router();

const calcSchema = z.object({
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid 5-digit ZIP code required.'),
  service: z.enum(VALID_SERVICES),
  materialSlug: z.string().min(1),
  roofSqFt: z.coerce.number().min(400).max(18000),
  pitchTier: z.enum(['LOW', 'STANDARD', 'STEEP']),
  stories: z.coerce.number().refine((v): v is 1 | 2 | 3 => v === 1 || v === 2 || v === 3),
  tearOffLayers: z.coerce.number().refine((v): v is 0 | 1 | 2 => v === 0 || v === 1 || v === 2),
  skylightCount: z.coerce.number().int().min(0).max(20).default(0),
  chimneyCount: z.coerce.number().int().min(0).max(8).default(0),
  deckingAllowancePct: z.coerce.number().min(0).max(40).default(5),
});

const createEstimateSchema = calcSchema.extend({
  homeownerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(40),
  notes: z.string().trim().max(1000).optional().default(''),
});

export async function runEstimateCalculation(input: z.infer<typeof calcSchema>) {
  const material = await MaterialSystemModel.findOne({ slug: input.materialSlug, active: true }).lean();
  if (!material) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Selected roofing material system not found.');
  }

  const zone = await findZoneByZip(input.zip);
  const regionalMult = zone?.regionalMultiplier ?? 1.02;

  const pitchMult = input.pitchTier === 'LOW' ? 1.0 : input.pitchTier === 'STANDARD' ? 1.12 : 1.28;
  const storyMult = input.stories === 1 ? 1.0 : input.stories === 2 ? 1.06 : 1.14;
  const wasteFactorPct = input.pitchTier === 'STEEP' ? 15 : input.pitchTier === 'STANDARD' ? 12 : 8;
  const serviceRatio =
    input.service === 'Roof repair' ? 0.35 : input.service === 'Roof inspections' ? 0.04 : 1.0;

  const billableSqFt = input.roofSqFt * (1 + wasteFactorPct / 100);

  const lineItems = [];
  if (serviceRatio >= 1 && input.tearOffLayers > 0) {
    const tearLow = Math.round(input.roofSqFt * (1.1 + input.tearOffLayers * 0.45) * storyMult);
    const tearHigh = Math.round(tearLow * 1.22);
    lineItems.push({
      code: 'TEAROFF',
      label: `${input.tearOffLayers}-Layer Tear-Off, Disposal & Magnetic Sweep`,
      category: 'Prep',
      lowUsd: tearLow,
      highUsd: tearHigh,
    });
  }

  const underlayLow = Math.round(input.roofSqFt * 1.05 * serviceRatio);
  const underlayHigh = Math.round(underlayLow * 1.25);
  lineItems.push({
    code: 'UNDERLAY',
    label: zone?.snowLoadPsf && zone.snowLoadPsf >= 35
      ? 'Heavy Ice-Dam Membrane (6 ft eave) & Synthetic Felt'
      : 'Ice & Water Shield Valleys + Synthetic Underlayment',
    category: 'Envelope',
    lowUsd: underlayLow,
    highUsd: underlayHigh,
  });

  if (input.deckingAllowancePct > 0 && serviceRatio >= 0.35) {
    const deckLow = Math.round(input.roofSqFt * (input.deckingAllowancePct / 100) * 3.5);
    const deckHigh = Math.round(deckLow * 1.35);
    lineItems.push({
      code: 'DECKING',
      label: `CDX Plywood Sheathing Allowance (${input.deckingAllowancePct}% area)`,
      category: 'Structural',
      lowUsd: deckLow,
      highUsd: deckHigh,
    });
  }

  const sysLow = Math.round(
    billableSqFt * material.pricePerSqFtLow * pitchMult * storyMult * regionalMult * serviceRatio,
  );
  const sysHigh = Math.round(
    billableSqFt * material.pricePerSqFtHigh * pitchMult * storyMult * regionalMult * serviceRatio,
  );
  lineItems.push({
    code: 'SYSTEM',
    label: `${material.name} (incl. ${wasteFactorPct}% cut waste)`,
    category: 'Primary',
    lowUsd: Math.max(450, sysLow),
    highUsd: Math.max(650, sysHigh),
  });

  if (input.skylightCount > 0 || input.chimneyCount > 0) {
    const detailLow = input.skylightCount * 425 + input.chimneyCount * 580;
    const detailHigh = input.skylightCount * 620 + input.chimneyCount * 820;
    lineItems.push({
      code: 'FLASHING',
      label: `${input.skylightCount} Skylight Kit(s) & ${input.chimneyCount} Chimney Cricket/Flashing`,
      category: 'Detail',
      lowUsd: detailLow,
      highUsd: detailHigh,
    });
  }

  const permitLow = input.service === 'Roof inspections' ? 0 : 480;
  const permitHigh = input.service === 'Roof inspections' ? 0 : 750;
  if (permitLow > 0) {
    lineItems.push({
      code: 'PERMIT',
      label: 'Municipal Permitting, Ridge Ventilation & Final Cleanup',
      category: 'Compliance',
      lowUsd: permitLow,
      highUsd: permitHigh,
    });
  }

  const totalLowUsd = lineItems.reduce((acc, l) => acc + l.lowUsd, 0);
  const totalHighUsd = lineItems.reduce((acc, l) => acc + l.highUsd, 0);
  const estimatedDays =
    input.service === 'Roof inspections'
      ? 1
      : Math.max(1, Math.ceil((input.roofSqFt / 1100) * pitchMult));

  return {
    hubName: zone?.hubName ?? 'Regional Dispatch',
    covered: Boolean(zone),
    climateZone: zone?.climateZone ?? 'Standard U.S. Residential Zone',
    materialName: material.name,
    warrantyYears: material.warrantyYears,
    wasteFactorPct,
    totalLowUsd,
    totalHighUsd,
    estimatedDays,
    lineItems,
  };
}

estimatesRouter.post(
  '/calculate',
  validate(calcSchema),
  asyncHandler(async (req, res) => {
    const calc = await runEstimateCalculation(req.body);
    res.json({ ok: true, data: calc });
  }),
);

estimatesRouter.post(
  '/',
  validate(createEstimateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createEstimateSchema>;
    const calc = await runEstimateCalculation(body);
    const digits = body.phone.replace(/\D/g, '');
    const phoneLast4 = digits.slice(-4);
    const quoteNumber = `AUR-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const accessSecret = generateOpaqueToken(8);

    const estimate = await EstimateModel.create({
      quoteNumber,
      accessSecret,
      homeownerName: body.homeownerName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      phoneLast4,
      zip: body.zip.slice(0, 5),
      hubName: calc.hubName,
      service: body.service,
      materialSlug: body.materialSlug,
      materialName: calc.materialName,
      roofSqFt: body.roofSqFt,
      pitchTier: body.pitchTier,
      stories: body.stories,
      tearOffLayers: body.tearOffLayers,
      skylightCount: body.skylightCount,
      chimneyCount: body.chimneyCount,
      deckingAllowancePct: body.deckingAllowancePct,
      wasteFactorPct: calc.wasteFactorPct,
      totalLowUsd: calc.totalLowUsd,
      totalHighUsd: calc.totalHighUsd,
      estimatedDays: calc.estimatedDays,
      warrantyYears: calc.warrantyYears,
      lineItems: calc.lineItems,
      status: 'SENT',
      notes: body.notes,
    });

    res.status(201).json({ ok: true, data: estimate });
  }),
);

estimatesRouter.get(
  '/lookup',
  asyncHandler(async (req, res) => {
    const quoteNumber = String(req.query.ref ?? '').trim().toUpperCase();
    const last4 = String(req.query.last4 ?? '').trim();
    if (!quoteNumber || !last4) {
      throw new AppError(400, ERROR_CODES.VALIDATION_FAILED, 'Quote reference and phone last 4 digits are required.');
    }
    const estimate = await EstimateModel.findOne({ quoteNumber, phoneLast4: last4 }).lean();
    if (!estimate) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'No estimate found matching those details.');
    }
    res.json({ ok: true, data: estimate });
  }),
);

estimatesRouter.get(
  '/:quoteNumber/pdf',
  asyncHandler(async (req, res) => {
    const quoteNumber = String(req.params.quoteNumber).trim().toUpperCase();
    const last4 = String(req.query.last4 ?? '').trim();
    const estimate = await EstimateModel.findOne({ quoteNumber }).lean();
    if (!estimate || (last4 && estimate.phoneLast4 !== last4)) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Estimate PDF not available.');
    }
    const pdf = await buildEstimatePdfBuffer(estimate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${estimate.quoteNumber}.pdf"`);
    res.send(pdf);
  }),
);
