import { Router } from 'express';
import { z } from 'zod';
import { STORM_SEVERITIES, VALID_SERVICES } from '../config/constants.js';
import { sendCompanyEmail } from '../lib/mailer.js';
import { asyncHandler, validate } from '../middleware/errors.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { LeadModel, StormClaimModel } from '../models/crm.model.js';
import { findZoneByZip } from './coverageCatalog.routes.js';

export const engagementRouter = Router();

// Preserves legacy /api/contact contract cleanly while persisting a scored CRM Lead record
export async function handleContactSubmission(req: any, res: any) {
  const { name, email, phone, zip, service, message, website } = req.body || {};

  if (typeof website === 'string' && website.trim().length > 0) {
    return res.status(200).json({ ok: true, delivered: false, status: 'received' });
  }

  const cleanName = typeof name === 'string' ? name.trim().slice(0, 100) : '';
  const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 254) : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
  const cleanZip = typeof zip === 'string' ? zip.trim() : '';
  const cleanService = typeof service === 'string' ? service.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
  const errors: Record<string, string> = {};

  if (cleanName.length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = 'Please enter a valid email address.';
  if (cleanPhone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a valid phone number.';
  if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) errors.zip = 'Please enter a valid 5-digit U.S. ZIP code.';
  if (!(VALID_SERVICES as readonly string[]).includes(cleanService)) {
    errors.service = 'Please select a valid roofing service.';
  }
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const zone = await findZoneByZip(cleanZip);
  const basePriority = cleanService === 'Roof replacement' ? 88 : cleanService === 'Roof installation' ? 84 : 74;
  const priorityScore = Math.min(99, basePriority + (zone ? 8 : 0) + (cleanMessage.length > 40 ? 4 : 0));

  const emailResult = await sendCompanyEmail({
    replyTo: cleanEmail,
    subject: `New roofing inquiry — ${cleanService} (${cleanZip.slice(0, 5)})`,
    text: [
      'New roofing estimate request',
      '',
      `Name: ${cleanName}`,
      `Email: ${cleanEmail}`,
      `Phone: ${cleanPhone}`,
      `Property ZIP: ${cleanZip} (${zone?.hubName ?? 'Outside primary corridor'})`,
      `Service: ${cleanService}`,
      '',
      'Project details:',
      cleanMessage || 'No additional details provided.',
    ].join('\n'),
  });

  const leadRef = `AUR-LD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const lead = await LeadModel.create({
    leadRef,
    name: cleanName,
    email: cleanEmail.toLowerCase(),
    phone: cleanPhone,
    zip: cleanZip.slice(0, 5),
    hubName: zone?.hubName ?? 'Out of primary corridor',
    covered: Boolean(zone),
    service: cleanService,
    message: cleanMessage,
    stage: 'NEW',
    priorityScore,
    emailDelivered: emailResult.delivered,
    emailStatus: emailResult.delivered ? 'sent' : emailResult.status,
  });

  if (emailResult.delivered === false) {
    // Still persisted cleanly in CRM database, while honoring README's honest email integration contract
    return res.status(emailResult.status === 'integration_pending' ? 503 : 502).json({
      ok: false,
      delivered: false,
      status: emailResult.status,
      leadRef: lead.leadRef,
      error: emailResult.error,
    });
  }

  return res.status(200).json({
    ok: true,
    delivered: true,
    status: 'received',
    leadRef: lead.leadRef,
    message: 'Your request has been sent successfully.',
  });
}

engagementRouter.post('/contact', contactLimiter, asyncHandler(handleContactSubmission));

const stormClaimSchema = z.object({
  homeownerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(40),
  propertyAddress: z.string().trim().min(5).max(200),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  severity: z.enum(STORM_SEVERITIES),
  hasInteriorLeak: z.boolean().default(false),
  needsEmergencyTarp: z.boolean().default(false),
  insuranceCarrier: z.string().trim().max(100).optional().default(''),
  notes: z.string().trim().max(1500).optional().default(''),
});

engagementRouter.post(
  '/storm-claims',
  contactLimiter,
  validate(stormClaimSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof stormClaimSchema>;
    const digits = body.phone.replace(/\D/g, '');
    const urgent = body.hasInteriorLeak || body.needsEmergencyTarp || body.severity === 'TREE_IMPACT';
    const dispatchTargetHours = urgent ? 4 : 18;
    const claimRef = `AUR-STM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const claim = await StormClaimModel.create({
      ...body,
      email: body.email.toLowerCase(),
      zip: body.zip.slice(0, 5),
      phoneLast4: digits.slice(-4),
      claimRef,
      dispatchTargetHours,
      status: 'TRIAGED',
    });

    res.status(201).json({ ok: true, data: claim });
  }),
);

