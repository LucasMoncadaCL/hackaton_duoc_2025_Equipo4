# 🚨 GUÍA RÁPIDA – FRONTEND CARDIOSENSE

Guía operativa para quienes construyen/fluyen la UI usando Cursor/Copilot. Mantiene consistencia con las reglas de datos y LLM definidas en `ml/`.

---

## 🎯 Flujo principal (3 vistas)
1. **Intake** – formulario multi-step (datos personales → hábitos → revisión). Validar en vivo, mostrar unidades y tooltips.
2. **Resultado** – panel con score (0–1), categoría (`bajo`, `moderado`, `alto`), factores destacados y fairness (si llega desde backend).
3. **Coach** – recomendaciones de 2 semanas, citas `[archivo.md]`, botones para marcar progreso y CTA a profesionales.

Mantener transiciones suaves (React state o server actions). Guardar borradores en `localStorage` con llave `cardiosense:last-profile`.

---

## 🔐 Autenticación y roles
- Middleware (`src/middleware.ts`) protege `/app` y `/admin`.
- Login reside en `/login` y envía POST a `/api/auth/login`.
- Logout disponible en `/api/auth/logout`; los formularios POST ya están cableados en los dashboards.
- Tokens Supabase se guardan en cookies `sb-access-token` y `sb-refresh-token` (httpOnly, Lax, 7 días).
- Roles provienen de `user_metadata.role`. Si falta, tratar como `user`.
- `requireUser()` y `requireAdmin()` están en `src/lib/auth.ts`. Úsalos en Server Components o rutas para asegurar el guardado sin duplicar lógica.
- Nunca exportes `SUPABASE_SERVICE_ROLE_KEY` al cliente; solo usar en server helpers.

---

## 📦 Contratos de datos (TypeScript)
Usar un módulo compartido `src/types/api.ts` (crear al implementar) con estos esquemas:

```ts
export interface UserProfile {
  age: number;              // years, 18–85
  sex: "male" | "female";
  weight_kg: number;        // kg, 30–250
  height_cm: number;        // cm, 120–220
  waist_cm: number;         // cm, 40–200
  systolic_bp?: number;     // mmHg
  diastolic_bp?: number;    // mmHg
  smoker?: boolean;
  sleep_hours?: number;     // horas promedio
  activity_level?: "low" | "moderate" | "high";
}

export interface PredictResponse {
  score: number;            // 0–1
  risk_bucket: "low" | "moderate" | "high";
  calibration?: {
    auroc?: number;
    brier?: number;
  };
  top_factors?: Array<{ feature: string; contribution: number }>;
  fairness?: Array<{ subgroup: string; delta: number }>;
  disclaimer: string;
}

export interface CoachResponse {
  plan: Array<{
    day: string;
    focus: string;
    actions: string[];
  }>;
  summary: string;
  sources: string[];        // Ej: ["kb/actividad_fisica.md"]
  disclaimer: string;
}
```

Adapta según la API real, pero documenta cualquier cambio en `RESUMEN_REPOSITORIO.md`.

---

## 🧪 Validaciones críticas
- Edad: 18–85 (`ml/guia.md` usa población adulta).
- Sexo: mapear 1/2 de NHANES a `male`/`female` en el backend; la UI solo muestra opciones accesibles.
- Peso/Estatura/Cintura: números positivos, permitir 1 decimal, convertir automáticamente si el usuario ingresa coma decimal.
- Presión arterial: 80–220 mmHg (sistólica) / 40–120 mmHg (diastólica).
- Horas de sueño: 3–14.
- Mostrar mensajes inline con ejemplos (“Ej: 170 cm”). No bloquear envío si campos opcionales faltan.

---

## 🌐 API Client Rules
- Implementar `src/lib/api.ts` con `fetch` nativo; añadir timeout (8 s) y reintento ligero (máx. 1 vez) para `/coach`.
- Adjuntar cabeceras `Content-Type: application/json` y `X-App-Version` (usar `process.env.NEXT_PUBLIC_FEATURE_FLAGS`).
- Centralizar manejo de errores en un `ApiError` personalizado para mostrar banners amigables.
- Registrar eventos relevantes (p. ej. `predict_success`, `coach_failure`) en `console.info` por ahora; listo para integrarse con analítica.
- Reutiliza cookies Supabase existentes; evita crear tokens paralelos.

---

## 🖥️ Diseño y UX
- Usar Tailwind tokens (`bg-background`, `text-foreground`, `font-sans`).
- Componentes core:
  - `<Card>` para agrupar secciones.
  - `<MetricBadge>` para score/fairness.
  - `<SourceList>` para mostrar citas con vínculo al archivo KB.
- Paleta: derivar de `globals.css`. Agregar variables nuevas en `:root` antes de usarlas.
- Layout responsive: mobile-first, breakpoints `sm`, `md`, `lg`.
- Mantener disclaimers visibles en la parte inferior y en la sección coach.
- Agregar modos de carga (skeleton/loader) para cada panel.

---

## ⚠️ Errores y estados vacíos
- **Fallo en `/predict`** → Mostrar banner rojo con mensaje “No pudimos calcular el riesgo. Intenta nuevamente o contacta soporte.”
- **Fallo en `/coach`** → Mostrar plan fallback (“Consulta con un profesional…”) y loguear error.
- **Sin fairness** → Mostrar texto neutro (“Aún no hay métricas de equidad para este modelo.”).
- **Score extremo** → Añadir badges especiales (`score > 0.75` → “Requiere seguimiento clínico”).

---

## 🤝 Interacción con ML/LLM
- Alinear nombres de features con los scripts en `ml/` (ej. `waist_cm` ↔ `BMXWAIST`).
- Propagar disclaimers del backend o, si faltan, usar el texto base del README.
- Si el backend devuelve `sources`, renderizar enlaces descargables (`/api/download?file=...` futura mejora) o al menos nombre del archivo.
- Integrar guardrails del coach: truncar `plan` a 7–10 acciones por día, advertir si el texto supera 1 000 caracteres.

---

## 🧩 Organización de código sugerida
- `src/app/(marketing)/page.tsx` – landing inicial con explicación del sistema.
- `src/app/(app)/predict/page.tsx` – formulario + resultado (ruta protegida tras disclaimer).
- `src/app/(app)/coach/page.tsx` – panel de coaching usando query params (`?session=<id>`).
- `src/components/` – UI reusable (`FormStepper`, `ResultCard`, `CoachTimeline`).
- `src/lib/` – API client, validadores (`zod` si se añade), utilidades de formato.
- `src/hooks/` – Hooks personalizados (`usePredict`, `useCoach`).

---

## 🚫 Antipatrones a evitar
- Usar librerías pesadas para charting (Chart.js) sin analizar impacto; preferir SVG simple.
- Guardar datos sensibles más allá de la sesión; nunca enviar a servicios de terceros.
- Modificar contratos de API sin coordinar con ML / actualizar documentación.
- Quitar el disclaimer médico.
- Bypassear middleware con fetchs directos; si necesitas rutas públicas, documenta excepción.

---

**Última actualización:** Noviembre 2025

