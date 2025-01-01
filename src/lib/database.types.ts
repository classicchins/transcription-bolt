export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      credits: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'usage'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'usage'
          description?: string | null
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          size: number
          type: string
          status: 'pending' | 'processing' | 'completed' | 'error'
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          size: number
          type: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          size?: number
          type?: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          storage_path?: string
          created_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          file_id: string
          user_id: string
          content: string | null
          status: 'pending' | 'processing' | 'completed' | 'error'
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_id: string
          user_id: string
          content?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          user_id?: string
          content?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'error'
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}