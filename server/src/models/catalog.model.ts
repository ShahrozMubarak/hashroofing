import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

export interface ICoverageZone {
  _id: string;
  hubName: string;
  city: string;
  state: string;
  zipPrefixes: string[];
  featuredZips: string[];
  climateZone: string;
  windRatingMph: number;
  snowLoadPsf: number;
  inspectionLeadDays: number;
  regionalMultiplier: number;
  active: boolean;
  notes: string;
}

const coverageZoneSchema = new Schema<ICoverageZone>(
  {
    _id: { type: String, default: () => uuid() },
    hubName: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipPrefixes: [{ type: String, required: true }],
    featuredZips: [{ type: String }],
    climateZone: { type: String, required: true },
    windRatingMph: { type: Number, required: true },
    snowLoadPsf: { type: Number, required: true },
    inspectionLeadDays: { type: Number, default: 2 },
    regionalMultiplier: { type: Number, default: 1.0 },
    active: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

export const CoverageZoneModel = mongoose.model<ICoverageZone>('CoverageZone', coverageZoneSchema);

export interface IMaterialSystem {
  _id: string;
  slug: string;
  name: string;
  category: 'Metal' | 'Asphalt' | 'Cedar' | 'Slate' | 'Solar';
  summary: string;
  pricePerSqFtLow: number;
  pricePerSqFtHigh: number;
  warrantyYears: number;
  fireClass: string;
  windRatingMph: number;
  minPitchRatio: number;
  solarReady: boolean;
  lifespanLabel: string;
  swatches: Array<{ name: string; hex: string }>;
  active: boolean;
  sortOrder: number;
}

const materialSystemSchema = new Schema<IMaterialSystem>(
  {
    _id: { type: String, default: () => uuid() },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Metal', 'Asphalt', 'Cedar', 'Slate', 'Solar'], required: true },
    summary: { type: String, required: true },
    pricePerSqFtLow: { type: Number, required: true },
    pricePerSqFtHigh: { type: Number, required: true },
    warrantyYears: { type: Number, required: true },
    fireClass: { type: String, default: 'Class A' },
    windRatingMph: { type: Number, default: 130 },
    minPitchRatio: { type: Number, default: 2 },
    solarReady: { type: Boolean, default: true },
    lifespanLabel: { type: String, required: true },
    swatches: [{ name: String, hex: String }],
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export const MaterialSystemModel = mongoose.model<IMaterialSystem>(
  'MaterialSystem',
  materialSystemSchema,
);

