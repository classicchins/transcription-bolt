import { describe, it, expect } from 'vitest';
import { OpenAIError } from '../errors';

describe('OpenAIError', () => {
  it('creates error from response', () => {
    const response = new Response(null, { status: 429 });
    const error = OpenAIError.fromResponse(response, 'Rate limit exceeded');
    
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.code).toBe('OPENAI_API_ERROR');
    expect(error.status).toBe(429);
  });

  it('creates error from generic error', () => {
    const originalError = new Error('Network error');
    const error = OpenAIError.fromError(originalError);
    
    expect(error.message).toBe('Network error');
    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});