export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
<<<<<<< HEAD
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      book_bookmarks: {
        Row: {
          book_id: string
          created_at: string
          id: string
          is_favorite: boolean
          note: string | null
          page: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          note?: string | null
          page?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          note?: string | null
          page?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
=======
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
      book_loans: {
        Row: {
          book_id: string
          created_at: string
          due_date: string
          id: string
          loan_date: string
          return_date: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          due_date?: string
          id?: string
          loan_date?: string
          return_date?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          due_date?: string
          id?: string
          loan_date?: string
          return_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_views: {
        Row: {
          book_id: string
          id: string
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          book_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          book_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_views_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          access_type: Database["public"]["Enums"]["book_access_type"]
          author: string
          available: boolean
          category_id: string | null
<<<<<<< HEAD
          content: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          cover_image_url: string | null
          created_at: string
          description: string | null
          digital: boolean
          id: string
          isbn: string | null
          pages: number | null
          pdf_url: string | null
          publication_year: number | null
          publisher: string | null
<<<<<<< HEAD
          subcategory_id: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          title: string
          updated_at: string
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["book_access_type"]
          author: string
          available?: boolean
          category_id?: string | null
<<<<<<< HEAD
          content?: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          digital?: boolean
          id?: string
          isbn?: string | null
          pages?: number | null
          pdf_url?: string | null
          publication_year?: number | null
          publisher?: string | null
<<<<<<< HEAD
          subcategory_id?: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          title: string
          updated_at?: string
        }
        Update: {
          access_type?: Database["public"]["Enums"]["book_access_type"]
          author?: string
          available?: boolean
          category_id?: string | null
<<<<<<< HEAD
          content?: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          digital?: boolean
          id?: string
          isbn?: string | null
          pages?: number | null
          pdf_url?: string | null
          publication_year?: number | null
          publisher?: string | null
<<<<<<< HEAD
          subcategory_id?: string | null
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
<<<<<<< HEAD
          {
            foreignKeyName: "books_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
        ]
      }
      carousel_slides: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
<<<<<<< HEAD
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          book_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
<<<<<<< HEAD
      reading_progress: {
        Row: {
          book_id: string
          created_at: string
          id: string
          last_page: number
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          last_page?: number
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          last_page?: number
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
<<<<<<< HEAD
=======
      reading_positions: {
        Row: {
          book_id: string
          created_at: string
          id: string
          last_read_at: string
          page_number: number
          scroll_position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          page_number?: number
          scroll_position?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          page_number?: number
          scroll_position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_positions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      book_access_type: "online_public" | "online_registered" | "physical_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
<<<<<<< HEAD
  TableName extends (DefaultSchemaTableNameOrOptions extends {
=======
  TableName extends DefaultSchemaTableNameOrOptions extends {
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
<<<<<<< HEAD
    : never) = never,
=======
    : never = never,
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
<<<<<<< HEAD
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
=======
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
<<<<<<< HEAD
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
=======
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
<<<<<<< HEAD
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
=======
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
<<<<<<< HEAD
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
=======
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      book_access_type: ["online_public", "online_registered", "physical_only"],
    },
  },
} as const
