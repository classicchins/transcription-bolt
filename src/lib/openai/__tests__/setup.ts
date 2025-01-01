import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  // Mock environment variables
  vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key');
  
  // Mock fetch globally
  global.fetch = vi.fn();
  
  // Mock FormData
  global.FormData = vi.fn(() => ({
    append: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
  }));
});

afterAll(() => {
  vi.unstubAllEnvs();
});