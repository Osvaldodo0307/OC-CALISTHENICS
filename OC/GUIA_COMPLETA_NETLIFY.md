# 🚀 Guía Completa para Subir el Frontend a Netlify

## Producción OC Club + Git

- Dominio del sitio: **`https://oc-club.netlify.app`**
- Para **enlazar GitHub con Netlify y Render** (monorepo), sigue primero **[`DEPLOY_OC_CLUB.md`](DEPLOY_OC_CLUB.md)**. En la raíz del repo hay un `netlify.toml` que construye `OC/Frontend`.

## 📋 Resumen

Esta guía te ayudará a preparar y subir el frontend de OC-CALISTHENICS directamente a Netlify sin necesidad de ejecutar comandos localmente.

---

## 📁 Paso 1: Preparar la Carpeta Frontend

### Opción A: Copiar Manualmente (RECOMENDADO)

1. **Abre el Explorador de Archivos**
2. **Ve a:** `C:\RUTA\ORIGEN\frontend` (ajusta si ya estás en `C:\RUTA\PROYECTO\OC\Frontend`)
3. **Crea la carpeta destino (si no existe):**
   - Ve a: `C:\RUTA\PROYECTO\OC`
   - Crea una nueva carpeta llamada `Frontend`
4. **Copia los siguientes archivos y carpetas:**
   - ✅ `src/` (carpeta completa)
   - ✅ `public/` (carpeta completa)
   - ✅ `index.html`
   - ✅ `package.json`
   - ✅ `package-lock.json`
   - ✅ `vite.config.ts`
   - ✅ `netlify.toml`
   - ✅ `tailwind.config.js`
   - ✅ `postcss.config.js`
   - ✅ `tsconfig.json`
   - ✅ `tsconfig.node.json`
  - ✅ `.env` (crear manualmente si lo usas en local)

5. **NO copies:**
   - ❌ `node_modules/`
   - ❌ `dist/`
   - ❌ `.git/`
   - ❌ `.npm-cache/`

### Opción B: Usar PowerShell (Como Administrador)

```powershell
# Abre PowerShell como Administrador
cd "C:\RUTA\PROYECTO\OC"

# Ejecuta el script
.\COPIAR_FRONTEND.ps1
```

---

## 🌐 Paso 2: Subir a Netlify

### Método 1: Arrastrar y Soltar (Más Fácil)

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Inicia sesión o crea una cuenta gratuita
3. En el dashboard, busca **"Add new site"**
4. Selecciona **"Deploy manually"** o **"Deploy to production"**
5. **Arrastra la carpeta `Frontend` completa** a la zona de arrastre
6. Netlify comenzará automáticamente:
   - Instalar dependencias (`npm install`)
   - Construir el proyecto (`npm run build`)
   - Desplegar el sitio

### Método 2: Conectar con Git (Para actualizaciones automáticas)

1. Sube la carpeta `Frontend` a un repositorio Git (GitHub, GitLab, Bitbucket)
2. En Netlify, haz clic en **"Add new site"** → **"Import an existing project"**
3. Conecta tu repositorio
4. Netlify detectará automáticamente la configuración desde `netlify.toml`

---

## ⚙️ Paso 3: Configurar Variables de Entorno

**⚠️ MUY IMPORTANTE:** Sin esto, el frontend no podrá conectarse al backend.

1. Una vez desplegado, ve a tu sitio en Netlify
2. Ve a **Site settings** → **Environment variables**
3. Haz clic en **"Add variable"**
4. Agrega:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://tu-backend-en-render.onrender.com`
   - ⚠️ **Reemplaza** `tu-backend-en-render.onrender.com` con la URL real de tu backend en Render

5. Haz clic en **"Save"**
6. Ve a **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## ✅ Paso 4: Verificar el Deployment

1. **Espera a que termine el build** (puede tardar 2-5 minutos la primera vez)
2. Netlify te dará una URL como: `https://tu-sitio-aleatorio.netlify.app`
3. **Visita la URL** y verifica:
   - ✅ La landing page se carga
   - ✅ Puedes hacer login con los usuarios demo
   - ✅ Las funcionalidades funcionan

4. **Si hay errores:**
   - Revisa los **logs de build** en Netlify
   - Abre la **consola del navegador** (F12) para ver errores
   - Verifica que `VITE_API_URL` esté configurada correctamente

---

## 📝 Estructura Final de la Carpeta Frontend

Tu carpeta `Frontend` debe verse así:

```
Frontend/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   ├── coach/
│   │   ├── Classes.tsx
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── components/
│   │   ├── AppShell.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── netlify.toml          ← Configuración de Netlify
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── .env (crear manualmente si lo usas en local)
```

---

## 🔧 Configuración Automática

El archivo `netlify.toml` ya está configurado con:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

Netlify detectará esto automáticamente, así que **no necesitas configurar nada manualmente** en la sección de build settings.

---

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica que todos los archivos estén copiados correctamente
- Revisa los logs de build en Netlify
- Asegúrate de que `package.json` esté presente

### Error: "Cannot connect to backend"
- Verifica que `VITE_API_URL` esté configurada en Netlify
- Asegúrate de que la URL del backend sea correcta (debe empezar con `https://`)
- Después de agregar la variable, haz un nuevo deploy

### Error: "Page not found" al navegar
- Esto es normal, el archivo `netlify.toml` ya tiene configurado el redirect
- Si persiste, verifica que el redirect esté en el archivo

### El sitio carga pero no funciona
- Abre la consola del navegador (F12)
- Verifica que las peticiones vayan a la URL correcta del backend
- Revisa errores de CORS (puede ser que el backend no permita el origen de Netlify)

---

## 📌 Checklist Final

Antes de subir a Netlify, verifica:

- [ ] Carpeta `Frontend` creada en `C:\RUTA\PROYECTO\OC\`
- [ ] Todos los archivos copiados (excepto node_modules, dist, .git)
- [ ] `package.json` presente
- [ ] `netlify.toml` presente
- [ ] `src/` y `public/` copiados completamente
- [ ] Backend desplegado en Render y URL obtenida
- [ ] Variable `VITE_API_URL` lista para configurar en Netlify

---

## 🎯 Resultado Final

Una vez completado, tendrás:

- ✅ Frontend disponible en: `https://tu-sitio.netlify.app`
- ✅ Funcionando 24/7 sin necesidad de ejecutar comandos
- ✅ Actualizaciones automáticas si usas Git
- ✅ Conectado al backend en Render

---

## 💡 Tips Adicionales

1. **Primera vez:** El build puede tardar 3-5 minutos. Sé paciente.

2. **Actualizaciones:** Si cambias código y usas Git, Netlify desplegará automáticamente. Si subes manualmente, necesitarás volver a arrastrar la carpeta.

3. **Dominio personalizado:** Puedes configurar un dominio personalizado en Netlify (Settings → Domain management).

4. **Preview deployments:** Cada vez que hagas push a Git, Netlify crea un preview deployment que puedes probar antes de hacer merge.

---

¡Listo! Sigue estos pasos y tu frontend estará en internet en minutos. 🚀
