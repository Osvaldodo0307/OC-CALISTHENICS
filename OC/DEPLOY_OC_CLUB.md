# Despliegue OC Club: GitHub + Netlify + Render

Referencia unificada para el dominio del frontend **`https://oc-club.netlify.app`** y el backend en Render.

## Resumen

| Pieza | Donde vive en el repo | Que enlazas |
|--------|------------------------|-------------|
| Frontend | `OC/Frontend` | Netlify (desde la **raiz** del repo) |
| Backend | `OC/BACKEND` | Render (Root Directory `OC/BACKEND`) |

## 1. Netlify (dejar Netlify Drop y usar Git)

1. En [Netlify](https://app.netlify.com), entra al sitio **oc-club** (o crea uno nuevo).
2. **Site configuration** → **Build & deploy** → **Continuous deployment** → **Link repository**.
3. Autoriza GitHub y elige el repo (por ejemplo `OC-CALISTHENICS`).
4. Netlify detectara el `netlify.toml` en la **raiz del repositorio** (archivo `netlify.toml` junto a la carpeta `OC/`).
5. Ajustes que deben quedar coherentes con ese archivo:
   - **Base directory:** dejalo vacio si el `netlify.toml` raiz ya define `base = "OC/Frontend"`. Si el panel fuerza un valor, usa **`OC/Frontend`**.
   - **Build command:** `npm ci && npm run build` (o el que indique Netlify al leer el toml).
   - **Publish directory:** **`dist`** (relativo a `OC/Frontend` cuando usas base en el toml raiz).
6. **Environment variables** → agrega:
   - `VITE_API_URL` = URL HTTPS de tu API en Render (ej. `https://oc-calisthenics.onrender.com` o la que tengas).
7. **Deploy** → *Trigger deploy* → *Clear cache and deploy site* la primera vez.

### Nombre del sitio

- Dominio: **`oc-club.netlify.app`** (Site settings → Domain management).

### Deploy previews (ramas / PR)

Cada preview tiene un origen distinto (`https://deploy-preview-XX--oc-club.netlify.app`). El backend solo acepta los origenes listados en `ALLOWED_ORIGINS`. Para probar un preview, agrega temporalmente esa URL en Render (variable `ALLOWED_ORIGINS`, separada por comas) o usa solo produccion para pruebas finales.

## 2. Render (backend + GitHub)

1. En [Render](https://dashboard.render.com), servicio **Web** existente o **New** → **Build and deploy from a Git repository**.
2. Mismo repo de GitHub.
3. **Root Directory:** **`OC/BACKEND`** (obligatorio: ahi estan `requirements.txt` y `app/`).
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment** → variables minimas:
   - `DATABASE_URL` (PostgreSQL / Supabase).
   - `ALLOWED_ORIGINS` = **`https://oc-club.netlify.app`** (sin barra final). Para varios: `https://oc-club.netlify.app,https://otro-dominio.com`
   - `JWT_SECRET` (o deja que Render lo genere si usas plantilla compatible).
7. Guarda y despliega. Anota la URL publica del servicio (ej. `https://….onrender.com`).

## 3. Encaje Netlify ↔ Render

1. En **Netlify**, `VITE_API_URL` = URL del backend en Render (paso 2).
2. En **Render**, `ALLOWED_ORIGINS` debe incluir **`https://oc-club.netlify.app`**.
3. Vuelve a desplegar el frontend si cambiaste `VITE_API_URL`.

## 4. Archivos en el repo (ya preparados)

- **`netlify.toml`** (raiz del repo): build del monorepo en `OC/Frontend`.
- **`OC/Frontend/netlify.toml`**: sigue sirviendo si en Netlify configuras **Base directory** = `OC/Frontend` y no usas el toml de la raiz (por ejemplo deploy manual desde esa carpeta).
- **`OC/BACKEND/render.yaml`**: referencia de variables; la raiz del servicio en Render sigue siendo **`OC/BACKEND`** al conectar Git.
- **`OC/BACKEND/deploy/.env.production.example`**: ejemplo de `ALLOWED_ORIGINS` con oc-club.

## 5. Comprobar

- Abre `https://oc-club.netlify.app` → login y una pantalla que llame a la API.
- Si el navegador muestra error CORS, revisa `ALLOWED_ORIGINS` en Render (debe coincidir exactamente con el origen, incluido `https`).

## 6. Login falla tras cambiar el dominio de Netlify

Suele ser una de estas dos cosas (a veces ambas):

1. **Render — CORS**  
   `ALLOWED_ORIGINS` sigue con el dominio viejo (`…oc-calisthenics.netlify.app`) y no incluye **`https://oc-club.netlify.app`**.  
   Actualiza la variable, guarda y **vuelve a desplegar** el servicio en Render.

2. **Netlify — build sin API**  
   `VITE_API_URL` no está definida en **Site configuration → Environment variables**, o se añadió **después** del último build. Vite solo inyecta esa variable en **tiempo de build**: hay que **Trigger deploy → Clear cache and deploy site** después de configurarla.  
   Valor típico: `https://tu-servicio.onrender.com` (sin barra final).

En el navegador (F12 → **Red / Network**): al enviar login debe aparecer una petición `POST` a `…/auth/login` en tu dominio `onrender.com`. Si no sale o está bloqueada en rojo, revisa consola por mensajes CORS.
