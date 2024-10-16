export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  esrs: {
    Tables: {
      data_points: {
        Row: {
          "appendix_b_esrs_2_(SFDR_+_PILLAR_3_+_Benchmark_+_CL)": string | null
          appendix_c_esrs_1_less_than_750: string | null
          appendix_c_esrs_1_to_all_undertakings: string | null
          data_type: string | null
          dr: string | null
          esrs: string | null
          id: number
          "may_[v]": string | null
          name: string | null
          paragraph: string | null
          related_ar: string | null
        }
        Insert: {
          "appendix_b_esrs_2_(SFDR_+_PILLAR_3_+_Benchmark_+_CL)"?: string | null
          appendix_c_esrs_1_less_than_750?: string | null
          appendix_c_esrs_1_to_all_undertakings?: string | null
          data_type?: string | null
          dr?: string | null
          esrs?: string | null
          id: number
          "may_[v]"?: string | null
          name?: string | null
          paragraph?: string | null
          related_ar?: string | null
        }
        Update: {
          "appendix_b_esrs_2_(SFDR_+_PILLAR_3_+_Benchmark_+_CL)"?: string | null
          appendix_c_esrs_1_less_than_750?: string | null
          appendix_c_esrs_1_to_all_undertakings?: string | null
          data_type?: string | null
          dr?: string | null
          esrs?: string | null
          id?: number
          "may_[v]"?: string | null
          name?: string | null
          paragraph?: string | null
          related_ar?: string | null
        }
        Relationships: []
      }
      disclosures: {
        Row: {
          description: string | null
          id: number
          metric_type: string | null
          reference: string | null
          topic: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          metric_type?: string | null
          reference?: string | null
          topic?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          metric_type?: string | null
          reference?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          esg: string | null
          ESRS: string
          esrs_ref: string | null
          id: number
          title: string | null
        }
        Insert: {
          esg?: string | null
          ESRS: string
          esrs_ref?: string | null
          id?: number
          title?: string | null
        }
        Update: {
          esg?: string | null
          ESRS?: string
          esrs_ref?: string | null
          id?: number
          title?: string | null
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
