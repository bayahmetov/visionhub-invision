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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          admin_comment: string | null
          created_at: string | null
          id: string
          message: string | null
          status: string
          university_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          university_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          university_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          announcement_type: string
          content_en: string | null
          content_kz: string | null
          content_ru: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          published_at: string | null
          title_en: string | null
          title_kz: string | null
          title_ru: string
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string
          content_en?: string | null
          content_kz?: string | null
          content_ru: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          published_at?: string | null
          title_en?: string | null
          title_kz?: string | null
          title_ru: string
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string
          content_en?: string | null
          content_kz?: string | null
          content_ru?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          published_at?: string | null
          title_en?: string | null
          title_kz?: string | null
          title_ru?: string
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string
          content_en: string | null
          content_kz: string | null
          content_ru: string
          cover_image_url: string | null
          created_at: string | null
          excerpt_en: string | null
          excerpt_kz: string | null
          excerpt_ru: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title_en: string | null
          title_kz: string | null
          title_ru: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          content_en?: string | null
          content_kz?: string | null
          content_ru: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_kz?: string | null
          excerpt_ru?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title_en?: string | null
          title_kz?: string | null
          title_ru: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content_en?: string | null
          content_kz?: string | null
          content_ru?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_kz?: string | null
          excerpt_ru?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title_en?: string | null
          title_kz?: string | null
          title_ru?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          cost_of_living_kzt: number | null
          created_at: string | null
          description_en: string | null
          description_kz: string | null
          description_ru: string | null
          dormitory_cost_kzt: number | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name_en: string | null
          name_kz: string | null
          name_ru: string
          population: number | null
          region: string
          rent_cost_kzt: number | null
          safety_rating: number | null
          transport_info_en: string | null
          transport_info_kz: string | null
          transport_info_ru: string | null
        }
        Insert: {
          cost_of_living_kzt?: number | null
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          dormitory_cost_kzt?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name_en?: string | null
          name_kz?: string | null
          name_ru: string
          population?: number | null
          region: string
          rent_cost_kzt?: number | null
          safety_rating?: number | null
          transport_info_en?: string | null
          transport_info_kz?: string | null
          transport_info_ru?: string | null
        }
        Update: {
          cost_of_living_kzt?: number | null
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          dormitory_cost_kzt?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name_en?: string | null
          name_kz?: string | null
          name_ru?: string
          population?: number | null
          region?: string
          rent_cost_kzt?: number | null
          safety_rating?: number | null
          transport_info_en?: string | null
          transport_info_kz?: string | null
          transport_info_ru?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_kz: string | null
          description_ru: string | null
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          is_online: boolean | null
          link: string | null
          location: string | null
          title_en: string | null
          title_kz: string | null
          title_ru: string
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          link?: string | null
          location?: string | null
          title_en?: string | null
          title_kz?: string | null
          title_ru: string
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          link?: string | null
          location?: string | null
          title_en?: string | null
          title_kz?: string | null
          title_ru?: string
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          priority: number | null
          university_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          university_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          university_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      fields_of_study: {
        Row: {
          icon: string | null
          id: string
          name_en: string | null
          name_kz: string | null
          name_ru: string
        }
        Insert: {
          icon?: string | null
          id: string
          name_en?: string | null
          name_kz?: string | null
          name_ru: string
        }
        Update: {
          icon?: string | null
          id?: string
          name_en?: string | null
          name_kz?: string | null
          name_ru?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_kz: string | null
          description_ru: string | null
          id: string
          partner_country: string
          partner_name: string
          partnership_type: string | null
          university_id: string
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          id?: string
          partner_country: string
          partner_name: string
          partnership_type?: string | null
          university_id: string
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          id?: string
          partner_country?: string
          partner_name?: string
          partnership_type?: string | null
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget_max_kzt: number | null
          created_at: string | null
          english_level: string | null
          ent_score: number | null
          expected_ent_score: number | null
          full_name: string | null
          id: string
          interests: string[] | null
          phone: string | null
          preferred_cities: string[] | null
          preferred_fields: string[] | null
          target_degree: string | null
          university_id: string | null
          updated_at: string | null
          willing_to_relocate: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          budget_max_kzt?: number | null
          created_at?: string | null
          english_level?: string | null
          ent_score?: number | null
          expected_ent_score?: number | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          phone?: string | null
          preferred_cities?: string[] | null
          preferred_fields?: string[] | null
          target_degree?: string | null
          university_id?: string | null
          updated_at?: string | null
          willing_to_relocate?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          budget_max_kzt?: number | null
          created_at?: string | null
          english_level?: string | null
          ent_score?: number | null
          expected_ent_score?: number | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          phone?: string | null
          preferred_cities?: string[] | null
          preferred_fields?: string[] | null
          target_degree?: string | null
          university_id?: string | null
          updated_at?: string | null
          willing_to_relocate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          degree_level: Database["public"]["Enums"]["degree_level"]
          description_en: string | null
          description_kz: string | null
          description_ru: string | null
          duration_years: number
          employment_rate: number | null
          ent_min_score: number | null
          field_id: string | null
          grants_available: boolean | null
          id: string
          language: string[] | null
          name_en: string | null
          name_kz: string | null
          name_ru: string
          tuition_fee_kzt: number | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          degree_level: Database["public"]["Enums"]["degree_level"]
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          duration_years?: number
          employment_rate?: number | null
          ent_min_score?: number | null
          field_id?: string | null
          grants_available?: boolean | null
          id?: string
          language?: string[] | null
          name_en?: string | null
          name_kz?: string | null
          name_ru: string
          tuition_fee_kzt?: number | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          degree_level?: Database["public"]["Enums"]["degree_level"]
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          duration_years?: number
          employment_rate?: number | null
          ent_min_score?: number | null
          field_id?: string | null
          grants_available?: boolean | null
          id?: string
          language?: string[] | null
          name_en?: string | null
          name_kz?: string | null
          name_ru?: string
          tuition_fee_kzt?: number | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields_of_study"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          university_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          university_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          university_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          accreditation: string | null
          achievements: string[] | null
          address: string | null
          admission_end_date: string | null
          admission_start_date: string | null
          city: string
          cover_image_url: string | null
          created_at: string | null
          description_en: string | null
          description_kz: string | null
          description_ru: string | null
          email: string | null
          founded_year: number | null
          has_dormitory: boolean | null
          has_grants: boolean | null
          has_military_department: boolean | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          mission_en: string | null
          mission_kz: string | null
          mission_ru: string | null
          name_en: string | null
          name_kz: string | null
          name_ru: string
          phone: string | null
          ranking_national: number | null
          ranking_qs: number | null
          rector_name: string | null
          rector_photo_url: string | null
          region: string
          students_count: number | null
          teachers_count: number | null
          type: Database["public"]["Enums"]["university_type"]
          updated_at: string | null
          virtual_tour_url: string | null
          website: string | null
        }
        Insert: {
          accreditation?: string | null
          achievements?: string[] | null
          address?: string | null
          admission_end_date?: string | null
          admission_start_date?: string | null
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          email?: string | null
          founded_year?: number | null
          has_dormitory?: boolean | null
          has_grants?: boolean | null
          has_military_department?: boolean | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mission_en?: string | null
          mission_kz?: string | null
          mission_ru?: string | null
          name_en?: string | null
          name_kz?: string | null
          name_ru: string
          phone?: string | null
          ranking_national?: number | null
          ranking_qs?: number | null
          rector_name?: string | null
          rector_photo_url?: string | null
          region: string
          students_count?: number | null
          teachers_count?: number | null
          type?: Database["public"]["Enums"]["university_type"]
          updated_at?: string | null
          virtual_tour_url?: string | null
          website?: string | null
        }
        Update: {
          accreditation?: string | null
          achievements?: string[] | null
          address?: string | null
          admission_end_date?: string | null
          admission_start_date?: string | null
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_kz?: string | null
          description_ru?: string | null
          email?: string | null
          founded_year?: number | null
          has_dormitory?: boolean | null
          has_grants?: boolean | null
          has_military_department?: boolean | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mission_en?: string | null
          mission_kz?: string | null
          mission_ru?: string | null
          name_en?: string | null
          name_kz?: string | null
          name_ru?: string
          phone?: string | null
          ranking_national?: number | null
          ranking_qs?: number | null
          rector_name?: string | null
          rector_photo_url?: string | null
          region?: string
          students_count?: number | null
          teachers_count?: number | null
          type?: Database["public"]["Enums"]["university_type"]
          updated_at?: string | null
          virtual_tour_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      university_fields: {
        Row: {
          created_at: string
          field_id: string
          id: string
          university_id: string
        }
        Insert: {
          created_at?: string
          field_id: string
          id?: string
          university_id: string
        }
        Update: {
          created_at?: string
          field_id?: string
          id?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields_of_study"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_fields_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      university_views: {
        Row: {
          id: string
          source_city: string | null
          source_country: string | null
          university_id: string
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          source_city?: string | null
          source_country?: string | null
          university_id: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          source_city?: string | null
          source_country?: string | null
          university_id?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_views_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          document_type: string
          file_url: string
          id: string
          title: string
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          document_type: string
          file_url: string
          id?: string
          title: string
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          document_type?: string
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roadmap_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description_ru: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          sort_order: number | null
          task_key: string
          title_en: string | null
          title_kz: string | null
          title_ru: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description_ru?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          task_key: string
          title_en?: string | null
          title_kz?: string | null
          title_ru: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description_ru?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          sort_order?: number | null
          task_key?: string
          title_en?: string | null
          title_kz?: string | null
          title_ru?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roadmap_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_university: {
        Args: { _university_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student" | "university"
      degree_level: "bachelor" | "master" | "doctorate"
      university_type: "national" | "state" | "private" | "international"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "student", "university"],
      degree_level: ["bachelor", "master", "doctorate"],
      university_type: ["national", "state", "private", "international"],
    },
  },
} as const
