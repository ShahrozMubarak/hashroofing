import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { ROLES, type Role } from '../config/constants.js';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  passwordHash: string;
  role: Role;
  title?: string;
  assignedHub?: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => uuid() },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    username: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.HOMEOWNER },
    title: { type: String, default: '' },
    assignedHub: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = mongoose.model<IUser>('User', userSchema);

export interface IRefreshToken {
  _id: string;
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByHash: string | null;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    _id: { type: String, default: () => uuid() },
    userId: { type: String, required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

export const RefreshTokenModel = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

