import type { Transcription } from './types';

export function downloadTranscription(transcription: Transcription) {
  if (!transcription.content) return;
  
  const blob = new Blob([transcription.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcription-${transcription.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}