import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribeAudio } from '../api';
import { OpenAIError } from '../errors';

describe('transcribeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when API key is missing', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    await expect(transcribeAudio(file)).rejects.toThrow(OpenAIError);
  });

  it('handles successful transcription', async () => {
    const mockResponse = { text: 'Transcribed text' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    const result = await transcribeAudio(file);
    
    expect(result).toBe('Transcribed text');
  });

  it('reports progress through callback', async () => {
    const mockResponse = { text: 'Transcribed text' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const onProgress = vi.fn();
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    
    await transcribeAudio(file, {}, onProgress);
    
    expect(onProgress).toHaveBeenCalledWith({ status: 'processing', progress: 0 });
    expect(onProgress).toHaveBeenCalledWith({ status: 'processing', progress: 50 });
    expect(onProgress).toHaveBeenCalledWith({ status: 'completed', progress: 100 });
  });
});