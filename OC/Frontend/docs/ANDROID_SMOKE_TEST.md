# ANDROID_SMOKE_TEST

Smoke test ultracorto para correr despues de cada fix.

Build objetivo: `1.3.1-internal (100301)`.

## Casos criticos (maximo 10)

1. **SMK-01 Login valido**
   - Esperado: acceso a flujo privado.
2. **SMK-02 Persistencia de sesion**
   - Esperado: cerrar/reabrir app mantiene sesion valida.
3. **SMK-03 Token invalido**
   - Esperado: limpia sesion y redirige a login.
4. **SMK-04 Clases carga**
   - Esperado: lista/empty/error state sin pantalla en blanco.
5. **SMK-05 Reservar/cancelar**
   - Esperado: feedback claro y bloqueo de doble envio.
6. **SMK-06 Offline**
   - Esperado: banner offline + mensaje de error claro.
7. **SMK-07 Retry**
   - Esperado: boton retry recupera estado al volver red/API.
8. **SMK-08 Back button Android**
   - Esperado: retroceso correcto y salida controlada.
9. **SMK-09 Logout**
   - Esperado: limpieza completa de sesion y vuelta a login.
10. **SMK-10 Arranque limpio**
    - Esperado: apertura sin crash ni loops de redireccion.

## Criterio rapido PASS/FAIL

- **PASS:** 10/10 casos correctos.
- **FAIL:** cualquier falla en SMK-01/02/03/05/08.

## Registro corto de ejecucion

| Fecha | Build | Dispositivo | Casos PASS | Casos FAIL | Resultado |
|---|---|---|---|---|---|
| YYYY-MM-DD | 1.3.1-internal (100301) | | | | PASS/FAIL |

