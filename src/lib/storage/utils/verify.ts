const TIMEOUT = 10000; // 10 seconds

export async function verifyFileAccess(url: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`File not accessible: ${response.status}`);
    }

    // Verify content type
    const contentType = response.headers.get('content-type');
    if (contentType && !isValidMediaType(contentType)) {
      throw new Error('Invalid media type');
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

function isValidMediaType(contentType: string): boolean {
  return contentType.startsWith('audio/') || contentType.startsWith('video/');
}