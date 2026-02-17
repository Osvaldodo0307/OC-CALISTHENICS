# 🚀 Instrucciones para Subir el Frontend a Netlify

## 📋 Preparación

1. **Ejecutar el script de copia (opcional):**
   - Abre PowerShell como Administrador
   - Navega a esta carpeta: `C:\RUTA\PROYECTO\OC`
   - Ejecuta: `.\COPIAR_FRONTEND.ps1`
   - Esto copiará todos los archivos necesarios a la carpeta `Frontend_NETLIFY`

2. **O copiar manualmente (si tu código está en otra ruta):**
   - Copia toda la carpeta `frontend` desde `C:\RUTA\ORIGEN\frontend`
   - Pégala en `C:\RUTA\PROYECTO\OC\Frontend`
   - **NO incluyas:** `node_modules`, `dist`, `.git`, `.npm-cache`

## 🌐 Subir a Netlify

### Opción 1: Arrastrar y Soltar (Más Fácil)

1. Ve a [Netlify](https://app.netlify.com)
2. Inicia sesión o crea una cuenta
3. En el dashboard, busca **"Sites"** → **"Add new site"** → **"Deploy manually"**
4. Arrastra la carpeta `Frontend` completa a la zona de arrastre
5. Netlify comenzará a construir y desplegar automáticamente

### Opción 2: Conectar con Git (Recomendado para actualizaciones automáticas)

1. Sube la carpeta `Frontend` a un repositorio Git (GitHub, GitLab, Bitbucket)
2. En Netlify, haz clic en **"Add new site"** → **"Import an existing project"**
3. Conecta tu repositorio
4. Netlify detectará automáticamente la configuración

## ⚙️ Configuración en Netlify

### Variables de Entorno (IMPORTANTE)

1. Una vez desplegado, ve a **Site settings** → **Environment variables**
2. Agrega la variable:
   ```
   VITE_API_URL = https://tu-backend-en-render.onrender.com
   ```
   ⚠️ **Reemplaza** `tu-backend-en-render.onrender.com` con la URL real de tu backend en Render

3. Después de agregar la variable, haz clic en **"Trigger deploy"** → **"Clear cache and deploy site"**

### Configuración de Build (Ya configurada en netlify.toml)

Netlify detectará automáticamente:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

## ✅ Verificación

1. Una vez desplegado, Netlify te dará una URL como:
   ```
   https://tu-sitio.netlify.app
   ```

2. Visita la URL y verifica que:
   - La landing page se carga correctamente
   - Puedes hacer login
   - Las peticiones van al backend correcto

3. Si hay errores:
   - Revisa los logs de build en Netlify
   - Verifica que `VITE_API_URL` esté configurada correctamente
   - Abre la consola del navegador (F12) para ver errores

## 📝 Notas Importantes

- **Primero despliega el backend en Render** y obtén su URL
- **Luego configura** `VITE_API_URL` en Netlify con esa URL
- Cada vez que actualices el código, Netlify desplegará automáticamente (si usas Git)
- Si subes manualmente, necesitarás volver a subir la carpeta cada vez

## 🎯 Estructura de Archivos Necesaria

La carpeta `Frontend` debe contener:
```
Frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── contexts/
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
├── netlify.toml
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── tsconfig.node.json
```

¡Listo! Tu frontend estará disponible en internet sin necesidad de ejecutar comandos localmente. 🚀
