import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { PROJECT_STAGES, type ProjectStage } from '../config/constants.js';

export interface IFieldLog {
  id: string;
  stage: ProjectStage;
  authorName: string;
  note: string;
  weatherNote: string;
  createdAt: Date;
}

export interface IChangeOrder {
  id: string;
  title: string;
  reason: string;
  amountDeltaUsd: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: Date;
  decidedAt?: Date | null;
}

export interface IProject {
  _id: string;
  projectRef: string;
  title: string;
  homeownerName: string;
  email: string;
  phone: string;
  phoneLast4: string;
  propertyAddress: string;
  zip: string;
  hubName: string;
  service: string;
  materialName: string;
  stage: ProjectStage;
  crewLead: string;
  permitNumber: string;
  contractTotalUsd: number;
  targetCompletionDate: string;
  weatherHold: boolean;
  estimateRef?: string;
  inspectionRef?: string;
  fieldLogs: IFieldLog[];
  changeOrders: IChangeOrder[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    _id: { type: String, default: () => uuid() },
    projectRef: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    homeownerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    phoneLast4: { type: String, required: true, index: true },
    propertyAddress: { type: String, required: true },
    zip: { type: String, required: true },
    hubName: { type: String, required: true },
    service: { type: String, required: true },
    materialName: { type: String, required: true },
    stage: { type: String, enum: PROJECT_STAGES, default: 'ASSESSMENT' },
    crewLead: { type: String, default: 'Elena Cho — Senior Crew Lead' },
    permitNumber: { type: String, default: '' },
    contractTotalUsd: { type: Number, required: true },
    targetCompletionDate: { type: String, required: true },
    weatherHold: { type: Boolean, default: false },
    estimateRef: { type: String },
    inspectionRef: { type: String },
    fieldLogs: [
      {
        id: String,
        stage: String,
        authorName: String,
        note: String,
        weatherNote: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    changeOrders: [
      {
        id: String,
        title: String,
        reason: String,
        amountDeltaUsd: Number,
        status: { type: String, enum: ['PENDING', 'APPROVED', 'DECLINED'], default: 'PENDING' },
        createdAt: { type: Date, default: Date.now },
        decidedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export const ProjectModel = mongoose.model<IProject>('Project', projectSchema);

export interface IWarrantyClaim {
  id: string;
  issueTitle: string;
  description: string;
  severity: 'ROUTINE' | 'URGENT';
  status: 'OPEN' | 'DISPATCHED' | 'RESOLVED';
  createdAt: Date;
}

export interface IWarranty {
  _id: string;
  certificateCode: string;
  projectRef: string;
  homeownerName: string;
  propertyAddress: string;
  zip: string;
  materialName: string;
  workmanshipYears: number;
  manufacturerYears: number;
  issuedAt: Date;
  expiresAt: Date;
  transferable: boolean;
  status: 'ACTIVE' | 'TRANSFERRED' | 'EXPIRED';
  claims: IWarrantyClaim[];
}

const warrantySchema = new Schema<IWarranty>(
  {
    _id: { type: String, default: () => uuid() },
    certificateCode: { type: String, required: true, unique: true, index: true },
    projectRef: { type: String, required: true, index: true },
    homeownerName: { type: String, required: true },
    propertyAddress: { type: String, required: true },
    zip: { type: String, required: true },
    materialName: { type: String, required: true },
    workmanshipYears: { type: Number, default: 15 },
    manufacturerYears: { type: Number, default: 50 },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    transferable: { type: Boolean, default: true },
    status: { type: String, enum: ['ACTIVE', 'TRANSFERRED', 'EXPIRED'], default: 'ACTIVE' },
    claims: [
      {
        id: String,
        issueTitle: String,
        description: String,
        severity: { type: String, enum: ['ROUTINE', 'URGENT'], default: 'ROUTINE' },
        status: { type: String, enum: ['OPEN', 'DISPATCHED', 'RESOLVED'], default: 'OPEN' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export const WarrantyModel = mongoose.model<IWarranty>('Warranty', warrantySchema);

