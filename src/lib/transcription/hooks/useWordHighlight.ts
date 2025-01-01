import { useState, useEffect } from 'react';
import type { Word } from '../types';

export function useWordHighlight(
  words: Word[],
  currentTime: number,
  onHighlight?: (index: number) => void
) {
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);

  useEffect(() => {
    if (!words.length || currentTime === undefined) return;

    const index = words.findIndex(word => 
      currentTime >= word.start && currentTime <= word.end
    );

    if (index !== activeWordIndex) {
      setActiveWordIndex(index);
      onHighlight?.(index);
    }
  }, [currentTime, words, activeWordIndex, onHighlight]);

  return activeWordIndex;
}