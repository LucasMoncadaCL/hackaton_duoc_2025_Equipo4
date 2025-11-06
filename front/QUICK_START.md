# ⚡ QUICK START – CardioSense Frontend

This checklist bootstraps the Next.js UI so it can talk to the ML/LLM services defined in `../ml` and the FastAPI layer (`/predict`, `/coach`).

## 1. Requisitos previos
- Node.js ≥ 20.11 (coincide con la versión mínima de Next 15).
- npm ≥ 10 (alternativas: pnpm, yarn, bun).
- Backend FastAPI en marcha (ver `ml/README.md` y `ml/guia.md`).
- Variables de entorno para API pública y banderas de características.

## 2. Instalación
```bash
cd front
npm install
```

## 3. Variables de entorno
Crear `front/.env.local` (no versionar):
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_FEATURE_FLAGS=baseline
NEXT_PUBLIC_COACH_KB_VERSION=2025-03-01
```

- Usa `http://127.0.0.1:8000` cuando ejecutes el backend local (`uvicorn api_main:app --reload`).
- Para despliegues en Cloudflare Workers define las mismas claves con `wrangler secret put`.

## 4. Ejecutar en desarrollo
```bash
npm run dev
```

- Abre `http://localhost:3000`.
- Si necesitas exponerlo en la red local: `npm run dev -- --hostname 0.0.0.0`.
- Turbopack está habilitado; la consola mostrará cualquier error de TypeScript/Tailwind en caliente.

## 5. Verificar conexión con el backend
1. Confirma que `/predict` responde:
   ```bash
   curl -X POST "$NEXT_PUBLIC_API_BASE_URL/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "age": 45,
       "sex": "female",
       "weight_kg": 68,
       "height_cm": 165,
       "waist_cm": 80,
       "systolic_bp": 118,
       "diastolic_bp": 74,
       "smoker": false,
       "sleep_hours": 7
     }'
   ```
2. Si recibes `{ "score": 0.32 }`, la API está lista para la UI.
3. Para `/coach`, reenvía el `score` y el perfil. Debe devolver `{ plan, sources, disclaimer }` (ver plantillas en `ml/guia.md`).

## 6. Lint y tipos
```bash
npm run lint
```
- Next.js aplica ESLint + TypeScript strict. Corrige advertencias antes de subir cambios.

## 7. Build local y previsualización Cloudflare
```bash
npm run build
npm run preview     # build + worker preview con OpenNext
```
- `npm run preview` compila a `.open-next/` y sirve el worker en `http://localhost:8787` usando Wrangler.

## 8. Despliegue a Cloudflare Workers
```bash
npm run deploy
```
- Asegúrate de haber ejecutado `npm run cf-typegen` cada vez que cambies los bindings en `wrangler.jsonc`.

## 9. Solución de problemas frecuentes
- **CORS bloqueado** → habilita `Access-Control-Allow-Origin` en el backend o usa un proxy function en Cloudflare.
- **Campos incompatibles** → verifica nombres/unidades con `ml/guia.md` (ej. cintura en cm, no pulgadas).
- **Faltan métricas de fairness** → la UI debe mostrar un mensaje informativo, no fallar. Reporta a ML si la API debería entregarlas.
- **Errores de despliegue en Workers** → revisa `wrangler tail` y confirma que `compatibility_date` coincida con `next.config.ts`/OpenNext.

## 10. Próximos pasos sugeridos
- Implementar formulario wizard para capturar los campos mínimos (`age`, `sex`, `weight_kg`, `height_cm`, `waist_cm`).
- Crear capa `src/lib/api.ts` con tipado compartido (`UserProfile`, `PredictResponse`).
- Añadir vista de resultados con paneles: score principal, factores de riesgo destacados, fairness (si aplica), llamado a la acción del coach.
- Integrar panel de recomendaciones (`/coach`) con citas `[archivo.md]` mostrando extractos desde `ml/kb`.
- Documentar cualquier ajuste en `front/RESUMEN_REPOSITORIO.md` para mantener alineados a Cursor/Copilot.

---

**Disclaimer:** Herramienta informativa. No reemplaza diagnóstico médico.

