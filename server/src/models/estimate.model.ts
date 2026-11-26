import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export interface IEstimateLineItem {
  code: string;
  label: string;
  category: string;
  lowUsd: number;
  highUsd: number;
}

export interface IEstimate {
  _id: string;
  quoteNumber: string;
  accessSecret: string;
  homeownerName: string;
  email: string;
  phone: string;
  phoneLast4: string;
  zip: string;
  hubName: string;
  service: string;
  materialSlug: string;
  materialName: string;
  roofSqFt: number;
  pitchTier: 'LOW' | 'STANDARD' | 'STEEP';
  stories: 1 | 2 | 3;
  tearOffLayers: 0 | 1 | 2;
  skylightCount: number;
  chimneyCount: number;
  deckingAllowancePct: number;
  wasteFactorPct: number;
  totalLowUsd: number;
  totalHighUsd: number;
  estimatedDays: number;
  warrantyYears: number;
  lineItems: IEstimateLineItem[];
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'CONVERTED' | 'EXPIRED';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const estimateSchema = new Schema<IEstimate>(
  {
    _id: { type: String, default: () => uuid() },
    quoteNumber: { type: String, required: true, unique: true, index: true },
    accessSecret: { type: String, required: true },
    homeownerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    phoneLast4: { type: String, required: true, index: true },
    zip: { type: String, required: true },
    hubName: { type: String, default: 'Seattle Hub' },
    service: { type: String, required: true },
    materialSlug: { type: String, required: true },
    materialName: { type: String, required: true },
    roofSqFt: { type: Number, required: true },
    pitchTier: { type: String, enum: ['LOW', 'STANDARD', 'STEEP'], required: true },
    stories: { type: Number, enum: [1, 2, 3], required: true },
    tearOffLayers: { type: Number, enum: [0, 1, 2], required: true },
    skylightCount: { type: Number, default: 0 },
    chimneyCount: { type: Number, default: 0 },
    deckingAllowancePct: { type: Number, default: 5 },
    wasteFactorPct: { type: Number, required: true },
    totalLowUsd: { type: Number, required: true },
    totalHighUsd: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    warrantyYears: { type: Number, required: true },
    lineItems: [
      {
        code: String,
        label: String,
        category: String,
        lowUsd: Number,
        highUsd: Number,
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'SENT', 'APPROVED', 'CONVERTED', 'EXPIRED'],
      default: 'SENT',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

export const EstimateModel = mongoose.model<IEstimate>('Estimate', estimateSchema);

