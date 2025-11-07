export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface Citation {
  source: string;
  text: string;
  url?: string;
}

export interface CoachResponse {
  message: string;
  citations: Citation[];
  recommendations?: Recommendation[];
}

export interface Recommendation {
  category: "nutrition" | "exercise" | "sleep" | "lifestyle";
  title: string;
  description: string;
  goal: string;
  timeframe: string;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  assessment_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  goals: PlanGoal[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface PlanGoal {
  id: string;
  category: "nutrition" | "exercise" | "sleep" | "lifestyle";
  title: string;
  description: string;
  target: string;
  frequency: string;
  completed_days: number[];
  total_days: number;
  is_completed: boolean;
}

export interface ChatSession {
  id: string;
  user_id: string;
  assessment_id?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

