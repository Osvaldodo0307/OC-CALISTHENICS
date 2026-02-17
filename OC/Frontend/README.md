# OC-CALISTHENICS - Frontend

Aplicación React con TypeScript para el sistema de gestión del gimnasio.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env con:
# VITE_API_URL=http://localhost:8000

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview
```

## 📁 Estructura

```
src/
├── pages/
│   ├── Landing.tsx          # Landing pública
│   ├── Login.tsx             # Login
│   ├── Classes.tsx           # Clases (socio)
│   ├── Reservas.tsx          # Reservas (socio)
│   ├── Perfil.tsx            # Perfil usuario
│   ├── MiPlan.tsx            # Plan asignado (socio)
│   ├── Rutinas.tsx           # Generar rutinas
│   ├── admin/
│   │   ├── Dashboard.tsx     # Dashboard admin
│   │   ├── Usuarios.tsx      # Gestión usuarios
│   │   └── Clases.tsx        # CRUD clases
│   └── coach/
│       ├── Dashboard.tsx     # Dashboard coach
│       ├── Alumnos.tsx        # Lista alumnos
│       ├── Alumno.tsx         # Detalles alumno
│       └── AsistenciaVirtual.tsx  # Evaluación virtual
├── components/
│   ├── AppShell.tsx          # Layout principal
│   └── ProtectedRoute.tsx   # Ruta protegida
├── contexts/
│   └── AuthContext.tsx      # Context de autenticación
└── types.ts                 # TypeScript types
```

## 🎨 Estilos

- **Tailwind CSS**: Framework de utilidades
- **Colores personalizados**:
  - `oc-red`: #DC2626
  - `oc-dark`: #0F0F0F
  - `oc-metal`: #1F1F1F
  - `oc-gold`: #D4AF37

## 🔐 Autenticación

El sistema usa JWT tokens almacenados en `localStorage`.
El contexto `AuthContext` maneja el estado de autenticación.

## 📊 Gráficos

Usa Chart.js con react-chartjs-2 para:
- Gráficos de línea (reservas, progresos)
- Gráficos de barras (popularidad de clases)
- Gráficos de dona (distribución de membresías)

## 🌐 Variables de Entorno

```env
VITE_API_URL=http://localhost:8000
```

## 🚢 Despliegue

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Variables de entorno: `VITE_API_URL`

### Vercel
1. Framework: Vite
2. Build command: `npm run build`
3. Output directory: `dist`
4. Variables de entorno: `VITE_API_URL`

## 📱 Responsive

Diseño mobile-first con breakpoints de Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

## 🔧 Desarrollo

### Proxy en desarrollo
El `vite.config.ts` incluye un proxy para `/api` que redirige a `http://localhost:8000`.
En producción, configurar `VITE_API_URL` correctamente.

### Linting
```bash
npm run lint
```

## 📝 Notas

- La landing (`/`) funciona sin backend
- Las rutas protegidas redirigen a `/app/login` si no hay autenticación
- Los roles determinan qué rutas están disponibles en el menú
