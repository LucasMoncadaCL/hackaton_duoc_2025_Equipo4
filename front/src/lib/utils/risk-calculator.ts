export type RiskLevel = "low" | "moderate" | "high";

export function getRiskLevel(score: number): RiskLevel {
  if (score < 0.3) return "low";
  if (score < 0.6) return "moderate";
  return "high";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "text-green-600";
    case "moderate":
      return "text-yellow-600";
    case "high":
      return "text-red-600";
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "bg-green-50 border-green-200";
    case "moderate":
      return "bg-yellow-50 border-yellow-200";
    case "high":
      return "bg-red-50 border-red-200";
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Riesgo Bajo";
    case "moderate":
      return "Riesgo Moderado";
    case "high":
      return "Riesgo Alto";
  }
}

export function getRiskDescription(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Tu perfil indica un riesgo bajo de eventos cardiometabólicos. Continúa con tus hábitos saludables.";
    case "moderate":
      return "Tu perfil indica un riesgo moderado. Considera realizar cambios en tu estilo de vida para reducir el riesgo.";
    case "high":
      return "Tu perfil indica un riesgo alto. Te recomendamos consultar con un profesional de la salud y realizar cambios significativos en tu estilo de vida.";
  }
}

export function shouldRecommendDoctor(score: number): boolean {
  return score >= 0.6;
}

