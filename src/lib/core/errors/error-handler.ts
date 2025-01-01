import { errorService } from '@/lib/transcription/services/error-service';
import { BaseError } from './base-error';

export async function handleError(error: unknown, context?: Record<string, any>) {
  const baseError = error instanceof BaseError 
    ? error 
    : new BaseError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR',
        { originalError: error }
      );

  await errorService.logError(baseError, context);
  return baseError;
}