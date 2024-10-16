export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  actions: {
    Tables: {
      action_tasks: {
        Row: {
          action_id: number
          action_task_id: number
          created_at: string
          id: number
        }
        Insert: {
          action_id: number
          action_task_id: number
          created_at?: string
          id?: number
        }
        Update: {
          action_id?: number
          action_task_id?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "action_tasks_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_tasks_action_task_id_fkey"
            columns: ["action_task_id"]
            isOneToOne: false
            referencedRelation: "tasks_for_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          company: string | null
          created_at: string
          documentation: string
          due_date: string | null
          id: number
          impact_on_target: string | null
          milestone_id: number | null
          owner_id: string
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          documentation: string
          due_date?: string | null
          id?: number
          impact_on_target?: string | null
          milestone_id?: number | null
          owner_id: string
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          documentation?: string
          due_date?: string | null
          id?: number
          impact_on_target?: string | null
          milestone_id?: number | null
          owner_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "actions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_actions: {
        Row: {
          action_id: number
          created_at: string
          id: number
          milestone_id: number
        }
        Insert: {
          action_id: number
          created_at?: string
          id?: number
          milestone_id: number
        }
        Update: {
          action_id?: number
          created_at?: string
          id?: number
          milestone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestone_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_actions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
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
