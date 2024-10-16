export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  reporting: {
    Tables: {
      reporting_data: {
        Row: {
          company: string
          datapoint: number | null
          disclosure: number
          esrs: string | null
          id: number
          is_done: boolean | null
          last_updated: string
          last_updated_by: string
          report_id: number | null
          task_id: number | null
          value: string | null
        }
        Insert: {
          company: string
          datapoint?: number | null
          disclosure: number
          esrs?: string | null
          id?: number
          is_done?: boolean | null
          last_updated?: string
          last_updated_by: string
          report_id?: number | null
          task_id?: number | null
          value?: string | null
        }
        Update: {
          company?: string
          datapoint?: number | null
          disclosure?: number
          esrs?: string | null
          id?: number
          is_done?: boolean | null
          last_updated?: string
          last_updated_by?: string
          report_id?: number | null
          task_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reporting_data_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "reporting_data_datapoint_fkey"
            columns: ["datapoint"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_data_disclosure_fkey"
            columns: ["disclosure"]
            isOneToOne: false
            referencedRelation: "disclosures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_data_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_data_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_data_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          comment: string | null
          created_at: string
          end_date: string | null
          esrs_version: string | null
          id: number
          report_name: string | null
          start_date: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          end_date?: string | null
          esrs_version?: string | null
          id?: number
          report_name?: string | null
          start_date?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          end_date?: string | null
          esrs_version?: string | null
          id?: number
          report_name?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      table_columns: {
        Row: {
          belongs_to: string
          column_name: string
          created_at: string | null
          id: number
          order_index: string
          table_id: number
          updated_at: string | null
        }
        Insert: {
          belongs_to: string
          column_name: string
          created_at?: string | null
          id?: number
          order_index: string
          table_id: number
          updated_at?: string | null
        }
        Update: {
          belongs_to?: string
          column_name?: string
          created_at?: string | null
          id?: number
          order_index?: string
          table_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_columns_belongs_to_fkey"
            columns: ["belongs_to"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "table_columns_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "disclosure_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_data: {
        Row: {
          belongs_to: string
          cell_value: string | null
          column_id: number | null
          created_at: string | null
          id: number
          order_index: number
          table_id: number
          updated_at: string | null
        }
        Insert: {
          belongs_to: string
          cell_value?: string | null
          column_id?: number | null
          created_at?: string | null
          id?: number
          order_index: number
          table_id: number
          updated_at?: string | null
        }
        Update: {
          belongs_to?: string
          cell_value?: string | null
          column_id?: number | null
          created_at?: string | null
          id?: number
          order_index?: number
          table_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_data_belongs_to_fkey"
            columns: ["belongs_to"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "table_data_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "table_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_data_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "disclosure_tables"
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
