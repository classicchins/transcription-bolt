import { describe, it, expect } from 'vitest';
import { OPENAI_CONFIG } from '../config';

describe('OpenAI Config', () => {
  it('has valid model configuration', () => {
    expect(OPENAI_CONFIG.model).toBe('whisper-1');
  });

  it('has reasonable file size limits', () => {
    expect(OPENAI_CONFIG.maxFileSize).toBeLessThanOrEqual(25 * 1024 * 1024); // 25MB
  });

  it('includes common audio formats', () => {
    const formats = OPENAI_CONFIG.supportedFormats;
    expect(formats).toContain('mp3');
    expect(formats).toContain('wav');
    expect(formats).toContain('m4a');
  });
});