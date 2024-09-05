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
      datapoint_materiality_assessments: {
        Row: {
          company: string
          created_at: string
          datapoint_id: number
          disclosure_reference: string
          id: number
          materiality: Database["public"]["Enums"]["materiality_status"]
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
          materiality: Database["public"]["Enums"]["materiality_status"]
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
          materiality?: Database["public"]["Enums"]["materiality_status"]
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
          materiality: Database["public"]["Enums"]["materiality_status"]
          reference: string | null
          topic: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: number
          materiality?: Database["public"]["Enums"]["materiality_status"]
          reference?: string | null
          topic?: string | null
          updated_at: string
          updated_by: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: number
          materiality?: Database["public"]["Enums"]["materiality_status"]
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
      messages: {
        Row: {
          author: string
          company: string
          email: string | null
          id: number
          inserted_at: string
          last_updated: string | null
          mentioned: Json | null
          message: string
          replied_to: number | null
          task_id: number
        }
        Insert: {
          author: string
          company: string
          email?: string | null
          id?: number
          inserted_at?: string
          last_updated?: string | null
          mentioned?: Json | null
          message: string
          replied_to?: number | null
          task_id: number
        }
        Update: {
          author?: string
          company?: string
          email?: string | null
          id?: number
          inserted_at?: string
          last_updated?: string | null
          mentioned?: Json | null
          message?: string
          replied_to?: number | null
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_replied_to_fkey"
            columns: ["replied_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_messages_email_fkey"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["email"]
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
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          read?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          read?: boolean | null
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
      profiles: {
        Row: {
          company: string | null
          email: string
          firstname: string | null
          has_avatar: boolean
          id: string
          lastname: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_roles"] | null
        }
        Insert: {
          company?: string | null
          email: string
          firstname?: string | null
          has_avatar: boolean
          id: string
          lastname?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
        }
        Update: {
          company?: string | null
          email?: string
          firstname?: string | null
          has_avatar?: boolean
          id?: string
          lastname?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
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
      reporting_data: {
        Row: {
          company: string
          datapoint: number | null
          disclosure: number
          esrs: string | null
          id: number
          last_updated: string
          last_updated_by: string
          report_id: number | null
          status: string | null
          task_id: number | null
          value: string | null
        }
        Insert: {
          company: string
          datapoint?: number | null
          disclosure: number
          esrs?: string | null
          id?: number
          last_updated?: string
          last_updated_by: string
          report_id?: number | null
          status?: string | null
          task_id?: number | null
          value?: string | null
        }
        Update: {
          company?: string
          datapoint?: number | null
          disclosure?: number
          esrs?: string | null
          id?: number
          last_updated?: string
          last_updated_by?: string
          report_id?: number | null
          status?: string | null
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
      role_permissions: {
        Row: {
          created_at: string
          id: number
          permission: string | null
          user_role: Database["public"]["Enums"]["user_roles"] | null
        }
        Insert: {
          created_at?: string
          id?: number
          permission?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
        }
        Update: {
          created_at?: string
          id?: number
          permission?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
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
          target_type: Database["public"]["Enums"]["target_type"]
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
          target_type: Database["public"]["Enums"]["target_type"]
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
          target_type?: Database["public"]["Enums"]["target_type"]
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
          permission: Database["public"]["Enums"]["user_permissions"]
          task_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          permission: Database["public"]["Enums"]["user_permissions"]
          task_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          permission?: Database["public"]["Enums"]["user_permissions"]
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
          status: Database["public"]["Enums"]["task_status"] | null
        }
        Insert: {
          action_id?: number | null
          company?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          owner?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
        }
        Update: {
          action_id?: number | null
          company?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          owner?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
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
      topic_materiality_assessments: {
        Row: {
          company: string | null
          created_at: string
          id: number
          materiality: Database["public"]["Enums"]["materiality_status"]
          reasoning: string | null
          topic: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: number
          materiality: Database["public"]["Enums"]["materiality_status"]
          reasoning?: string | null
          topic?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: number
          materiality?: Database["public"]["Enums"]["materiality_status"]
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
      User_permissions: {
        Row: {
          created_at: string
          id: number
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_roles"] | null
        }
        Insert: {
          created_at?: string
          id?: number
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_roles"] | null
        }
        Relationships: [
          {
            foreignKeyName: "User_permissions_user_id_fkey"
            columns: ["user_id"]
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
