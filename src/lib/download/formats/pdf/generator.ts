import { PDF_CONFIG } from './constants';
import { formatParagraphs, splitTextIntoLines } from './utils';
import type { Transcription } from '@/lib/types';

export function generatePdfContent(transcription: Transcription): string {
  if (!transcription.content) return '';

  const { pageSize, margins, fonts } = PDF_CONFIG;
  const textWidth = pageSize.width - margins.left - margins.right;
  const contentStream: string[] = [];

  // Start PDF
  contentStream.push('%PDF-1.7');

  // Add metadata
  const creationDate = new Date().toISOString();
  const title = transcription.file?.name || 'Transcription';
  
  // Add document catalog
  contentStream.push(`
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
  `);

  // Add pages object
  contentStream.push(`
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
  `);

  // Add page object
  contentStream.push(`
3 0 obj
<< 
  /Type /Page 
  /Parent 2 0 R 
  /MediaBox [0 0 ${pageSize.width} ${pageSize.height}]
  /Resources << /Font << /F1 4 0 R >> >>
  /Contents 5 0 R
>>
endobj
  `);

  // Add font
  contentStream.push(`
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
  `);

  // Format content
  const paragraphs = formatParagraphs(transcription.content);
  let yPosition = pageSize.height - margins.top;
  const contentLines: string[] = [];

  // Add header
  contentLines.push(
    'BT',
    `/F1 ${fonts.header.size} Tf`,
    `${margins.left} ${yPosition} Td`,
    `(${title}) Tj`,
    'ET'
  );

  yPosition -= fonts.header.size * fonts.header.lineHeight * 2;

  // Add content paragraphs
  for (const paragraph of paragraphs) {
    const lines = splitTextIntoLines(paragraph, textWidth, fonts.body.size);
    
    contentLines.push(
      'BT',
      `/F1 ${fonts.body.size} Tf`,
      `${margins.left} ${yPosition} Td`,
      `${fonts.body.lineHeight * fonts.body.size} TL`
    );

    for (const line of lines) {
      contentLines.push(`(${line.replace(/[()\\]/g, '\\$&')}) Tj T*`);
      yPosition -= fonts.body.size * fonts.body.lineHeight;
    }

    contentLines.push('ET');
    yPosition -= fonts.body.size; // Add paragraph spacing
  }

  // Add content stream
  const content = contentLines.join('\n');
  contentStream.push(`
5 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
  `);

  // Add cross-reference table
  const xref = `
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000079 00000 n
0000000173 00000 n
0000000301 00000 n
0000000380 00000 n
  `;

  // Add trailer
  const trailer = `
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${content.length + 1000}
%%EOF
  `;

  return contentStream.join('') + xref + trailer;
}