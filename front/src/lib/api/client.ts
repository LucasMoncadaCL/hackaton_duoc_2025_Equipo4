import { createClient } from "@/lib/supabase/client";
import type { AssessmentData, CoachResponse, MessageRequest, MessageResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_AVAILABLE = process.env.NEXT_PUBLIC_API_AVAILABLE !== "false";

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: { message?: string; detail?: string };
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new APIError(
        errorData.message || errorData.detail || "API request failed",
        response.status,
        errorData
      );
    }

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Network error: Unable to connect to the server");
  }
}

export interface PredictRequest {
  assessment_data: AssessmentData;
  user_id?: string;
}

export interface PredictResponse {
  score: number;
  drivers: Array<{
    feature: string;
    value: number;
    contribution: number;
    description: string;
  }>;
  risk_level: "low" | "moderate" | "high";
}

export interface CoachRequest {
  query: string;
  assessment_data?: AssessmentData;
  risk_score?: number;
  chat_history?: Array<{ role: string; content: string }>;
  user_id?: string;
}

export const healthAPI = {
  async predict(data: AssessmentData): Promise<PredictResponse> {
    if (!API_AVAILABLE) {
      // Mock response for development when API is not available
      return {
        score: 0.45,
        risk_level: "moderate",
        drivers: [
          {
            feature: "waist_cm",
            value: data.waist_cm,
            contribution: 0.15,
            description: "Circunferencia de cintura",
          },
          {
            feature: "age",
            value: data.age,
            contribution: 0.12,
            description: "Edad",
          },
          {
            feature: "sleep_hours",
            value: data.sleep_hours,
            contribution: -0.08,
            description: "Horas de sueño",
          },
          {
            feature: "days_mvpa_week",
            value: data.days_mvpa_week,
            contribution: -0.06,
            description: "Días de actividad física",
          },
          {
            feature: "fruit_veg_portions_day",
            value: data.fruit_veg_portions_day,
            contribution: -0.05,
            description: "Porciones de frutas y verduras",
          },
        ],
      };
    }

    const response = await fetchWithAuth("/api/health/predict", {
      method: "POST",
      body: JSON.stringify({ assessment_data: data }),
    });

    const result = await response.json() as PredictResponse;
    return result;
  },

  async coach(
    query: string,
    context?: {
      assessment_data?: AssessmentData;
      risk_score?: number;
      chat_history?: Array<{ role: string; content: string }>;
    }
  ): Promise<CoachResponse> {
    if (!API_AVAILABLE) {
      // Mock response for development when API is not available
      return {
        message: `Hola, soy tu Coach de Salud CardioSense. Actualmente el backend no está conectado, pero estoy aquí para ayudarte.\n\nTu pregunta: "${query}"\n\nEn una versión completa, te proporcionaría recomendaciones personalizadas basadas en:\n- Tu perfil de riesgo${context?.risk_score ? ` (${Math.round(context.risk_score * 100)}/100)` : ""}\n- Evidencia científica de nuestra base de conocimiento\n- Guías de salud cardiovascular validadas\n\nPara obtener recomendaciones reales, asegúrate de que el backend FastAPI esté ejecutándose en ${API_BASE_URL}`,
        citations: [
          {
            source: "Sistema de demostración",
            text: "Este es un mensaje de demostración. Conecta el backend para obtener recomendaciones reales.",
          },
        ],
      };
    }

    const response = await fetchWithAuth("/api/health/coach", {
      method: "POST",
      body: JSON.stringify({
        query,
        ...context,
      }),
    });

    const result = await response.json() as CoachResponse;
    return result;
  },

  async generatePDF(assessmentId: string): Promise<Blob> {
    if (!API_AVAILABLE) {
      throw new APIError("La generación de PDF requiere conexión con el backend");
    }

    const response = await fetchWithAuth(
      `/api/health/generate-pdf/${assessmentId}`,
      {
        method: "POST",
      }
    );

    const blob = await response.blob();
    return blob;
  },

  async message(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
    sessionData?: Partial<AssessmentData>
  ): Promise<MessageResponse> {
    if (!API_AVAILABLE) {
      // Mock response for development when API is not available
      return {
        reply: `Gracias por tu mensaje: "${message}"\n\nEn una versión completa con el backend conectado, el sistema extraería automáticamente tus datos de salud y los validaría.\n\nPara obtener el sistema completo, asegúrate de que el backend FastAPI esté ejecutándose en ${API_BASE_URL}`,
        extracted_data: {},
        is_ready: false,
        action: "continue",
      };
    }

    const requestBody: MessageRequest = {
      message,
      conversation_history: conversationHistory,
      session_data: sessionData,
    };

    const response = await fetchWithAuth("/api/health/message", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const result = await response.json() as MessageResponse;
    return result;
  },
};

export default healthAPI;

