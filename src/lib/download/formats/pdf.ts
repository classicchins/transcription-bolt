import { generatePdfContent } from './pdf/generator';
import type { Transcription } from '@/lib/types';

export function createPdfDownload(transcription: Transcription): Blob | undefined {
  if (!transcription.content) return;

  const pdfContent = generatePdfContent(transcription);
  return new Blob([pdfContent], { type: 'application/pdf' });
}