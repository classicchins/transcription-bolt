import type { Transcription } from '@/lib/types';
import type { DownloadOptions, DownloadResult } from './types';
import { createTextDownload } from './formats/text';
import { createDocDownload } from './formats/doc';
import { createSrtDownload } from './formats/srt';
import { createPdfDownload } from './formats/pdf';

export function downloadTranscription(
  transcription: Transcription, 
  options: DownloadOptions = {}
): DownloadResult {
  try {
    const { format = 'txt', filename } = options;
    
    let blob: Blob | undefined;
    let extension: string;
    
    switch (format) {
      case 'txt':
        blob = createTextDownload(transcription);
        extension = 'txt';
        break;
      case 'doc':
        blob = createDocDownload(transcription);
        extension = 'doc';
        break;
      case 'srt':
        blob = createSrtDownload(transcription);
        extension = 'srt';
        break;
      case 'pdf':
        blob = createPdfDownload(transcription);
        extension = 'pdf';
        break;
      default:
        throw new Error('Unsupported format');
    }

    if (!blob) {
      throw new Error('No content available');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `transcription-${transcription.id}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download file'
    };
  }
}

export {
  createTextDownload,
  createDocDownload,
  createSrtDownload,
  createPdfDownload
};