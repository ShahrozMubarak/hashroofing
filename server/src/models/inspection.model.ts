import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { INSPECTION_STATUSES } from '../config/constants.js';

export interface IInspectionReport {
  deckingScore: number;
  flashingScore: number;
  ventilationScore: number;
  surfaceScore: number;
  drainageScore: number;
  overallHealthIndex: number;
  summary: string;
  recommendedAction: string;
  completedAt: Date;
}

export interface IInspection {
  _id: string;
  inspectionRef: string;
  homeownerName: string;
  email: string;
  phone: string;
  phoneLast4: string;
  propertyAddress: string;
  zip: string;
  hubName: string;
  service: string;
  mode: 'ON_SITE' | 'DRONE_AERIAL';
  scheduledDate: string;
  timeSlot: string;
  inspectorName: string;
  status: (typeof INSPECTION_STATUSES)[number];
  concerns: string;
  report?: IInspectionReport;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionSchema = new Schema<IInspection>(
  {
    _id: { type: String, default: () => uuid() },
    inspectionRef: { type: String, required: true, unique: true, index: true },
    homeownerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    phoneLast4: { type: String, required: true, index: true },
    propertyAddress: { type: String, required: true },
    zip: { type: String, required: true },
    hubName: { type: String, required: true },
    service: { type: String, required: true },
    mode: { type: String, enum: ['ON_SITE', 'DRONE_AERIAL'], default: 'ON_SITE' },
    scheduledDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    inspectorName: { type: String, default: 'Marcus Vance, Lead Assessor' },
    status: { type: String, enum: INSPECTION_STATUSES, default: 'SCHEDULED' },
    concerns: { type: String, default: '' },
    report: {
      deckingScore: Number,
      flashingScore: Number,
      ventilationScore: Number,
      surfaceScore: Number,
      drainageScore: Number,
      overallHealthIndex: Number,
      summary: String,
      recommendedAction: String,
      completedAt: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

export const InspectionModel = mongoose.model<IInspection>('Inspection', inspectionSchema);

