# Modo admin demo / local (OC Club Frontend)

## Para qué sirve

Permite abrir el panel administrativo en **desarrollo local** sin backend conectado, para revisar visualmente:

- Membresías y pagos
- Recordatorios y seguimientos
- Expediente del socio
- Navegación admin y estados visuales

Los datos son **ficticios** y las acciones **no persisten** en ninguna base real.

## Cómo activarlo

1. En `OC/Frontend`, crea o edita `.env.local` (no commitear credenciales):

```env
VITE_ENABLE_ADMIN_DEMO=true
```

2. Reinicia el servidor de desarrollo:

```bash
npm run dev
```

3. Variable requerida:

| Variable | Valor en demo | Valor en producción |
|---|---|---|
| `VITE_ENABLE_ADMIN_DEMO` | `true` | `false` o ausente |

**Por defecto está desactivado.** En builds de producción sin esta variable, el modo demo **no aparece**.

### Netlify Production — importante

**No configures `VITE_ENABLE_ADMIN_DEMO` en el panel de Netlify** (ni en Production, ni en Deploy Previews que apunten al sitio público). Si la variable queda en `true` por error:

- El botón «Entrar como admin demo» aparecerá en `/app/login`.
- Se podría acceder al panel admin sin credenciales reales (solo datos mock).

Tras cualquier cambio en variables `VITE_*` en Netlify, ejecuta **Clear cache and deploy site**.

## Cómo entrar como admin demo

1. Abre `/app/login`
2. Si el modo demo está activo, verás el botón **「Entrar como admin demo」**
3. Clic → sesión local con rol `admin` → redirección a `/app/admin/membresias`
4. Banner superior: *「Modo demo/local — datos de prueba…」*
5. **Salir** limpia la sesión y reinicia los datos mock en memoria

## Rutas recomendadas para probar

| Ruta | Qué revisar |
|---|---|
| `/app/admin/membresias` | Lista, resumen, alertas, panel rápido, pagos |
| `/app/admin/recordatorios` | Bandeja, filtros, seguimiento |
| `/app/admin/socios/101` | Socio al corriente |
| `/app/admin/socios/105` | Adeudo parcial |
| `/app/admin/socios/106` | Suspendido |
| `/app/admin/socios/109` | Pago revertido |
| `/app/admin/socios/110` | Sin teléfono (WhatsApp no disponible) |
| `/app/admin/socios/111` | Sin pagos |
| `/app/admin/socios/112` | Seguimiento / contactado recientemente |
| `/app/admin/dashboard` | Agenda semanal (stub mínimo) |

## Socios mock (IDs)

| ID | Caso |
|---|---|
| 101 | Al corriente |
| 102 | Por vencer |
| 103 | Vence hoy |
| 104 | Vencido |
| 105 | Adeudo parcial + ciclo histórico |
| 106 | Suspendido |
| 107 | Cortesía |
| 108 | Ajuste administrativo |
| 109 | Pago revertido visible |
| 110 | Sin teléfono |
| 111 | Sin pagos |
| 112 | Seguimiento pendiente / contactado recientemente |

## Acciones simuladas

En modo demo, estas operaciones actualizan **estado en memoria** del navegador:

- Registrar pago
- Revertir pago (LIFO simplificado)
- Agregar nota
- Crear seguimiento / acciones rápidas
- Suspender / levantar suspensión

**WhatsApp manual** abre `wa.me` solo si el socio mock tiene teléfono.

## Qué NO usar en producción

- No activar `VITE_ENABLE_ADMIN_DEMO=true` en Netlify, Render ni builds release
- No confiar en datos mock para decisiones operativas
- No sustituir pruebas contra backend real antes de desplegar cambios de membresías/pagos

## Arquitectura

| Archivo | Rol |
|---|---|
| `src/config/adminDemo.ts` | Flag `isAdminDemoMode()`, usuario/token demo |
| `src/mocks/adminDemoData.ts` | Datos y store en memoria |
| `src/mocks/adminDemoApi.ts` | Respuestas mock por ruta |
| `src/mocks/setupAdminDemoInterceptor.ts` | Interceptor axios |
| `src/contexts/AuthContext.tsx` | `loginAsAdminDemo()`, sesión demo |

## Limitaciones

- Paneles fuera de membresías/recordatorios (Usuarios, Clases, Asistencia, etc.) pueden seguir requiriendo backend
- Los datos se reinician al cerrar sesión demo o recargar tras logout
- La lógica mock es simplificada respecto al backend (no replica todos los edge cases de renovación)
