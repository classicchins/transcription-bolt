import type { Word } from '../types';

export function calculateWordTimings(content: string, duration: number): Word[] {
  const words = content.split(/\s+/).filter(Boolean);
  const wordsPerSecond = words.length / duration;
  const wordDuration = 1 / wordsPerSecond;

  return words.map((text, index) => ({
    id: index,
    text,
    start: index * wordDuration,
    end: (index + 1) * wordDuration - 0.02 // Small gap between words
  }));
}