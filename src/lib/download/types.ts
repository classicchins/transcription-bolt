export interface DownloadOptions {
  format?: 'txt' | 'doc' | 'srt' | 'pdf';
  filename?: string;
}

export interface DownloadResult {
  success: boolean;
  error?: string;
}