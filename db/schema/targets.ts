import { integer, pgTable, text, boolean, uuid } from "drizzle-orm/pg-core";

export const targets = pgTable("targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  target_name: text("target_name").notNull(),
  topic: uuid("topic").notNull(),
  disclosure: uuid("disclosure"),
  datapoint: uuid("datapoint").notNull(),
  baseline_year: integer("baseline_year").notNull(),
  baseline_value: text("baseline_value").notNull(),
  target_year: integer("target_year").notNull(),
  target_value: text("target_value").notNull(),
  target_type: text("target_type").notNull(),
  company: uuid("company").notNull(),
  created_by: uuid("created_by").notNull(),
  owner: uuid("owner").notNull(),
  justification: text("justification").notNull(),
  stakeholders_involvement: text("stakeholders_involvement").notNull(),
  is_scientific_based: boolean("is_scientific_based").notNull(),
});