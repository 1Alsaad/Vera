export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  user_management: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          finished_setup: boolean
          id: number
          location: string
          organization_name: string
          sector: string
        }
        Insert: {
          created_at: string
          finished_setup?: boolean
          id: number
          location: string
          organization_name: string
          sector: string
        }
        Update: {
          created_at?: string
          finished_setup?: boolean
          id?: number
          location?: string
          organization_name?: string
          sector?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          email: string
          firstname: string | null
          has_avatar: boolean
          id: string
          lastname: string | null
          updated_at: string | null
          user_role:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Insert: {
          company?: string | null
          email: string
          firstname?: string | null
          has_avatar: boolean
          id: string
          lastname?: string | null
          updated_at?: string | null
          user_role?:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Update: {
          company?: string | null
          email?: string
          firstname?: string | null
          has_avatar?: boolean
          id?: string
          lastname?: string | null
          updated_at?: string | null
          user_role?:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["organization_name"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: number
          permission: string | null
          user_role:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Insert: {
          created_at?: string
          id?: number
          permission?: string | null
          user_role?:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Update: {
          created_at?: string
          id?: number
          permission?: string | null
          user_role?:
            | "Administrator"
            | "Sustainability Manager"
            | "Data Entry User"
            | "Department Manager"
            | "Viewer"
            | null
        }
        Relationships: []
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
