export type { Database } from '../database.types';
export type { AuthError, User } from '@supabase/supabase-js';

export interface StorageError {
  message: string;
  statusCode?: number;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}