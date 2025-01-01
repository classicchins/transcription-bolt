import { z } from 'zod';
import { BaseError } from '../errors/base-error';

export class ValidationError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError('Validation failed', {
      errors: result.error.errors
    });
  }
  
  return result.data;
}