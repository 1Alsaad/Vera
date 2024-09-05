import { Database } from './supabase';

export interface Target {
  id: number;
  target_name: string;
  company: string;
  topic: string;
  baseline_value: string;
  baseline_year: number;
  current_value: number | null;
  disclosure: number | null;
  datapoint: number;
  target_year: number;
  target_value: string;
  target_type: "Absolute" | "Percentage" | "Intensity"; // Removed | undefined
  created_by: string;
  owner: string;
  justification: string;
  stakeholders_involvement: string;
  is_scientific_based: boolean;
  created_at?: string;
  updated_at?: string;
}

export type Milestone = Database['public']['Tables']['milestones']['Row'] & {
  profiles?: {
    firstname: string | null;
    lastname: string | null;
  } | null;
};