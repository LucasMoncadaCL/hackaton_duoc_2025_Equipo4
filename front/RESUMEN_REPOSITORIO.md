# 📋 Resumen del Frontend – CardioSense

## ✅ Estado actual
- Skeleton de ruta pública (`/`) y login (`/login`) listo.
- Dashboards protegidos `/app` (usuario) y `/admin` (solo rol admin) con placeholders.
- Tailwind CSS v4 configurado en `globals.css` con tokens `--color-background/foreground` y fuentes Geist.
- Configuración de despliegue a Cloudflare Workers preparada (`wrangler.jsonc`, `open-next.config.ts`).
- Supabase conectado mínimamente para auth; faltan credenciales reales.

## 📁 Archivos esenciales
- `src/app/layout.tsx` – Shell global; aquí viven `<html>`, `<body>`, fuentes y providers.
- `src/app/page.tsx` – Landing informativo con CTA a `/login` y `/app`.
- `src/app/(public)/login/page.tsx` – Formulario básico que consume `/api/auth/login`.
- `src/app/(app)/app/page.tsx` – Dashboard protegido (usuario autenticado).
- `src/app/(app)/admin/page.tsx` – Panel administrador (requiere metadata `role=admin`).
- `src/app/api/auth/login/route.ts` – Maneja sign-in con Supabase y setea cookies.
- `src/app/api/auth/logout/route.ts` – Limpia cookies y redirige a `/login`.
- `src/lib/auth.ts` y `src/lib/supabaseClient.ts` – Utilidades compartidas para sesión y clientes Supabase.
- `src/middleware.ts` – Guardrails de rutas `/app` y `/admin`.
- `package.json` – Scripts (`dev`, `preview`, `deploy`) y dependencias (Next 15, React 19, Supabase, OpenNext Cloudflare).
- `cloudflare-env.d.ts` – Tipos para bindings/secrets; ejecutar `npm run cf-typegen` tras cambios en Wrangler.
- Documentación de referencia: `README.md`, `QUICK_START.md`, `guia.md` (esta última con reglas de UI).

## 🔗 Integración con ML/Backend (`../ml`)
- Consumir el endpoint `/predict` para obtener el `score` (riesgo cardiometabólico), `risk_bucket` y métricas de calibración. Contrato base descrito en `ml/guia.md`.
- Consumir `/coach` para generar planes personalizados con RAG; citar fuentes `[archivo.md]` obtenidas de `ml/kb`.
- Mantener unidades idénticas a NHANES: edad en años, peso en kg, estatura en cm, cintura en cm, presión en mmHg.
- Mostrar disclaimers y fairness outcomes definidos por el equipo ML (ej. AUROC objetivo ≥ 0.80, brier ≤ 0.12, deltas por subgrupo si están disponibles).
- Almacenar tokens Supabase en cookies `sb-access-token` y `sb-refresh-token` (ya configurado). No exponer service key en cliente.

## 🔐 Autenticación y guardrails
- Middleware protege `/app` y `/admin`. Usuarios sin sesión → `/login`.
- `requireUser` y `requireAdmin` disponibles para componentes/acciones server.
- El rol se lee desde `user_metadata.role`. Si no es `admin`, la ruta `/admin` redirige a `/app`.
- Formularios de login/logout usan rutas API (`/api/auth/login`, `/api/auth/logout`).
- Supabase necesita `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Ver `.env.local.example`.

- [ ] Formulario wizard o multi-step que valide entradas críticas (edad 18–85, cintura 40–200 cm, etc.).
- [ ] Capa de cliente API tipada (`src/lib/api.ts`) con manejo de errores y reintentos.
- [ ] Vista de resultados con score, categoría de riesgo, explicación de factores, métricas de fairness, y CTA hacia el coach.
- [ ] Panel de coaching que consume `/coach`, presenta plan de 2 semanas y lista las fuentes (RAG) con citas visibles.
- [ ] Disclaimers persistentes: banner superior + aviso en secciones de resultados/coaching.
- [ ] Persistencia local de la última evaluación para reutilizar datos en nuevas sesiones (sin almacenar en servidor).
- [ ] Sincronización de roles desde Supabase (UI para promover/degradar usuarios).

## 🧭 Backlog sugerido
1. **Baseline UI** – Sustituir `page.tsx` por layout con hero, formulario inicial y rutas internas (`/coach`).
2. **Validaciones y normalización** – Mapear inputs a schema `UserProfile` compartido con FastAPI.
3. **Feedback de estado** – Spinners/skeletons para llamadas a `/predict` y `/coach`; manejo de errores con mensajes claros.
4. **Charts ligeros** – Visualizar score (gauge/barra) y fairness (tabla comparativa simple). Considerar librerías livianas o componentes propios.
5. **Internacionalización** – Preparar strings en español (primario) con opción para inglés si el tiempo lo permite.
6. **Accesibilidad** – Cumplir WCAG AA: contraste, navegación por teclado, `aria-live` para resultados.
7. **Administración** – Dashboard para ver sesiones activas y cargar KB.

## 🤖 Notas para agentes (Cursor/Copilot)
- Revisa `ml/RESUMEN_REPOSITORIO.md` y `ml/guia.md` antes de modificar contratos de datos.
- Documenta cambios relevantes de APIs o UX en este archivo para mantener sincronía entre equipos.
- Evita dependencias pesadas; prioriza componentes accesibles con Tailwind.
- No exponer llaves en cliente; usa `NEXT_PUBLIC_*` solo para URLs/flags no sensibles.
- Mantén la estructura App Router (rutas en `src/app`, componentes compartidos bajo `src/components`).

---

**Última actualización:** Noviembre 2025

