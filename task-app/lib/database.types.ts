export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          source: string;
          source_ref: string | null;
          category_id: string | null;
          priority: string;
          sort_order: number;
          status: string;
          created_at: string;
          completed_at: string | null;
          due_date: string | null;
          planned_date: string | null;
          raw_snippet: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          source?: string;
          source_ref?: string | null;
          category_id?: string | null;
          priority?: string;
          sort_order?: number;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          due_date?: string | null;
          planned_date?: string | null;
          raw_snippet?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          source_ref?: string | null;
          category_id?: string | null;
          priority?: string;
          sort_order?: number;
          status?: string;
          completed_at?: string | null;
          due_date?: string | null;
          planned_date?: string | null;
          raw_snippet?: string | null;
        };
      };
    };
  };
}
