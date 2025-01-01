import { PDF_CONFIG } from './constants';

export function calculateTextWidth(text: string, fontSize: number): number {
  // Approximate width calculation (average character width)
  return text.length * (fontSize * 0.5);
}

export function splitTextIntoLines(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = calculateTextWidth(testLine, fontSize);

    if (lineWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function formatParagraphs(content: string): string[] {
  return content
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);
}