export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  sex?: "F" | "M";
  created_at: string;
  updated_at: string;
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  age?: number;
  sex?: "F" | "M";
}

