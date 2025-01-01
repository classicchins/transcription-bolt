interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 }: Partial<RetryConfig> = {}
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt) * (0.5 + Math.random()),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}