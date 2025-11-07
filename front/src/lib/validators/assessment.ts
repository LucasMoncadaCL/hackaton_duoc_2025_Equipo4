import { z } from "zod";

export const assessmentSchema = z.object({
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(85, "Age must be at most 85"),
  sex: z.enum(["F", "M"], {
    errorMap: () => ({ message: "Sex must be F or M" }),
  }),
  height_cm: z
    .number()
    .min(120, "Height must be at least 120 cm")
    .max(220, "Height must be at most 220 cm"),
  weight_kg: z
    .number()
    .min(30, "Weight must be at least 30 kg")
    .max(220, "Weight must be at most 220 kg"),
  waist_cm: z
    .number()
    .min(40, "Waist circumference must be at least 40 cm")
    .max(170, "Waist circumference must be at most 170 cm"),
  sleep_hours: z
    .number()
    .min(3, "Sleep hours must be at least 3")
    .max(14, "Sleep hours must be at most 14"),
  smokes_cig_day: z
    .number()
    .min(0, "Cigarettes per day cannot be negative")
    .max(60, "Cigarettes per day must be at most 60"),
  days_mvpa_week: z
    .number()
    .min(0, "Days of physical activity cannot be negative")
    .max(7, "Days of physical activity must be at most 7"),
  fruit_veg_portions_day: z
    .number()
    .min(0, "Fruit and vegetable portions cannot be negative")
    .max(12, "Fruit and vegetable portions must be at most 12"),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

export const assessmentStepSchemas = {
  anthropometry: z.object({
    height_cm: assessmentSchema.shape.height_cm,
    weight_kg: assessmentSchema.shape.weight_kg,
    waist_cm: assessmentSchema.shape.waist_cm,
  }),
  lifestyle: z.object({
    sleep_hours: assessmentSchema.shape.sleep_hours,
    smokes_cig_day: assessmentSchema.shape.smokes_cig_day,
    days_mvpa_week: assessmentSchema.shape.days_mvpa_week,
  }),
  diet: z.object({
    fruit_veg_portions_day: assessmentSchema.shape.fruit_veg_portions_day,
  }),
};

