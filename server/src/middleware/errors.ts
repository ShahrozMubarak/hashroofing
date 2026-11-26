import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES } from '../config/constants.js';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validate<T>(schema: { parse: (v: unknown) => T }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    ok: false,
    error: { code: ERROR_CODES.NOT_FOUND, message: 'Endpoint not found.' },
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'body';
      if (!fields[key]) fields[key] = issue.message;
    }
    return res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: Object.values(fields)[0] || 'Validation failed.',
        fields,
      },
    });
  }

  if ((err as { type?: string })?.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Malformed JSON request payload.',
      },
    });
  }

  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      ok: false,
      error: {
        code: ERROR_CODES.AUTH_FORBIDDEN,
        message: 'Request origin is not permitted by CORS policy.',
      },
    });
  }

  if (err instanceof Error && err.name === 'ValidationError') {
    const mongooseErr = err as Error & { errors?: Record<string, { message?: string }> };
    const fields: Record<string, string> = {};
    if (mongooseErr.errors) {
      for (const [k, v] of Object.entries(mongooseErr.errors)) {
        fields[k] = v?.message || 'Invalid value.';
      }
    }
    return res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: Object.values(fields)[0] || 'Validation failed.',
        fields,
      },
    });
  }

  if (err instanceof Error && err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid identifier or parameter format.',
      },
    });
  }

  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      ok: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: 'A record with this unique value already exists.',
      },
    });
  }

  console.error('Unhandled API error:', err);
  return res.status(500).json({
    ok: false,
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'An unexpected error occurred.' },
  });
}

