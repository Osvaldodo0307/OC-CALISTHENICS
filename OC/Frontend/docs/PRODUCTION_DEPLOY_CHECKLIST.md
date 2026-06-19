# Checklist de despliegue a producción — OC Club

Documento para push/deploy controlado del panel administrativo, membresías y funciones comerciales recientes.

**Última revisión:** junio 2026 · Fases 2A–2B.1 + modo demo local.

---

## 1. Pre-requisitos

- [ ] Cambios commiteados en la rama de producción (p. ej. `main`).
- [ ] Backend tests en verde (ver sección 4).
- [ ] Frontend `npm run build` sin errores (ver sección 4).
- [ ] Respaldo de base de datos programado **antes** de migraciones.
- [ ] Ventana de prueba con usuario admin real (no usar modo demo).

---

## 2. Variables de entorno

### Frontend (Netlify)

| Variable | Producción | Obligatoria | Notas |
|----------|------------|-------------|-------|
| `VITE_API_URL` | `https://oc-calisthenics.onrender.com` | Sí | URL HTTPS del backend Render, sin `/` final |
| `VITE_ENABLE_ADMIN_DEMO` | **No definir** o `false` | No | **NUNCA `true` en Netlify Production** |
| `VITE_APP_MODE` | `web` (default) | No | `app` solo para build móvil |
| `VITE_APP_VERSION` | ej. `1.0.0` | No | Etiqueta visible opcional |
| `VITE_GA_MEASUREMENT_ID` | ID GA4 | No | Ver `docs/ANALYTICS_SETUP.md` |
| `VITE_META_PIXEL_ID` | ID Meta Pixel | No | Opcional |

**URLs de referencia:**

- Frontend: `https://oc-club.netlify.app`
- Backend: `https://oc-calisthenics.onrender.com`

**Archivos de referencia:**

- `OC/Frontend/.env.example`
- `OC/Frontend/.env.production` (solo `VITE_API_URL`; no commitear secretos)

**Netlify — pasos:**

1. Site settings → Environment variables → Production.
2. Confirmar `VITE_API_URL`.
3. Confirmar que **no existe** `VITE_ENABLE_ADMIN_DEMO=true`.
4. Deploy → **Clear cache and deploy site** tras cambiar `VITE_*`.

### Backend (Render)

| Variable | Producción | Obligatoria | Notas |
|----------|------------|-------------|-------|
| `DATABASE_URL` | Connection string Supabase/Postgres | Sí | `postgresql://...` (Render convierte `postgres://` automáticamente) |
| `JWT_SECRET` | Generado por Render | Sí | No usar valor por defecto de desarrollo |
| `JWT_ALGORITHM` | `HS256` | Sí | |
| `JWT_EXPIRES_MINUTES` | `1440` | No | 24 h por defecto |
| `ALLOWED_ORIGINS` | `https://oc-club.netlify.app` | Sí | Varias URLs separadas por coma si hay previews |
| `APP_TIMEZONE` | `America/Mexico_City` | Recomendado | Fecha operativa del gimnasio |
| `MEMBERSHIP_EXPIRING_SOON_DAYS` | `3` | No | Umbral «por vencer» |
| `RENDER_EXTERNAL_URL` | Auto en Render | No | Keep-alive interno |
| `KEEP_ALIVE_INTERVAL` | `600` | No | Segundos entre pings |
| `OPENAI_API_KEY` | — | No | Solo rutinas IA; no afecta panel membresías |

**Alternativa MySQL (si aplica en otro entorno):** `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

**Archivos de referencia:**

- `OC/BACKEND/deploy/.env.production.example`
- `OC/BACKEND/render.yaml`

---

## 3. Modo demo — verificación de seguridad

| Verificación | Estado esperado |
|--------------|-----------------|
| `.env.example` documenta `VITE_ENABLE_ADMIN_DEMO=false` | Sí |
| Valor por defecto sin variable | Demo **desactivado** (`isAdminDemoMode()` → false) |
| Botón «Entrar como admin demo» | Solo si `VITE_ENABLE_ADMIN_DEMO=true` en build |
| Netlify Production | **No** configurar la variable demo |
| Datos mock en producción | Inactivos; código mock puede estar en bundle pero no se ejecuta |
| Login real | Sigue requiriendo `/auth/login` contra backend |

Ver también: `docs/ADMIN_DEMO_MODE.md`

---

## 4. Validación antes de push

### Backend

```bash
cd OC/BACKEND
py -m pytest tests/ -q
```

**Resultado esperado:** todos los tests pasan (35+ en suite actual).

### Frontend

```bash
cd OC/Frontend
npm ci
npm run build
```

**Resultado esperado:** `tsc` + `vite build` sin errores; carpeta `dist/` generada.

---

## 5. Migraciones de base de datos (PostgreSQL / Supabase)

**Producción usa PostgreSQL/Supabase.** No ejecutar los scripts MySQL de `OC/BACKEND/migrations/*.sql` en Supabase.

**No depender de `create_all`** al arrancar Render para columnas nuevas en tablas existentes. Usar las migraciones PostgreSQL dedicadas.

Guía detallada: `OC/BACKEND/docs/SUPABASE_MEMBERSHIP_MIGRATIONS.md`

### Orden de ejecución (Supabase SQL Editor)

| Paso | Archivo |
|------|---------|
| 1 | `OC/BACKEND/migrations/postgres/2026-06-17_membership_payment_renewal.postgres.sql` |
| 2 | `OC/BACKEND/migrations/postgres/2026-06-18_membership_followups.postgres.sql` |
| 3 | `OC/BACKEND/migrations/postgres/verify_membership_schema.postgres.sql` |

Ejecutar **antes** de operar el panel admin con datos reales y **después** del respaldo de BD.

### Respaldo previo (obligatorio recomendado)

- Snapshot Supabase o `pg_dump` de tablas `membership_payments`, `membership_cycles` y relacionadas.
- **No registrar pagos reales** hasta que la verificación pase.

### Paso 1 — Columnas en `membership_payments`

Agrega (idempotente): `payment_action`, `period_start_date`, `period_end_date`, `counts_as_income`, `applies_to_balance`, `previous_end_date`, `extended_end_date`.

### Paso 2 — Tablas de seguimiento

Crea (idempotente): `membership_followups`, `membership_followup_audits` + índices + foreign keys.

### Paso 3 — Verificación

El script `verify_membership_schema.postgres.sql` debe reportar:

- `payments_columns_ok = true` (7 columnas)
- `followup_tables_ok = true` (2 tablas)

### MySQL (solo si el entorno NO es Supabase)

| Orden | Archivo MySQL |
|-------|----------------|
| 1 | `OC/BACKEND/migrations/2026-06-17_membership_payment_renewal.sql` |
| 2 | `OC/BACKEND/migrations/2026-06-18_membership_followups.sql` |

### Si una migración falla

1. **No registrar pagos reales** hasta resolver.
2. Anotar error exacto del SQL Editor.
3. Si «already exists» → ejecutar solo verificación; puede estar ya aplicada.
4. Restaurar respaldo si hay corrupción o dudas.
5. Tras esquema OK → login admin → smoke test `/membership/admin/clients` y `/membership/admin/followups`.

### Post-migración obligatorio

- [ ] Verificación SQL (paso 3) en verde
- [ ] Deploy backend + frontend
- [ ] Login admin real (sin modo demo)
- [ ] Smoke test membresías, recordatorios y expediente (sección 10)

---

## 6. CORS y comunicación API

### Configuración requerida

En Render, `ALLOWED_ORIGINS` debe incluir el origen exacto del frontend:

```
ALLOWED_ORIGINS=https://oc-club.netlify.app
```

Para deploy previews de Netlify (opcional):

```
ALLOWED_ORIGINS=https://oc-club.netlify.app,https://deploy-preview-xxx--oc-club.netlify.app
```

### Errores comunes

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| CORS blocked en consola | `ALLOWED_ORIGINS` no incluye el dominio Netlify | Actualizar variable en Render y redeploy backend |
| `Network Error` / timeout | Backend dormido (plan free) | Esperar ~30–60 s o ping a `/health/db` |
| 401 en todas las rutas admin | Token expirado o `JWT_SECRET` cambió | Cerrar sesión y volver a login |
| 404 en rutas `/membership/admin/...` | Backend viejo sin deploy | Push + redeploy Render |
| 500 en membresías | Columnas/tablas faltantes | Ejecutar migraciones / verificar esquema |

### Smoke test API

```bash
curl https://oc-calisthenics.onrender.com/health/db
curl -I https://oc-club.netlify.app
```

---

## 7. Rutas críticas (compilación y navegación)

Confirmadas en `OC/Frontend/src/App.tsx`:

### Públicas

| Ruta | Componente |
|------|------------|
| `/` | Landing |
| `/membresias` | Membresias |
| `/tienda` | StoreHome |
| `/aviso-privacidad` | AvisoPrivacidad |
| `/terminos` | Terminos |

### Admin (requieren login + rol `admin`)

| Ruta | Componente |
|------|------------|
| `/app/login` | Login |
| `/app/admin/membresias` | MembresiasControl |
| `/app/admin/recordatorios` | Recordatorios |
| `/app/admin/socios/:id` | SocioExpediente |

Las vistas admin muestran estados de carga, vacío y error vía `toUserMessage` / mensajes en UI cuando el API falla.

---

## 8. Seguridad básica (revisión)

| Control | Estado |
|---------|--------|
| Rutas admin con `ProtectedRoute requiredRole="admin"` | Implementado |
| Nav admin solo si `user.role === 'admin'` en AppShell | Implementado |
| Datos de socios en rutas públicas | No expuestos |
| Tokens/credenciales hardcodeadas en frontend | No detectadas |
| Modo demo detrás de `VITE_ENABLE_ADMIN_DEMO === 'true'` | Sí |
| JWT en producción | Debe venir de `JWT_SECRET` en Render (no default) |

**Nota:** `app/main.py` crea usuario seed `octavio` solo si no existe — verificar que no quede contraseña débil en producción (cambiar tras primer deploy si aplica).

---

## 9. Pasos para push y deploy

### A) Git push

```bash
git status
git add ...
git commit -m "Descripción del release"
git push origin main
```

### B) Backend (Render)

- Conectar repo; Root Directory: `OC/BACKEND`
- Auto-deploy en push a `main` (si está configurado)
- Verificar logs: `[DB] Tablas creadas/verificadas.`
- Confirmar variables de entorno (sección 2)

### C) Frontend (Netlify)

- Base directory: `OC/Frontend` (o usar `netlify.toml` en raíz del monorepo)
- Build: `npm run build` · Publish: `dist`
- Variables: `VITE_API_URL` (sin demo)
- Clear cache and deploy tras cambios

### D) Post-deploy inmediato

1. `GET /health/db` → OK
2. Login admin real en `/app/login`
3. Abrir `/app/admin/membresias` → datos reales cargan
4. Si error 500 en membresías → revisar migraciones (sección 5)

---

## 10. Pruebas después del deploy

### A) Login admin

- [ ] Entrar con usuario admin real (no demo).
- [ ] Confirmar redirección al panel.
- [ ] No debe aparecer botón «Entrar como admin demo».
- [ ] No debe aparecer banner amarillo de modo demo.

### B) Membresías (`/app/admin/membresias`)

- [ ] Tabla de socios carga.
- [ ] Filtros por estado funcionan.
- [ ] Resumen y alertas cargan.
- [ ] Abrir panel rápido de un socio.
- [ ] **Opcional:** registrar pago pequeño de prueba en socio de prueba.

### C) Recordatorios (`/app/admin/recordatorios`)

- [ ] Bandeja y resumen diario cargan.
- [ ] Filtrar vencidos / adeudo.
- [ ] Crear seguimiento y cambiar estado.
- [ ] WhatsApp manual abre (si hay teléfono); no envía automático.

### D) Expediente (`/app/admin/socios/:id`)

- [ ] Abrir desde Membresías → «Ver socio».
- [ ] Abrir desde Recordatorios → «Ver socio».
- [ ] Tabs: Resumen, Pagos, Ciclos, Adeudos, Seguimientos, Notas.
- [ ] Pagos revertidos visibles como REVERTIDO.
- [ ] Reversa LIFO: solo el pago más reciente reversible.

### E) Formulario público

- [ ] Enviar lead de prueba desde landing (`/#solicitud`).
- [ ] Confirmar envío en Netlify → Forms → `oc-lead-capture`.

### F) Rutas legales

- [ ] `/aviso-privacidad` renderiza correctamente.
- [ ] `/terminos` renderiza correctamente.

---

## 11. Plan de rollback

### Frontend (Netlify)

1. Netlify → Deploys → seleccionar deploy anterior estable → **Publish deploy**.
2. O revertir commit en git y push.

### Backend (Render)

1. Render → Manual Deploy → deploy anterior o revertir commit.
2. Si el problema es solo variables de entorno, restaurar valores previos.

### Base de datos

1. **Detener uso del panel admin** (no registrar pagos ni reversas).
2. Restaurar snapshot / `pg_dump` / `mysqldump` según motor.
3. No intentar «deshacer» columnas en caliente sin respaldo.

### Git

```bash
git revert <commit-hash>
git push origin main
```

### Criterio de pausa operativa

No operar pagos reales hasta que:

- `/membership/admin/clients` responda 200 para admin autenticado.
- Migraciones verificadas.
- Al menos un flujo de pago de prueba completado en socio de prueba.

---

## 12. Riesgos detectados en esta revisión

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Scripts SQL en `migrations/` son sintaxis **MySQL** | Alta | Usar `migrations/postgres/*.postgres.sql` en Supabase (ver `SUPABASE_MEMBERSHIP_MIGRATIONS.md`) |
| Depender de `create_all` para columnas de pagos | Alta | Ejecutar migración PostgreSQL paso 1 antes de operar panel |
| `VITE_ENABLE_ADMIN_DEMO=true` accidental en Netlify | Alta | No configurar; checklist sección 3 |
| Render free tier — cold start | Baja | Esperar o keep-alive configurado |
| Código mock incluido en bundle frontend | Baja | Inactivo sin flag; no expone datos reales |
| Usuario seed `octavio` en `main.py` | Media | Cambiar contraseña en producción si se creó automáticamente |

---

## 13. Documentación relacionada

- `docs/ADMIN_DEMO_MODE.md` — modo demo local
- `docs/DEPLOY_COMMERCIAL_CHECKLIST.md` — landing, forms, analítica
- `OC/BACKEND/docs/SUPABASE_MEMBERSHIP_MIGRATIONS.md` — migraciones PostgreSQL/Supabase
- `OC/BACKEND/docs/MEMBERSHIP_PAYMENTS_OPERATIONS.md` — operación del panel
- `OC/BACKEND/INSTRUCCIONES_GITHUB_RENDER.md` — CORS Netlify + Render

---

## 14. Registro de validación (rellenar al desplegar)

| Fecha | Responsable | Backend tests | Frontend build | Migraciones OK | Deploy OK | Notas |
|-------|-------------|---------------|----------------|----------------|-----------|-------|
| | | | | | | |
