import { TranscriptionError } from '../errors';

interface FormattedTranscript {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export function formatTranscript(rawText: string): FormattedTranscript {
  try {
    // Split into paragraphs and clean up
    const paragraphs = rawText
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);

    // Format each paragraph with proper spacing and punctuation
    const formattedParagraphs = paragraphs.map(paragraph => {
      // Capitalize first letter
      let formatted = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
      
      // Ensure proper sentence endings
      if (!/[.!?]$/.test(formatted)) {
        formatted += '.';
      }
      
      return formatted;
    });

    // Create segments with timestamps (approximate)
    const segments = formattedParagraphs.map((text, index) => ({
      start: index * 3,
      end: (index + 1) * 3,
      text
    }));

    // Join paragraphs with double line breaks
    const formattedText = formattedParagraphs.join('\n\n');

    return {
      text: formattedText,
      segments
    };
  } catch (error) {
    throw new TranscriptionError('Failed to format transcript', 'FORMAT_ERROR');
  }
}