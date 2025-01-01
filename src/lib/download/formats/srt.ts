import type { Transcription } from '@/lib/types';

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${
    minutes.toString().padStart(2, '0')}:${
    secs.toString().padStart(2, '0')},${
    ms.toString().padStart(3, '0')}`;
}

export function createSrtDownload(transcription: Transcription): Blob | undefined {
  if (!transcription.content) return;

  // Split content into sentences for better timing
  const sentences = transcription.content
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .map(s => s.trim());

  // Create SRT format with proper timing
  const srtContent = sentences.map((sentence, index) => {
    const startTime = index * 3; // 3 seconds per sentence
    const endTime = (index + 1) * 3;
    
    return `${index + 1}
${formatTimestamp(startTime)} --> ${formatTimestamp(endTime)}
${sentence}
`;
  }).join('\n');

  return new Blob([srtContent], { type: 'text/plain' });
}