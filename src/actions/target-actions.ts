'use server';

import { ActionState } from "@/types/action-types";
import { getDb } from "@/db";
import { targets } from "@/schema/targets";
import { Target } from "@/types";

// Use the imported Target type instead of defining a new interface
type TargetInput = Omit<Target, 'id' | 'created_at' | 'updated_at'>;

export async function createTarget(formData: FormData): Promise<ActionState> {
  try {
    const db = await getDb();
    const targetData: TargetInput = {
      target_name: formData.get("target_name") as string,
      topic: formData.get("topic") as string,
      disclosure: formData.get("disclosure") ? parseFloat(formData.get("disclosure") as string) : null,
      datapoint: parseFloat(formData.get("datapoint") as string),
      baseline_year: parseInt(formData.get("baseline_year") as string, 10),
      baseline_value: formData.get("baseline_value") as string,
      target_year: parseInt(formData.get("target_year") as string, 10),
      target_value: formData.get("target_value") as string,
      target_type: formData.get("target_type") as "Absolute" | "Percentage" | "Intensity",
      company: formData.get("company") as string,
      created_by: formData.get("created_by") as string,
      owner: formData.get("owner") as string,
      justification: formData.get("justification") as string,
      stakeholders_involvement: formData.get("stakeholders_involvement") as string,
      is_scientific_based: formData.get("is_scientific_based") === "true",
      current_value: formData.get("current_value") ? parseFloat(formData.get("current_value") as string) : null,
    };

    // Ensure all required fields are provided
    const requiredFields: (keyof TargetInput)[] = ['target_name', 'topic', 'baseline_year', 'baseline_value', 'target_year', 'target_value', 'company', 'datapoint', 'target_type'];
    for (const field of requiredFields) {
      if (targetData[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const { data, error } = await db.from(targets).insert(targetData).select().single();

    if (error) throw error;

    return {
      success: true,
      message: "Target created successfully",
      data: data,
    };
  } catch (error) {
    console.error("Error creating target:", error);
    return {
      success: false,
      message: "Failed to create target",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}