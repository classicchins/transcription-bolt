import { describe, it, expect, vi } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  it('allows requests within limit', async () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
    
    const result1 = await limiter.checkLimit();
    const result2 = await limiter.checkLimit();
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('blocks requests over limit', async () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
    
    await limiter.checkLimit();
    const promise = limiter.checkLimit();
    
    vi.advanceTimersByTime(1000);
    const result = await promise;
    
    expect(result).toBe(true);
    vi.useRealTimers();
  });

  it('resets correctly', async () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
    
    await limiter.checkLimit();
    limiter.reset();
    const result = await limiter.checkLimit();
    
    expect(result).toBe(true);
  });
});