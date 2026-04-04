# MOBILE_TEST_MATRIX

> Matriz orientada a ejecucion por sesiones de QA Android.  
> Estado actual: los casos de app en dispositivo siguen **PENDIENTES** hasta corrida manual.

## Sesion 0 — Gate tecnico previo

- [ ] OPS-01 Build web (`npm run build`)
- [ ] OPS-02 Build movil (`npm run mobile:build`)
- [ ] OPS-03 Sync movil (`npm run mobile:sync`)
- [ ] OPS-04 Doctor (`npm run mobile:doctor`)

## Sesion 1 — Autenticacion critica (alta prioridad)

- [ ] AUTH-01 Login valido
- [ ] AUTH-02 Login invalido
- [ ] AUTH-03 Logout
- [ ] AUTH-04 Sesion persistente
- [ ] AUTH-05 Token vencido
- [ ] AUTH-06 Token corrupto
- [ ] AUTH-07 Navegacion protegida sin token

## Sesion 2 — Modulos socio criticos (alta prioridad)

- [ ] CLS-01 Carga de clases
- [ ] CLS-02 Reservar clase (sin doble envio)
- [ ] CLS-03 Cancelar reserva desde clases
- [ ] RES-01 Carga de reservas
- [ ] RES-02 Cancelar desde reservas

## Sesion 3 — Perfil y plan

- [ ] PER-01 Perfil con campos opcionales
- [ ] PLAN-01 Mi plan sin contenido
- [ ] PLAN-02 Mi plan con contenido
- [ ] RUT-01 Rutinas en socio (flujo a Mi Plan)

## Sesion 4 — Conectividad y ciclo de vida (alta prioridad)

- [ ] NET-01 Offline
- [ ] NET-02 API caida
- [ ] NET-03 Cambio de red
- [ ] APP-01 Reanudacion app desde background
- [ ] APP-02 Back button Android

## Sesion 5 — Cobertura secundaria

- [ ] RUT-02 Rutinas en coach

---

## Registro de resultados por caso

| ID | Modulo | Precondicion | Pasos | Resultado esperado | Resultado observado | Estatus | Notas |
|---|---|---|---|---|---|---|---|
| AUTH-01 | Login | Usuario valido | Abrir app -> login -> enviar credenciales correctas | Entra a flujo privado segun rol | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-02 | Login | Usuario invalido | Enviar credenciales incorrectas | Muestra error entendible sin romper pantalla | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-03 | Logout | Sesion activa | Tap en Salir | Limpia sesion y redirige a login | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-04 | Sesion persistente | Sesion activa | Cerrar app y abrir de nuevo | Sesion restaurada o revalidada | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-05 | Token vencido | Token expirado | Abrir/reanudar app | Limpia sesion y redirige a login | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-06 | Token corrupto | Storage alterado | Forzar token invalido en storage y abrir app | Limpieza y redirect limpio | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| AUTH-07 | Ruta protegida | Sin token | Intentar ir a `/app/clases` | Redirecciona a `/app/login` | Validado por codigo | PARCIAL | Validar runtime Android |
| CLS-01 | Clases | Sesion socio | Abrir `/app/clases` | Lista o estado vacio/error claro | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| CLS-02 | Clases | Clase disponible | Tap reservar una vez | Reserva creada y boton bloqueado en envio | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| CLS-03 | Clases | Clase reservada | Tap cancelar y confirmar | Cancela y refresca datos | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| RES-01 | Reservas | Sesion socio | Abrir `/app/reservas` | Lista estable o empty state | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| RES-02 | Reservas | Reserva activa | Tap cancelar y confirmar | Cancela sin doble envio | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| PER-01 | Perfil | Usuario sin telefono/membresia | Abrir `/app/perfil` | Render estable con campos opcionales | No ejecutado en dispositivo | PENDIENTE | Media |
| PLAN-01 | Mi plan | Usuario sin plan | Abrir `/app/mi-plan` | Empty state claro | No ejecutado en dispositivo | PENDIENTE | Media |
| PLAN-02 | Mi plan | Usuario con plan | Abrir `/app/mi-plan` | Secciones legibles por semana | No ejecutado en dispositivo | PENDIENTE | Media |
| RUT-01 | Rutinas socio | Usuario socio | Abrir `/app/rutinas` | Mensaje limpio y CTA a Mi Plan | No ejecutado en dispositivo | PENDIENTE | Media |
| RUT-02 | Rutinas coach | Usuario coach | Generar rutina en ambas tabs | Feedback de exito/error y bloqueo en envio | No ejecutado en dispositivo | PENDIENTE | Baja |
| NET-01 | Red | App con sesion | Cortar internet | Banner offline + mensajes claros | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| NET-02 | Red | Backend apagado | Abrir modulos socio | Error state con retry | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| NET-03 | Red | App abierta | Cambiar wifi/datos | Reconexion sin crash | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| APP-01 | Ciclo app | Sesion activa | Background -> foreground | Revalida sesion | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| APP-02 | Android | Ruta interna | Pulsar back varias veces | Retroceso correcto y salida controlada | No ejecutado en dispositivo | PENDIENTE | Alta prioridad |
| OPS-01 | Build web | Repo actualizado | `npm run build` | Build exitoso | OK | PASS | Ejecutado |
| OPS-02 | Build movil | Repo actualizado | `npm run mobile:build` | Build exitoso | OK | PASS | Ejecutado |
| OPS-03 | Sync movil | Repo actualizado | `npm run mobile:sync` | Sync android/ios exitoso | OK | PASS | Ejecutado |
| OPS-04 | Doctor | Repo actualizado | `npm run mobile:doctor` | Android OK, iOS depende Xcode | Android OK / iOS KO (sin Xcode) | PARCIAL | Bloqueo de entorno |

