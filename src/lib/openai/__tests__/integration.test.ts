import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio } from '../api';
import { RateLimiter } from '../rate-limiter';
import { withRetry } from '../retry';

describe('OpenAI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles rate limiting with retry', async () => {
    const mockResponse = { text: 'Transcribed text' };
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Rate limit exceeded'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
    
    global.fetch = fetchMock;

    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    const result = await transcribeAudio(file);
    
    expect(result).toBe('Transcribed text');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('integrates rate limiter with retries', async () => {
    const limiter = new RateLimiter({ maxRequests: 1 });
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(async () => {
      await limiter.checkLimit();
      return operation();
    });
    
    expect(result).toBe('success');
  });
});