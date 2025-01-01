import { saveAs } from 'file-saver';
import { Document, Paragraph, Packer } from 'docx';
import { Transcription } from '@/lib/types';
import { createTextDownload } from './formats/text';
import { createSrtDownload } from './formats/srt';
import { createPdfDownload } from './formats/pdf';

export async function bulkDownload(
  transcriptions: Transcription[],
  format: 'txt' | 'docx' | 'srt' | 'pdf'
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const completedTranscriptions = transcriptions.filter(t => 
    t.content && t.status === 'completed'
  );

  if (completedTranscriptions.length === 0) {
    throw new Error('No completed transcriptions selected');
  }

  if (format === 'docx') {
    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: completedTranscriptions.flatMap(t => [
          new Paragraph({
            text: `=== ${t.file?.name || 'Untitled'} ===`,
            spacing: { before: 400, after: 200 }
          }),
          ...t.content!.split('\n\n').map(text => 
            new Paragraph({ 
              text: text.trim(),
              spacing: { after: 200 }
            })
          )
        ])
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `transcriptions-${timestamp}.docx`);
    return;
  }

  // Handle other formats
  const combinedContent = completedTranscriptions
    .map(t => {
      const header = `\n=== ${t.file?.name || 'Untitled'} ===\n`;
      return header + t.content;
    })
    .join('\n\n');

  const mockTranscription: Transcription = {
    ...completedTranscriptions[0],
    content: combinedContent
  };

  let blob: Blob | undefined;
  let extension: string;

  switch (format) {
    case 'txt':
      blob = createTextDownload(mockTranscription);
      extension = 'txt';
      break;
    case 'srt':
      blob = createSrtDownload(mockTranscription);
      extension = 'srt';
      break;
    case 'pdf':
      blob = createPdfDownload(mockTranscription);
      extension = 'pdf';
      break;
    default:
      throw new Error('Unsupported format');
  }

  if (!blob) {
    throw new Error('Failed to create download file');
  }

  saveAs(blob, `transcriptions-${timestamp}.${extension}`);
}