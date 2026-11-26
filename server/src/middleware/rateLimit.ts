import rateLimit from 'express-rate-limit';
import { ERROR_CODES } from '../config/constants.js';
import { isTest } from '../config/env.js';

function makeMsg(message: string) {
  return { ok: false, error: { code: ERROR_CODES.RATE_LIMITED, message } };
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeMsg('Too many requests. Please try again shortly.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 60,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeMsg('Too many sign-in attempts. Please wait a few minutes.'),
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeMsg('Too many requests. Please wait a few minutes and try again.'),
});

