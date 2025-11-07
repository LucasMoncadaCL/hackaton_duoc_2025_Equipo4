export interface AssessmentData {
  age: number;
  sex: "F" | "M";
  height_cm: number;
  weight_kg: number;
  waist_cm: number;
  sleep_hours: number;
  smokes_cig_day: number;
  days_mvpa_week: number;
  fruit_veg_portions_day: number;
}

export interface Driver {
  feature: string;
  value: number;
  contribution: number;
  description: string;
}

export interface RiskResult {
  score: number;
  risk_level: "low" | "moderate" | "high";
  drivers: Driver[];
  assessment_id?: string;
  created_at?: string;
}

export interface AssessmentHistory {
  id: string;
  user_id: string;
  assessment_data: AssessmentData;
  risk_score: number;
  risk_level: string;
  drivers: Driver[];
  created_at: string;
  share_token?: string;
}

export interface SavedAssessment extends RiskResult {
  id: string;
  user_id: string;
  assessment_data: AssessmentData;
  share_token?: string;
}

