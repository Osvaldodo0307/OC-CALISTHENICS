# Implementación de Autenticación JWT + Roles - OC-CALISTHENICS

## ✅ Resumen de Implementación

Sistema completo de autenticación JWT con roles (admin, coach, socio) implementado según especificaciones.

---

## 📁 Archivos Modificados/Creados

### Backend

#### Nuevos archivos:
1. **`OC/BACKEND/app/core/__init__.py`** - Módulo core
2. **`OC/BACKEND/app/core/security.py`** - Funciones de seguridad (hash, JWT)
3. **`OC/BACKEND/app/deps.py`** - Dependencias FastAPI reutilizables

#### Archivos modificados:
1. **`OC/BACKEND/app/auth.py`** - Actualizado para usar `core/security.py`
2. **`OC/BACKEND/app/routes/auth.py`** - Login ahora devuelve `user` en respuesta
3. **`OC/BACKEND/app/routes/admin.py`** - Agregados endpoints:
   - `POST /admin/users` - Crear usuarios
   - `POST /admin/assign-coach` - Asignar coach a alumno
4. **`OC/BACKEND/app/routes/coaches.py`** - Agregado endpoint:
   - `GET /coaches/me/students` - Ver solo alumnos asignados
5. **`OC/BACKEND/app/routes/students.py`** - Agregado endpoint:
   - `GET /students/me/plan` - Ver plan del socio actual
6. **`OC/BACKEND/seed.py`** - Actualizado con datos requeridos
7. **`OC/BACKEND/.env`** - Agregadas variables JWT

### Frontend

#### Archivos modificados:
1. **`OC/Frontend/src/contexts/AuthContext.tsx`** - Actualizado para manejar respuesta con `user`
2. **`OC/Frontend/src/pages/Login.tsx`** - Redirección según rol + usuarios demo actualizados
3. **`OC/Frontend/src/components/ProtectedRoute.tsx`** - Mejorado manejo de roles
4. **`OC/Frontend/src/App.tsx`** - Rutas protegidas con `requiredRole`

---

## 🔐 Endpoints Implementados

### Autenticación

#### `POST /auth/login`
**Body (FormData):**
```
username: admin
password: Admin2026!
```

**Respuesta:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrador",
    "role": "admin",
    "phone": "5512345678",
    "created_at": "2026-01-25T12:00:00"
  }
}
```

#### `GET /auth/me`
**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrador",
  "role": "admin",
  "phone": "5512345678",
  "created_at": "2026-01-25T12:00:00"
}
```

### Admin

#### `POST /admin/users` (Solo admin)
**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "username": "coach_1",
  "name": "Coach 1",
  "password": "Coach2026!",
  "role": "coach",
  "phone": "5512345678"
}
```

**Respuesta:** UserResponse (sin password_hash)

**Errores:**
- `409` - Username ya existe
- `400` - Rol inválido
- `403` - No es admin

#### `POST /admin/assign-coach` (Solo admin)
**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "coach_id": 2,
  "student_id": 5
}
```

**Respuesta:**
```json
{
  "id": 1,
  "coach_id": 2,
  "student_id": 5,
  "assigned_at": "2026-01-25T12:00:00",
  "message": "Coach assigned successfully"
}
```

**Errores:**
- `404` - Coach o Student no encontrado
- `409` - Ya está asignado
- `403` - No es admin

### Coach

#### `GET /coaches/me/students` (Solo coach)
**Headers:**
```
Authorization: Bearer <coach_token>
```

**Respuesta:**
```json
[
  {
    "id": 3,
    "username": "socio1",
    "name": "Socio 1",
    "role": "socio",
    "phone": "5512345671",
    "created_at": "2026-01-25T12:00:00"
  }
]
```

**Nota:** Solo devuelve alumnos asignados a este coach en `coach_students`.

### Socio

#### `GET /students/me/plan` (Solo socio)
**Headers:**
```
Authorization: Bearer <socio_token>
```

**Respuesta:**
```json
{
  "id": 1,
  "student_id": 3,
  "coach_id": 2,
  "title": "Plan Fuerza - Intermedio - 4 Semanas",
  "start_date": "2026-01-25",
  "end_date": "2026-02-22",
  "goal": "Desarrollar fuerza mediante entrenamiento calistenia",
  "source": "manual",
  "created_at": "2026-01-25T12:00:00",
  "items": [
    {
      "id": 1,
      "week_number": 1,
      "day_label": "Lunes",
      "warmup": "Movilidad articular 5 min",
      "main": "Dominadas 4x6, Flexiones diamante 4x10",
      "accessories": "Plancha avanzada 3x45s",
      "cooldown": "Estiramiento 10 min",
      "notes": "Semana de adaptación"
    }
  ]
}
```

**Nota:** Devuelve `null` si no hay plan asignado.

---

## 🗄️ Datos de Prueba (Seed)

Ejecutar:
```bash
cd OC/BACKEND
python seed.py
```

### Usuarios creados:

| Username | Password | Rol |
|----------|----------|-----|
| admin | Admin2026! | admin |
| coach_youri | Coach2026! | coach |
| socio1 | Socio2026! | socio |
| socio2 | Socio2026! | socio |
| ... | ... | ... |
| socio8 | Socio2026! | socio |

### Asignaciones:
- Todos los socios (socio1-socio8) asignados a `coach_youri`
- Plan de entrenamiento creado para `socio1`

---

## 🚀 Pasos para Ejecutar Localmente

### Backend

1. **Navegar al directorio:**
   ```bash
   cd OC/BACKEND
   ```

2. **Instalar dependencias (si no están):**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar `.env`:**
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=oc_gym
   DB_USER=oc_app
   DB_PASSWORD=OcApp2026!
   JWT_SECRET=change_me_super_secret
   JWT_ALGORITHM=HS256
   JWT_EXPIRES_MINUTES=1440
   ALLOWED_ORIGINS=*
   ```

4. **Ejecutar seed (opcional):**
   ```bash
   python seed.py
   ```

5. **Iniciar servidor:**
   ```bash
   uvicorn app.main:app --reload
   ```

6. **Verificar:**
   - `http://127.0.0.1:8000/docs` - Swagger UI
   - `http://127.0.0.1:8000/health/db` - Health check

### Frontend

1. **Navegar al directorio:**
   ```bash
   cd OC/Frontend
   ```

2. **Instalar dependencias (si no están):**
   ```bash
   npm install
   ```

3. **Configurar `.env` (opcional):**
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

5. **Acceder:**
   - `http://localhost:5173` - Frontend
   - `http://localhost:5173/app/login` - Login

---

## 🔒 Protección de Rutas (Frontend)

### Rutas Protegidas por Rol:

- **Admin:**
  - `/app/admin/dashboard`
  - `/app/admin/usuarios`
  - `/app/admin/clases`
  - `/app/admin/coaches-alumnos`

- **Coach:**
  - `/app/coach/dashboard`
  - `/app/coach/alumnos`
  - `/app/coach/alumno/:id`
  - `/app/coach/asistencia-virtual/:id`

- **Socio:**
  - `/app/mi-plan`

### Comportamiento:
- Sin token → Redirige a `/app/login`
- Token inválido → Redirige a `/app/login`
- Rol incorrecto → Redirige a `/app/login`
- Login exitoso → Redirige según rol:
  - `admin` → `/app/admin/dashboard`
  - `coach` → `/app/coach/dashboard`
  - `socio` → `/app/mi-plan`

---

## ✅ Validaciones Implementadas

### Backend:
- ✅ 401 si token inválido
- ✅ 403 si rol no autorizado
- ✅ 409 si username ya existe
- ✅ 404 si user/coach/student no existe
- ✅ Coach solo ve sus alumnos asignados
- ✅ Socio solo ve su propio plan

### Frontend:
- ✅ Route guards por rol
- ✅ Redirección automática según rol
- ✅ Token guardado en localStorage
- ✅ User role guardado en localStorage
- ✅ Interceptor de axios para Authorization header

---

## 📝 Notas Importantes

1. **No hay registro público** - Solo admin puede crear usuarios (fase 1)
2. **Estructura mantenida** - No se renombraron carpetas ni archivos críticos
3. **MySQL compatible** - Todos los `String()` tienen longitud especificada
4. **CORS configurado** - Respeta `ALLOWED_ORIGINS` del `.env`
5. **Bcrypt para passwords** - Usando `passlib[bcrypt]`
6. **JWT con expiración** - 1440 minutos (24 horas) por defecto

---

## 🧪 Pruebas Recomendadas

### Backend (usar Swagger UI en `/docs`):

1. ✅ `GET /health/db` → `{"ok": true, "database": "connected"}`
2. ✅ `POST /auth/login` con `admin/Admin2026!` → Devuelve token + user
3. ✅ `GET /auth/me` con token → Devuelve user
4. ✅ `POST /admin/users` (como admin) → Crea usuario
5. ✅ `POST /admin/assign-coach` (como admin) → Asigna coach
6. ✅ `GET /coaches/me/students` (como coach) → Solo sus alumnos
7. ✅ `GET /students/me/plan` (como socio) → Su plan o null

### Frontend:

1. ✅ Login con `admin/Admin2026!` → Redirige a `/app/admin/dashboard`
2. ✅ Login con `coach_youri/Coach2026!` → Redirige a `/app/coach/dashboard`
3. ✅ Login con `socio1/Socio2026!` → Redirige a `/app/mi-plan`
4. ✅ Acceso sin token → Redirige a `/app/login`
5. ✅ Acceso con rol incorrecto → Redirige a `/app/login`

---

## 📦 Dependencias

### Backend (`requirements.txt`):
- `fastapi==0.104.1`
- `uvicorn[standard]==0.24.0`
- `python-jose[cryptography]==3.3.0`
- `passlib[bcrypt]==1.7.4`
- `python-multipart==0.0.6`
- `sqlalchemy==2.0.23`
- `pydantic==2.5.0`
- `python-dotenv==1.0.0`
- `pymysql==1.1.0`

### Frontend:
- Ya incluye `axios` para requests
- React Router para navegación
- Context API para estado de auth

---

## ✨ Estado Final

✅ **Backend:** Completamente funcional con JWT, roles y endpoints requeridos
✅ **Frontend:** Login funcional, route guards implementados, redirección por rol
✅ **Seed:** Datos de prueba según especificaciones
✅ **Documentación:** Endpoints documentados y probables

**Listo para usar en desarrollo local.**
