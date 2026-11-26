import type { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, type Role } from '../config/constants.js';
import { verifyAccessToken, type AccessTokenPayload } from '../lib/tokens.js';
import { AppError } from './errors.js';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AccessTokenPayload;
  }
}

export function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (token) {
    try {
      req.authUser = verifyAccessToken(token);
    } catch {
      req.authUser = undefined;
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (!token) {
    next(new AppError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'Authentication required.'));
    return;
  }
  try {
    req.authUser = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, ERROR_CODES.AUTH_TOKEN_INVALID, 'Session expired or invalid token.'));
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(new AppError(401, ERROR_CODES.AUTH_UNAUTHORIZED, 'Authentication required.'));
      return;
    }
    if (!allowedRoles.includes(req.authUser.role)) {
      next(new AppError(403, ERROR_CODES.AUTH_FORBIDDEN, 'Insufficient permissions for this action.'));
      return;
    }
    next();
  };
}

