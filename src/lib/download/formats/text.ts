export function createTextDownload(transcription: Transcription): Blob | undefined {
  if (!transcription.content) return;

  // Format text with proper spacing and structure
  const formattedContent = transcription.content
    .split('\n\n')
    .map(paragraph => {
      // Clean up whitespace and ensure proper sentence endings
      const cleaned = paragraph.trim();
      return cleaned + (cleaned.match(/[.!?]$/) ? '' : '.');
    })
    .join('\n\n');

  const header = `Transcription ID: ${transcription.id}\n` +
                `Created: ${new Date(transcription.created_at).toLocaleString()}\n` +
                `File: ${transcription.file?.name || 'Unknown'}\n\n` +
                '---\n\n';

  return new Blob([header + formattedContent], { 
    type: 'text/plain;charset=utf-8' 
  });
}