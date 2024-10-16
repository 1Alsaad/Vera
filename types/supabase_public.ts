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
      disclosure_tables: {
        Row: {
          belongs_to: string
          created_at: string | null
          created_by: string | null
          disclosure_id: number | null
          id: number
          table_name: string
          task_id: number | null
          updated_at: string | null
        }
        Insert: {
          belongs_to?: string
          created_at?: string | null
          created_by?: string | null
          disclosure_id?: number | null
          id?: number
          table_name: string
          task_id?: number | null
          updated_at?: string | null
        }
        Update: {
          belongs_to?: string
          created_at?: string | null
          created_by?: string | null
          disclosure_id?: number | null
          id?: number
          table_name?: string
          task_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disclosure_tables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_tables_disclosure_id_fkey"
            columns: ["disclosure_id"]
            isOneToOne: false
            referencedRelation: "disclosures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_tables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          session_id: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          session_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          session_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          company: string
          created_at: string
          file_destination: string
          file_name: string
          id: number
          task_id: number
          uploaded_by: string
        }
        Insert: {
          company: string
          created_at?: string
          file_destination: string
          file_name: string
          id?: number
          task_id: number
          uploaded_by: string
        }
        Update: {
          company?: string
          created_at?: string
          file_destination?: string
          file_name?: string
          id?: number
          task_id?: number
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          created_at: string
          id: number
          q2: string | null
          q3: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          q2?: string | null
          q3?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          q2?: string | null
          q3?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          attached_file: string | null
          created_at: string | null
          created_by: string | null
          id: number
          impact_on_target: string | null
          notes: string | null
          owner: string | null
          period_end: string
          period_start: string | null
          required: boolean | null
          status: Database["public"]["Enums"]["task_status"] | null
          target_id: number | null
          updated_at: string | null
        }
        Insert: {
          attached_file?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          impact_on_target?: string | null
          notes?: string | null
          owner?: string | null
          period_end: string
          period_start?: string | null
          required?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          target_id?: number | null
          updated_at?: string | null
        }
        Update: {
          attached_file?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number
          impact_on_target?: string | null
          notes?: string | null
          owner?: string | null
          period_end?: string
          period_start?: string | null
          required?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          target_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          message: string
          read: boolean | null
          related_id: string | null
          taskid: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          read?: boolean | null
          related_id?: string | null
          taskid?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          read?: boolean | null
          related_id?: string | null
          taskid?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          session_id: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          session_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          session_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_policy_to_authenticated_users: {
        Args: {
          table_name: string
          permission_type: string
        }
        Returns: undefined
      }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
          user_id: string
        }
        Returns: boolean
      }
      check_user_permission_with_claims: {
        Args: {
          table_name: string
          action_required: string
        }
        Returns: boolean
      }
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_company: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents3: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      app_permission: "channels.delete" | "messages.delete"
      app_role: "admin" | "moderator"
      "Collaboration - Category":
        | "Investors"
        | "Management"
        | "Suppliers"
        | "Employees"
        | "Customers"
      materiality_status: "Material" | "Not Material" | "To Assess"
      "Strategy, IROm, or Metrics":
        | "Strategy"
        | "IROm"
        | "Metrics"
        | "Governance"
      target_type: "Absolute" | "Percentage" | "Intensity"
      task_status: "Planned" | "In Progress" | "Completed" | "Missed Deadline"
      user_permissions: "Viewer" | "Commenter" | "Editor"
      user_roles:
        | "Administrator"
        | "Sustainability Manager"
        | "Data Entry User"
        | "Department Manager"
        | "Viewer"
      user_status: "ONLINE" | "OFFLINE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
