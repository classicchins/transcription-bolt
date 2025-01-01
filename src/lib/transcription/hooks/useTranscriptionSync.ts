import { useState, useEffect } from 'react';
import { calculateWordTimings } from '../utils/timing';
import type { Word } from '../types';

export function useTranscriptionSync(
  content: string | null,
  mediaDuration: number | undefined
) {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!content || !mediaDuration) return;
    setWords(calculateWordTimings(content, mediaDuration));
  }, [content, mediaDuration]);

  return words;
}