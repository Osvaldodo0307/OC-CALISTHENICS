# 🚀 Guía: Subir Backend a GitHub y Conectar con Render

## 📋 Resumen

Esta guía te ayudará a subir el backend a GitHub y conectarlo con Render para que se despliegue automáticamente.

---

## 📁 Paso 1: Preparar la Carpeta BACKEND

### Opción A: Usar el Script (Recomendado)

1. **Abre PowerShell como Administrador**
2. **Navega a:** `cd "C:\RUTA\PROYECTO\OC"`
3. **Ejecuta:** `.\BACKEND\COPIAR_BACKEND.ps1`

### Opción B: Copiar Manualmente

1. **Abre el Explorador de Archivos**
2. **Ve a:** `C:\RUTA\ORIGEN\backend` (ajusta si ya estás en `C:\RUTA\PROYECTO\OC\BACKEND`)
3. **Copia TODOS los archivos y carpetas EXCEPTO:**
   - ❌ `venv/`
   - ❌ `__pycache__/`
   - ❌ `*.db` (archivos de base de datos)
   - ❌ `.env` (variables de entorno locales)
   - ❌ `.git/` (si existe)

4. **Pega en:** `C:\RUTA\PROYECTO\OC\BACKEND`

---

## 🔵 Paso 2: Subir a GitHub

### 2.1 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Haz clic en **"New repository"** (o el botón **"+"** → **"New repository"**)
3. **Nombre del repositorio:** `oc-calisthenics-backend` (o el que prefieras)
4. **Descripción:** "Backend API para OC-CALISTHENICS"
5. **Visibilidad:** Público o Privado (según prefieras)
6. **NO marques** "Add a README file" (ya tenemos uno)
7. Haz clic en **"Create repository"**

### 2.2 Inicializar Git Localmente

Abre PowerShell o Git Bash en la carpeta BACKEND:

```bash
cd "C:\RUTA\PROYECTO\OC\BACKEND"

# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: OC-CALISTHENICS Backend"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANTE:** Reemplaza `TU_USUARIO` y `TU_REPO` con tu usuario de GitHub y el nombre del repositorio que creaste.

---

## 🌐 Paso 3: Conectar con Render

### 3.1 Crear Servicio Web en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Inicia sesión o crea una cuenta (puedes usar GitHub para iniciar sesión)
3. Haz clic en **"New +"** → **"Web Service"**
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Selecciona el repositorio que acabas de crear
6. Render detectará automáticamente `render.yaml`

### 3.2 Configuración Automática

Render detectará automáticamente:
- ✅ **Name:** `oc-calisthenics-api`
- ✅ **Environment:** `Python`
- ✅ **Build Command:** `pip install -r requirements.txt && python seed.py`
- ✅ **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Solo necesitas:**
- Verificar que el **Root Directory** sea `/` (raíz del repositorio)
- Hacer clic en **"Create Web Service"**

---

## 🗄️ Paso 4: Crear Base de Datos PostgreSQL

### 4.1 Crear Base de Datos en Render

1. En Render Dashboard, haz clic en **"New +"** → **"PostgreSQL"**
2. **Name:** `oc-calisthenics-db` (o el nombre que prefieras)
3. **Database:** `oc_calisthenics` (o el nombre que prefieras)
4. **User:** Se genera automáticamente
5. **Region:** Elige la más cercana
6. **Plan:** Free (para empezar)
7. Haz clic en **"Create Database"**

### 4.2 Obtener URL de la Base de Datos

1. Una vez creada, ve a la base de datos
2. En la sección **"Connections"**, encontrarás:
   - **Internal Database URL** (para usar dentro de Render)
   - **External Database URL** (para usar desde fuera de Render)
3. **Copia la Internal Database URL** (es más segura)

---

## ⚙️ Paso 5: Configurar Variables de Entorno

### 5.1 En el Servicio Web

1. Ve a tu servicio web en Render
2. Ve a la pestaña **"Environment"**
3. Haz clic en **"Add Environment Variable"**
4. Agrega las siguientes variables:

```
DATABASE_URL = postgresql://usuario:password@host:5432/database
```

**⚠️ IMPORTANTE:** Usa la **Internal Database URL** que copiaste del paso anterior.

```
SECRET_KEY = tu-secret-key-muy-segura-aqui-generar-una-aleatoria
```

**💡 Tip:** Puedes generar una secret key segura con:
```python
import secrets
print(secrets.token_urlsafe(32))
```

```
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
OPENAI_API_KEY = (opcional, dejar vacío si no usas IA real)
```

### 5.2 Variables Ya Configuradas

Estas variables ya están en `render.yaml` y Render las configurará automáticamente:
- `ALGORITHM` = HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES` = 1440
- `SECRET_KEY` = Se genera automáticamente (pero puedes cambiarla)

**Solo necesitas configurar manualmente:**
- `DATABASE_URL` (con la URL de PostgreSQL)

---

## ✅ Paso 6: Desplegar

1. Una vez configuradas las variables de entorno, Render comenzará a desplegar automáticamente
2. Ve a la pestaña **"Logs"** para ver el progreso
3. El proceso puede tardar 3-5 minutos la primera vez
4. Verás mensajes como:
   - "Installing dependencies..."
   - "Running build command..."
   - "Starting service..."

---

## 🧪 Paso 7: Verificar el Deployment

### 7.1 Verificar que el Servicio Esté Activo

1. Una vez desplegado, Render te dará una URL como:
   ```
   https://oc-calisthenics-api.onrender.com
   ```

2. Visita la URL raíz:
   ```
   https://tu-backend.onrender.com/
   ```
   Deberías ver: `{"message":"OC-CALISTHENICS API"}`

3. Visita la documentación:
   ```
   https://tu-backend.onrender.com/docs
   ```
   Deberías ver la interfaz de Swagger UI

### 7.2 Probar el Login

1. En `/docs`, busca el endpoint `POST /auth/login`
2. Haz clic en **"Try it out"**
3. Usa las credenciales demo:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Deberías recibir un token JWT

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas push a GitHub:

1. Render detectará automáticamente los cambios
2. Ejecutará el build automáticamente
3. Desplegará la nueva versión

**No necesitas hacer nada manualmente después del primer despliegue.**

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Causa común:** Dependencias faltantes o errores en el código.

**Solución:**
- Revisa los logs en Render
- Verifica que `requirements.txt` tenga todas las dependencias
- Asegúrate de que no haya errores de sintaxis en Python

### Error: "Database connection failed"

**Causa:** `DATABASE_URL` no configurada o incorrecta.

**Solución:**
- Verifica que `DATABASE_URL` esté configurada en Environment Variables
- Asegúrate de usar la **Internal Database URL** de Render
- Verifica que la base de datos PostgreSQL esté activa

### Error: "Module not found"

**Causa:** Dependencia faltante en `requirements.txt`.

**Solución:**
- Agrega la dependencia faltante a `requirements.txt`
- Haz commit y push a GitHub
- Render reconstruirá automáticamente

### El servicio se "duerme" después de inactividad

**Causa:** Plan gratuito de Render.

**Solución:**
- Es normal en el plan gratuito
- La primera petición después de inactividad puede tardar 30-60 segundos
- Considera actualizar a un plan de pago si necesitas que esté siempre activo

---

## 📝 Checklist Final

Antes de considerar el despliegue completo:

- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Servicio web creado en Render
- [ ] Repositorio conectado en Render
- [ ] Base de datos PostgreSQL creada
- [ ] Variable `DATABASE_URL` configurada
- [ ] Variable `SECRET_KEY` configurada
- [ ] Servicio desplegado y funcionando
- [ ] API accesible en la URL de Render
- [ ] Documentación accesible en `/docs`
- [ ] Login funcionando con usuarios demo

---

## 🎯 URLs Finales

Una vez completado, tendrás:

- **API:** `https://tu-backend.onrender.com`
- **Docs:** `https://tu-backend.onrender.com/docs`
- **ReDoc:** `https://tu-backend.onrender.com/redoc`

**⚠️ IMPORTANTE:** Copia la URL del backend y úsala en la variable de entorno `VITE_API_URL` del frontend en Netlify.

---

## 💡 Tips Adicionales

1. **Primera vez:** El despliegue puede tardar 5-10 minutos. Sé paciente.

2. **Logs:** Siempre revisa los logs en Render si hay problemas. Son muy informativos.

3. **Base de datos:** La base de datos PostgreSQL en Render es gratuita pero tiene límites. Para producción, considera un plan de pago.

4. **Dominio personalizado:** Puedes configurar un dominio personalizado en Render (Settings → Custom Domains).

5. **Variables de entorno:** Nunca subas el archivo `.env` a GitHub. Crea un `.env` local solo si lo necesitas para pruebas.

---

¡Listo! Tu backend estará disponible en internet y se actualizará automáticamente cada vez que hagas push a GitHub. 🚀
