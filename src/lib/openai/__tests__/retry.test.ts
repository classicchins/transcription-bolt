import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../retry';

describe('withRetry', () => {
  it('succeeds on first try', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on failure', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');
    
    const result = await withRetry(operation, { maxRetries: 1, initialDelay: 0 });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('fail'));
    
    await expect(withRetry(operation, { maxRetries: 2, initialDelay: 0 }))
      .rejects.toThrow('fail');
    
    expect(operation).toHaveBeenCalledTimes(3);
  });
});