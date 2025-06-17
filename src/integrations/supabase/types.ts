export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      child_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          created_by: string
          household_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_goals: {
        Row: {
          assigned_to: string | null
          category: string
          completed: boolean | null
          created_at: string
          description: string | null
          household_id: string
          id: string
          image_url: string | null
          progress: number | null
          show_on_vision_board: boolean | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          household_id: string
          id?: string
          image_url?: string | null
          progress?: number | null
          show_on_vision_board?: boolean | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          household_id?: string
          id?: string
          image_url?: string | null
          progress?: number | null
          show_on_vision_board?: boolean | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_goals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_goals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          properties: Json | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          properties?: Json | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          properties?: Json | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "family_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      household_chores: {
        Row: {
          assigned_to: string | null
          completed_dates: string[]
          created_at: string
          description: string | null
          frequency: string
          household_id: string
          id: string
          points: number
          title: string
          updated_at: string
          weekdays: string[]
        }
        Insert: {
          assigned_to?: string | null
          completed_dates?: string[]
          created_at?: string
          description?: string | null
          frequency?: string
          household_id: string
          id?: string
          points?: number
          title: string
          updated_at?: string
          weekdays?: string[]
        }
        Update: {
          assigned_to?: string | null
          completed_dates?: string[]
          created_at?: string
          description?: string | null
          frequency?: string
          household_id?: string
          id?: string
          points?: number
          title?: string
          updated_at?: string
          weekdays?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "household_chores_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_chores_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_events: {
        Row: {
          assigned_to_child: string | null
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          household_id: string
          id: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_child?: string | null
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          household_id: string
          id?: string
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_child?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          household_id?: string
          id?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_events_assigned_to_child_fkey"
            columns: ["assigned_to_child"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invites: {
        Row: {
          created_at: string
          expires_at: string
          household_id: string
          id: string
          invite_code: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          household_id: string
          id?: string
          invite_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          household_id?: string
          id?: string
          invite_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_household_members_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          assigned_to_child: string | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_public: boolean
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to_child?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to_child?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_events_assigned_to_child_fkey"
            columns: ["assigned_to_child"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_of_household: {
        Args: { household_id: string }
        Returns: boolean
      }
      check_member_of_household: {
        Args: { household_id: string }
        Returns: boolean
      }
      get_user_household: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_of_household: {
        Args: { household_id: string }
        Returns: boolean
      }
      is_in_same_household: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_member_of_household: {
        Args: { household_id: string }
        Returns: boolean
      }
      user_is_admin_of_household: {
        Args: { household_id: string }
        Returns: boolean
      }
      user_is_in_household: {
        Args: { household_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
