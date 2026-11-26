import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { LEAD_STAGES, STORM_SEVERITIES } from '../config/constants.js';

export interface ILead {
  _id: string;
  leadRef: string;
  name: string;
  email: string;
  phone: string;
  zip: string;
  hubName: string;
  covered: boolean;
  service: string;
  message: string;
  stage: (typeof LEAD_STAGES)[number];
  priorityScore: number;
  assignedTo?: string;
  emailDelivered: boolean;
  emailStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    _id: { type: String, default: () => uuid() },
    leadRef: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    zip: { type: String, required: true },
    hubName: { type: String, default: 'Out of primary corridor' },
    covered: { type: Boolean, default: true },
    service: { type: String, required: true },
    message: { type: String, default: '' },
    stage: { type: String, enum: LEAD_STAGES, default: 'NEW' },
    priorityScore: { type: Number, default: 70 },
    assignedTo: { type: String, default: '' },
    emailDelivered: { type: Boolean, default: false },
    emailStatus: { type: String, default: 'stored' },
  },
  { timestamps: true, versionKey: false },
);

export const LeadModel = mongoose.model<ILead>('Lead', leadSchema);

export interface IStormClaim {
  _id: string;
  claimRef: string;
  homeownerName: string;
  email: string;
  phone: string;
  phoneLast4: string;
  propertyAddress: string;
  zip: string;
  severity: (typeof STORM_SEVERITIES)[number];
  hasInteriorLeak: boolean;
  needsEmergencyTarp: boolean;
  insuranceCarrier?: string;
  notes: string;
  dispatchTargetHours: number;
  status: 'TRIAGED' | 'TARP_DISPATCHED' | 'ADJUSTER_MEETING' | 'CONVERTED' | 'CLOSED';
  createdAt: Date;
}

const stormClaimSchema = new Schema<IStormClaim>(
  {
    _id: { type: String, default: () => uuid() },
    claimRef: { type: String, required: true, unique: true, index: true },
    homeownerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    phoneLast4: { type: String, required: true },
    propertyAddress: { type: String, required: true },
    zip: { type: String, required: true },
    severity: { type: String, enum: STORM_SEVERITIES, required: true },
    hasInteriorLeak: { type: Boolean, default: false },
    needsEmergencyTarp: { type: Boolean, default: false },
    insuranceCarrier: { type: String, default: '' },
    notes: { type: String, default: '' },
    dispatchTargetHours: { type: Number, default: 24 },
    status: {
      type: String,
      enum: ['TRIAGED', 'TARP_DISPATCHED', 'ADJUSTER_MEETING', 'CONVERTED', 'CLOSED'],
      default: 'TRIAGED',
    },
  },
  { timestamps: true, versionKey: false },
);

export const StormClaimModel = mongoose.model<IStormClaim>('StormClaim', stormClaimSchema);

export interface ICaseStudy {
  _id: string;
  slug: string;
  title: string;
  city: string;
  state: string;
  service: string;
  materialName: string;
  roofSqFt: number;
  durationDays: number;
  completedYear: number;
  summary: string;
  beforeImage: string;
  afterImage: string;
  highlights: string[];
  featured: boolean;
}

const caseStudySchema = new Schema<ICaseStudy>(
  {
    _id: { type: String, default: () => uuid() },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    service: { type: String, required: true },
    materialName: { type: String, required: true },
    roofSqFt: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    completedYear: { type: Number, default: 2026 },
    summary: { type: String, required: true },
    beforeImage: { type: String, required: true },
    afterImage: { type: String, required: true },
    highlights: [{ type: String }],
    featured: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export const CaseStudyModel = mongoose.model<ICaseStudy>('CaseStudy', caseStudySchema);

export interface IReview {
  _id: string;
  homeownerName: string;
  city: string;
  service: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    _id: { type: String, default: () => uuid() },
    homeownerName: { type: String, required: true },
    city: { type: String, required: true },
    service: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export const ReviewModel = mongoose.model<IReview>('Review', reviewSchema);

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, default: () => uuid() },
    actorId: { type: String, required: true },
    actorEmail: { type: String, default: '' },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

