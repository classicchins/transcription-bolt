/**
 * Generate a unique channel name for transcription updates
 */
export function getTranscriptionChannelName(userId: string): string {
  return `transcriptions_${userId}`;
}

/**
 * Generate a filter condition for transcription updates
 */
export function getTranscriptionFilter(userId: string): string {
  return `user_id=eq.${userId}`;
}