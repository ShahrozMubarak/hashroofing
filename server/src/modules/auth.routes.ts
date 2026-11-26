import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { ERROR_CODES, REFRESH_COOKIE_NAME, ROLES } from '../config/constants.js';
import { env, isProd } from '../config/env.js';
import { generateOpaqueToken, hashToken, signAccessToken } from '../lib/tokens.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError, asyncHandler, validate } from '../middleware/errors.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { AuditLogModel } from '../models/crm.model.js';
import { RefreshTokenModel, UserModel, type IUser } from '../models/user.model.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(7).max(40),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

function toSafeUser(user: IUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    username: user.username,
    role: user.role,
    title: user.title,
    assignedHub: user.assignedHub,
  };
}

function setRefreshCookie(res: Parameters<typeof authRouter.post>[0] extends never ? never : any, raw: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE_NAME, raw, {
    httpOnly: true,
    secure: isProd || env.COOKIE_SECURE,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

async function issueSession(user: IUser, res: any, existingFamilyId?: string) {
  const familyId = existingFamilyId ?? generateOpaqueToken(12);
  const rawRefresh = generateOpaqueToken(32);
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 86400000);

  await RefreshTokenModel.create({
    userId: user._id,
    familyId,
    tokenHash: hashToken(rawRefresh),
    expiresAt,
  });

  const accessToken = signAccessToken({
    sub: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  setRefreshCookie(res, rawRefresh, expiresAt);
  return { user: toSafeUser(user), accessToken };
}

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    const exists = await UserModel.findOne({ email });
    if (exists) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await UserModel.create({
      name,
      email,
      phone,
      passwordHash,
      role: ROLES.HOMEOWNER,
      title: 'Homeowner',
    });

    await AuditLogModel.create({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'AUTH_REGISTER',
      entityType: 'user',
      entityId: user._id,
    });

    const session = await issueSession(user.toObject(), res);
    res.status(201).json({ ok: true, data: session });
  }),
);

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body as { identifier: string; password: string };
    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');

    const user = await UserModel.findOne({
      isActive: true,
      $or: [
        { email: clean },
        { username: clean },
        ...(digits.length >= 7 ? [{ phone: new RegExp(`${digits.slice(-10)}$`) }] : []),
      ],
    });

    if (!user) {
      throw new AppError(401, ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid credentials.');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        429,
        ERROR_CODES.AUTH_ACCOUNT_LOCKED,
        'Account temporarily locked after repeated failed attempts.',
      );
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= env.LOGIN_MAX_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * 60000);
      }
      await user.save();
      throw new AppError(401, ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid credentials.');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    await AuditLogModel.create({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'AUTH_LOGIN',
      entityType: 'user',
      entityId: user._id,
    });

    const session = await issueSession(user.toObject(), res);
    res.json({ ok: true, data: session });
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!raw) {
      throw new AppError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'Refresh cookie missing.');
    }

    const tokenHash = hashToken(raw);
    const existing = await RefreshTokenModel.findOne({ tokenHash });
    if (!existing) {
      throw new AppError(401, ERROR_CODES.AUTH_TOKEN_INVALID, 'Invalid refresh token.');
    }

    if (existing.revokedAt) {
      await RefreshTokenModel.updateMany(
        { familyId: existing.familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      throw new AppError(401, ERROR_CODES.AUTH_TOKEN_REUSED, 'Refresh token reuse detected.');
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new AppError(401, ERROR_CODES.AUTH_TOKEN_INVALID, 'Refresh token expired.');
    }

    const user = await UserModel.findOne({ _id: existing.userId, isActive: true });
    if (!user) {
      throw new AppError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'User inactive.');
    }

    const session = await issueSession(user.toObject(), res, existing.familyId);
    existing.revokedAt = new Date();
    await existing.save();

    res.json({ ok: true, data: session });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (raw) {
      await RefreshTokenModel.updateOne(
        { tokenHash: hashToken(raw), revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    res.json({ ok: true, data: { loggedOut: true } });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.authUser!.sub).lean();
    if (!user) throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found.');
    res.json({ ok: true, data: toSafeUser(user) });
  }),
);

