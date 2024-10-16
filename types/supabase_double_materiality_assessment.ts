export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  double_materiality_assessment: {
    Tables: {
      datapoint_materiality_assessments: {
        Row: {
          company: string
          created_at: string
          datapoint_id: number
          disclosure_reference: string
          id: number
          materiality: "Material" | "Not Material" | "To Assess"
          topic: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          company: string
          created_at?: string
          datapoint_id: number
          disclosure_reference: string
          id?: number
          materiality: "Material" | "Not Material" | "To Assess"
          topic: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          company?: string
          created_at?: string
          datapoint_id?: number
          disclosure_reference?: string
          id?: number
          materiality?: "Material" | "Not Material" | "To Assess"
          topic?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "datapoint_materiality_assessments_datapoint_id_fkey"
            columns: ["datapoint_id"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_datapoint_materiality_assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disclosure_materiality_assessments: {
        Row: {
          company: string
          created_at: string
          id: number
          materiality: "Material" | "Not Material" | "To Assess"
          reference: string | null
          topic: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: number
          materiality?: "Material" | "Not Material" | "To Assess"
          reference?: string | null
          topic?: string | null
          updated_at: string
          updated_by: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: number
          materiality?: "Material" | "Not Material" | "To Assess"
          reference?: string | null
          topic?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_subtopic_materiality_assessments_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "public_subtopic_materiality_assessments_topic_fkey"
            columns: ["topic"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["title"]
          },
          {
            foreignKeyName: "public_subtopic_materiality_assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_materiality_assessments: {
        Row: {
          company: string | null
          created_at: string
          id: number
          materiality: "Material" | "Not Material" | "To Assess"
          reasoning: string | null
          topic: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: number
          materiality: "Material" | "Not Material" | "To Assess"
          reasoning?: string | null
          topic?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: number
          materiality?: "Material" | "Not Material" | "To Assess"
          reasoning?: string | null
          topic?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_materiality_assessments_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "public_materiality_assessments_topic_fkey"
            columns: ["topic"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["title"]
          },
          {
            foreignKeyName: "public_topic_materiality_assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
