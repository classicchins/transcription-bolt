import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsOptions {
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onSkipBack,
  onSkipForward,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        onPlayPause?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onSkipBack?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onSkipForward?.();
        break;
    }
  }, [onPlayPause, onSkipBack, onSkipForward]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enabled, handleKeyPress]);
}