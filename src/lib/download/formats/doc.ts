import { Document, Paragraph, Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { Transcription } from '@/lib/types';

export function createDocDownload(transcription: Transcription): Blob | undefined {
  if (!transcription.content) return;

  // Create document with proper formatting
  const doc = new Document({
    sections: [{
      properties: {},
      children: transcription.content
        .split('\n\n')
        .map(text => new Paragraph({ text: text.trim() }))
    }]
  });

  // Generate and return docx file
  return Packer.toBlob(doc);
}

export async function downloadAsDocx(transcription: Transcription): Promise<void> {
  const blob = await createDocDownload(transcription);
  if (!blob) return;
  
  const fileName = `transcription-${transcription.id}.docx`;
  saveAs(blob, fileName);
}