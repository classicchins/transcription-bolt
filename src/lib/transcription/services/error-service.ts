import { supabase } from '@/lib/supabase';

class ErrorService {
  async logError(error: unknown, context: Record<string, any> = {}) {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      const { error: logError } = await supabase
        .from('error_logs')
        .insert({
          error_message: errorMessage,
          error_stack: errorStack,
          context: {
            ...context,
            timestamp: new Date().toISOString()
          }
        });

      if (logError) {
        console.error('Failed to log error:', logError);
      }
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }
}

export const errorService = new ErrorService();