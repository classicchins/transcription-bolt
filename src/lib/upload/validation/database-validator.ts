import { z } from 'zod';
import type { DatabaseResponse, ValidationResult } from '../types';

// Schema for database response
const databaseResponseSchema = z.object({
  file_id: z.string().uuid(),
  transcription_id: z.string().uuid()
}).strict();

export function validateDatabaseResponse(data: unknown): ValidationResult<DatabaseResponse> {
  try {
    // Handle array response by taking first item
    const responseData = Array.isArray(data) ? data[0] : data;
    
    if (!responseData) {
      return {
        success: false,
        error: 'Empty database response'
      };
    }

    // Parse and validate the response
    const result = databaseResponseSchema.safeParse(responseData);
    
    if (!result.success) {
      const error = result.error.errors[0];
      return {
        success: false,
        error: `Invalid database response: ${error.message}`
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to validate database response'
    };
  }
}