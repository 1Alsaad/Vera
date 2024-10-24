export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  task_management: {
    Tables: {
      task_owners: {
        Row: {
          company: string
          created_at: string
          datapoint_id: number
          disclosure_id: number
          id: number
          task_id: number
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          datapoint_id: number
          disclosure_id: number
          id?: number
          task_id: number
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          datapoint_id?: number
          disclosure_id?: number
          id?: number
          task_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_task_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_owners_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "task_owners_datapoint_id_fkey"
            columns: ["datapoint_id"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_owners_disclosure_id_fkey"
            columns: ["disclosure_id"]
            isOneToOne: false
            referencedRelation: "disclosures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_owners_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_permissions: {
        Row: {
          created_at: string
          id: number
          permission: "Viewer" | "Commenter" | "Editor"
          task_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          permission: "Viewer" | "Commenter" | "Editor"
          task_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          permission?: "Viewer" | "Commenter" | "Editor"
          task_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_updates: {
        Row: {
          action_id: number | null
          created_at: string
          created_by: string | null
          id: number
          milestone_id: number | null
          task_id: number | null
          update_description: string | null
          updated_at: string | null
        }
        Insert: {
          action_id?: number | null
          created_at?: string
          created_by?: string | null
          id?: number
          milestone_id?: number | null
          task_id?: number | null
          update_description?: string | null
          updated_at?: string | null
        }
        Update: {
          action_id?: number | null
          created_at?: string
          created_by?: string | null
          id?: number
          milestone_id?: number | null
          task_id?: number | null
          update_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_updates_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_updates_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks_for_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          company: string | null
          completed: boolean
          created_at: string
          created_by: string | null
          datapoint: number | null
          disclosure: number | null
          id: number
          section_name: string | null
        }
        Insert: {
          company?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          datapoint?: number | null
          disclosure?: number | null
          id?: number
          section_name?: string | null
        }
        Update: {
          company?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          datapoint?: number | null
          disclosure?: number | null
          id?: number
          section_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_datapoint_fkey"
            columns: ["datapoint"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_disclosure_fkey"
            columns: ["disclosure"]
            isOneToOne: false
            referencedRelation: "disclosures"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_for_actions: {
        Row: {
          action_id: number | null
          company: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: number
          owner: string | null
          status:
            | "Planned"
            | "In Progress"
            | "Completed"
            | "Missed Deadline"
            | null
        }
        Insert: {
          action_id?: number | null
          company?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          owner?: string | null
          status?:
            | "Planned"
            | "In Progress"
            | "Completed"
            | "Missed Deadline"
            | null
        }
        Update: {
          action_id?: number | null
          company?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          owner?: string | null
          status?:
            | "Planned"
            | "In Progress"
            | "Completed"
            | "Missed Deadline"
            | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_for_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_for_actions_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "tasks(actions)_owner_fkey"
            columns: ["owner"]
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
