export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  target_tracking: {
    Tables: {
      target_milestones: {
        Row: {
          created_at: string
          id: number
          milestone_id: number
          target_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          milestone_id: number
          target_id: number
        }
        Update: {
          created_at?: string
          id?: number
          milestone_id?: number
          target_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "target_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "target_milestones_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          baseline_value: string
          baseline_year: number
          company: string
          created_at: string
          created_by: string | null
          current_value: number | null
          datapoint: number
          disclosure: number | null
          id: number
          is_scientific_based: boolean
          justification: string
          owner: string | null
          scientific_evidence: string | null
          stakeholders_involvement: string
          target_name: string
          target_type: "Absolute" | "Percentage" | "Intensity"
          target_value: string
          target_year: number
          topic: string
        }
        Insert: {
          baseline_value: string
          baseline_year: number
          company: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          datapoint: number
          disclosure?: number | null
          id?: number
          is_scientific_based: boolean
          justification?: string
          owner?: string | null
          scientific_evidence?: string | null
          stakeholders_involvement: string
          target_name: string
          target_type: "Absolute" | "Percentage" | "Intensity"
          target_value: string
          target_year: number
          topic: string
        }
        Update: {
          baseline_value?: string
          baseline_year?: number
          company?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          datapoint?: number
          disclosure?: number | null
          id?: number
          is_scientific_based?: boolean
          justification?: string
          owner?: string | null
          scientific_evidence?: string | null
          stakeholders_involvement?: string
          target_name?: string
          target_type?: "Absolute" | "Percentage" | "Intensity"
          target_value?: string
          target_year?: number
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "targets_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "targets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_datapoint_fkey"
            columns: ["datapoint"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_disclosure_fkey"
            columns: ["disclosure"]
            isOneToOne: false
            referencedRelation: "disclosures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_topic_fkey"
            columns: ["topic"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["title"]
          },
        ]
      }
      targets_files: {
        Row: {
          created_at: string
          file_destination: string
          id: number
          target_id: number
        }
        Insert: {
          created_at?: string
          file_destination: string
          id?: number
          target_id: number
        }
        Update: {
          created_at?: string
          file_destination?: string
          id?: number
          target_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "targets_files_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_targets: {
        Row: {
          created_at: string
          id: number
          target_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          target_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          target_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_targets_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
