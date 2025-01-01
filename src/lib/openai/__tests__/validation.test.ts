import { describe, it, expect } from 'vitest';
import { validateApiKey, validateFile, validateTranscriptionOptions } from '../validation';
import { OPENAI_CONFIG } from '../config';

describe('OpenAI Validation', () => {
  describe('validateApiKey', () => {
    it('validates valid API key', () => {
      expect(validateApiKey('sk-valid-key')).toBe(true);
    });

    it('rejects invalid API key', () => {
      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey(null)).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('validates supported file types', () => {
      const validFile = new File([''], 'test.mp3', { type: 'audio/mp3' });
      const result = validateFile(validFile);
      expect(result.success).toBe(true);
    });

    it('rejects unsupported file types', () => {
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
      const result = validateFile(invalidFile);
      expect(result.success).toBe(false);
    });

    it('validates file size', () => {
      const largeFile = new File([new ArrayBuffer(OPENAI_CONFIG.maxFileSize + 1)], 'large.mp3');
      const result = validateFile(largeFile);
      expect(result.success).toBe(false);
    });
  });

  describe('validateTranscriptionOptions', () => {
    it('validates valid options', () => {
      const options = {
        language: 'en',
        temperature: 0.5,
        response_format: 'json' as const
      };
      const result = validateTranscriptionOptions(options);
      expect(result.success).toBe(true);
    });

    it('rejects invalid temperature', () => {
      const options = { temperature: 1.5 };
      const result = validateTranscriptionOptions(options);
      expect(result.success).toBe(false);
    });
  });
});