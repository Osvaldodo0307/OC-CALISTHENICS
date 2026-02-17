# ✅ Checklist Pre-Producción

## 🔍 Validación Local (ANTES de subir)

### Backend
- [ ] Ejecutar `INICIAR.bat` o `INICIAR_APP.ps1`
- [ ] Verificar que el backend inicie en `http://localhost:8000`
- [ ] Verificar que `/docs` funcione (Swagger UI)
- [ ] Probar login con credenciales demo
- [ ] Verificar que los ejercicios se importen correctamente (si aplica)

### Frontend
- [ ] Verificar que el frontend inicie en `http://localhost:5173`
- [ ] Probar login
- [ ] Verificar que las peticiones vayan al backend correcto
- [ ] Probar funcionalidades principales (dashboard, rutinas, etc.)

## 🚀 Despliegue en Render (Backend)

### Antes de Subir
- [ ] Verificar que `render.yaml` esté presente
- [ ] Verificar que `requirements.txt` esté actualizado
- [ ] Verificar que `.env.example` tenga todas las variables necesarias

### En Render Dashboard
- [ ] Crear nuevo servicio Web Service
- [ ] Conectar con GitHub (o subir archivos)
- [ ] Configurar variables de entorno:
  - [ ] `DATABASE_URL` (PostgreSQL - Render lo crea automáticamente)
  - [ ] `SECRET_KEY` (generar uno seguro)
  - [ ] `ALGORITHM` = `HS256`
  - [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
  - [ ] `ALLOWED_ORIGINS` = URL del frontend en Netlify (después de desplegar)
  - [ ] `OPENAI_API_KEY` (opcional)

### Después del Despliegue
- [ ] Verificar que la API responda en la URL de Render
- [ ] Probar `/docs` en la URL de producción
- [ ] Anotar la URL del backend (ej: `https://oc-calisthenics-api.onrender.com`)

## 🌐 Despliegue en Netlify (Frontend)

### Antes de Subir
- [ ] Verificar que `netlify.toml` esté presente
- [ ] Verificar que `package.json` esté presente
- [ ] Verificar que no haya rutas hardcodeadas a localhost

### En Netlify Dashboard
- [ ] Arrastrar carpeta `Frontend` o conectar con GitHub
- [ ] Verificar que Netlify detecte la configuración automáticamente
- [ ] Configurar variable de entorno:
  - [ ] `VITE_API_URL` = URL del backend en Render (ej: `https://oc-calisthenics-api.onrender.com`)

### Después del Despliegue
- [ ] Verificar que el sitio cargue correctamente
- [ ] Probar login
- [ ] Verificar que las peticiones vayan al backend correcto
- [ ] Anotar la URL del frontend (ej: `https://oc-calisthenics.netlify.app`)

## 🔄 Actualización de CORS

### Después de tener ambas URLs
1. [ ] Ir a Render Dashboard
2. [ ] Actualizar `ALLOWED_ORIGINS` con la URL de Netlify
3. [ ] Reiniciar el servicio en Render
4. [ ] Verificar que CORS funcione correctamente

## ✅ Verificación Final

- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Peticiones van al backend correcto
- [ ] No hay errores de CORS en la consola
- [ ] Funcionalidades principales funcionan
- [ ] Rutas protegidas funcionan correctamente

## 📝 Notas

- **Importante**: Siempre desplegar primero el backend, luego el frontend
- **CORS**: Configurar `ALLOWED_ORIGINS` después de tener ambas URLs
- **Variables de entorno**: Son críticas para que todo funcione en producción
