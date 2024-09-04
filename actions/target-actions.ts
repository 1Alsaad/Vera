'use server';

import { ActionState } from "../types/action-types";
import { getDb } from "../db/db";
import { targets } from "../db/schema/targets";

export async function createTarget(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }
    const targetData = {
      target_name: formData.get("target_name") as string,
      topic: formData.get("topic") as string,
      disclosure: formData.get("disclosure") as string,
      datapoint: formData.get("datapoint") as string,
      baseline_year: parseInt(formData.get("baseline_year") as string),
      baseline_value: formData.get("baseline_value") as string,
      target_year: parseInt(formData.get("target_year") as string),
      target_value: formData.get("target_value") as string,
      target_type: formData.get("target_type") as string,
      company: formData.get("company") as string,
      created_by: formData.get("created_by") as string,
      owner: formData.get("owner") as string,
      justification: formData.get("justification") as string,
      stakeholders_involvement: formData.get("stakeholders_involvement") as string,
      is_scientific_based: formData.get("is_scientific_based") === "true",
    };

    const result = await db.insert(targets).values(targetData).returning();

    return {
      success: true,
      message: "Target created successfully",
      data: result[0],
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