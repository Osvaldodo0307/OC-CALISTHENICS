# 🏋️ OC-CALISTHENICS - Backend API

API REST construida con FastAPI para el sistema de gestión del gimnasio OC-CALISTHENICS.

## 🚀 Despliegue en Render

Este backend está configurado para desplegarse automáticamente en Render usando `render.yaml`.

### Pasos para Desplegar:

1. **Subir a GitHub:**
   - Crea un repositorio en GitHub
   - Sube todos los archivos de esta carpeta
   - **NO incluyas:** `venv/`, `__pycache__/`, `*.db`, `.env`

2. **Conectar con Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Haz clic en **"New +"** → **"Web Service"**
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente `render.yaml`

3. **Configurar Base de Datos PostgreSQL:**
   - En Render, crea una base de datos PostgreSQL
   - Copia la **Internal Database URL** o **External Database URL**
   - Ve a tu servicio web → **Environment**
   - Agrega la variable: `DATABASE_URL` con la URL de PostgreSQL

4. **Configurar Variables de Entorno:**
   ```
   DATABASE_URL=postgresql://usuario:password@host:5432/database
   SECRET_KEY=tu-secret-key-muy-segura-aqui
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   OPENAI_API_KEY=opcional-si-quieres-usar-ia-real
   ```

5. **Desplegar:**
   - Render desplegará automáticamente
   - El build ejecutará: `pip install -r requirements.txt && python seed.py`
   - El servidor iniciará con: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 📚 Documentación API

Una vez desplegado, accede a:
- **Swagger UI:** `https://tu-backend.onrender.com/docs`
- **ReDoc:** `https://tu-backend.onrender.com/redoc`

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

Obtener token:
```bash
POST /auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}
```

## 👥 Usuarios Demo

Después de ejecutar `seed.py`, tendrás estos usuarios:

- **admin** / admin123 (Administrador)
- **coach1** / coach123 (Coach)
- **osvaldo** / demo123 (Socio activo)
- **ana** / demo123 (Socio vencido)

## 📋 Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual

### Usuarios (Admin)
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `GET /users/{id}` - Detalle usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

### Clases
- `GET /classes` - Listar clases disponibles
- `POST /classes` - Crear clase (admin)
- `PUT /classes/{id}` - Actualizar clase (admin)
- `DELETE /classes/{id}` - Eliminar clase (admin)

### Reservas
- `GET /bookings/my` - Mis reservas
- `POST /bookings` - Crear reserva (socio)
- `DELETE /bookings/{id}` - Cancelar reserva

### Coach
- `GET /coaches/students` - Listar alumnos del coach
- `POST /coaches/assign` - Asignar alumno a coach

### Progresos
- `GET /progress/student/{id}` - Progresos de un alumno
- `POST /progress` - Crear progreso (coach)

### Planes de Entrenamiento
- `GET /plans/student/{id}` - Planes de un alumno
- `POST /plans` - Crear plan (coach)

### Asistencia Virtual
- `GET /assessments/student/{id}` - Evaluaciones de un alumno
- `POST /assessments` - Crear evaluación (coach)

### Rutinas IA
- `POST /routines/generate` - Generar rutina desde evaluación
- `POST /routines/generate-direct` - Generar rutina directa

### Dashboard
- `GET /dashboard/admin` - Estadísticas admin
- `GET /dashboard/coach` - Dashboard coach

### Admin
- `GET /admin/coaches-info` - Información de coaches
- `GET /admin/students-info` - Información de alumnos
- `GET /admin/coach/{id}/details` - Detalles de coach
- `GET /admin/student/{id}/details` - Detalles de alumno

## 🗄️ Base de Datos

### SQLite (Desarrollo)
Por defecto usa SQLite. El archivo se crea en `./oc_calisthenics.db`

### PostgreSQL (Producción - Render)
Configurar `DATABASE_URL` en Render con la URL de PostgreSQL.

## 🔧 Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=  # Opcional, para IA real
```

## 📦 Estructura

```
app/
├── main.py              # Aplicación FastAPI
├── database.py          # Configuración DB
├── models.py            # Modelos SQLAlchemy
├── schemas.py           # Schemas Pydantic
├── auth.py              # Autenticación JWT
├── ai_routine_generator.py  # Generador de rutinas
└── routes/
    ├── auth.py
    ├── users.py
    ├── classes.py
    ├── bookings.py
    ├── coaches.py
    ├── students.py
    ├── progress.py
    ├── plans.py
    ├── assessments.py
    ├── routines.py
    ├── membership.py
    ├── dashboard.py
    └── admin.py
```

## 🧪 Seed Data

El archivo `seed.py` se ejecuta automáticamente durante el build en Render. Crea:
- Usuarios demo (admin, coach, socios)
- Membresías
- Clases de ejemplo
- Reservas
- Progresos
- Evaluación virtual
- Plan de entrenamiento ejemplo

## 🔒 Seguridad

- Validación de roles en cada endpoint
- Coach solo accede a alumnos asignados
- Socio solo accede a sus propios datos
- Admin tiene acceso completo
- CORS configurado (ajustar en producción)

## 🚢 Despliegue en Render

### Configuración Automática (render.yaml)

Render detectará automáticamente:
- **Environment:** Python
- **Build Command:** `pip install -r requirements.txt && python seed.py`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Variables de Entorno Requeridas

1. **DATABASE_URL** - URL de PostgreSQL (crear en Render)
2. **SECRET_KEY** - Generado automáticamente por Render
3. **ALGORITHM** - HS256 (ya configurado)
4. **ACCESS_TOKEN_EXPIRE_MINUTES** - 1440 (ya configurado)
5. **OPENAI_API_KEY** - Opcional

## 📝 Notas Importantes

- El archivo `seed.py` se ejecuta en cada build, creando datos demo
- En producción, considera desactivar el seed o hacerlo condicional
- Ajusta CORS en `app/main.py` para especificar dominios permitidos
- La base de datos PostgreSQL se crea automáticamente en Render

## 🔗 URLs Finales

Una vez desplegado:
- **API:** `https://tu-backend.onrender.com`
- **Docs:** `https://tu-backend.onrender.com/docs`
- **ReDoc:** `https://tu-backend.onrender.com/redoc`

¡Listo para desplegar! 🚀
