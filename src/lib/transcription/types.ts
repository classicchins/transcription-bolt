export interface Word {
  id: number;
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}