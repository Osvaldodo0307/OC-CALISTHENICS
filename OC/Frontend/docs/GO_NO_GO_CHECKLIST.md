# GO_NO_GO_CHECKLIST

## Build de referencia QA Android

- versionName: `1.3.1-internal`
- versionCode: `100301`

## 1) Lista para pruebas internas Android

- Build web: **SI**
- Build movil: **SI**
- Sync Capacitor: **SI**
- Proyecto Android abrible: **SI**
- Flujo auth endurecido en codigo: **SI**
- Matriz de pruebas manual definida: **SI**

**Decision:** GO condicionado a ejecutar matriz en emulador/dispositivo.

## 2) Lista para pruebas con usuarios controlados

- Casos criticos auth probados en dispositivo: **NO (pendiente)**
- Casos clases/reservas probados en red real: **NO (pendiente)**
- Manejo offline validado en runtime real: **NO (pendiente)**
- Errores backend/timeout validados manualmente: **NO (pendiente)**

**Decision:** NO-GO hasta completar matriz prioritaria.

## 3) Lista para preparacion de release tecnico

- Arquitectura movil establecida: **SI**
- Entornos documentados: **SI**
- Notas nativas de desarrollo: **SI**
- Checklist release disponible: **SI**
- iOS toolchain validada: **NO**

**Decision:** GO parcial (Android preparable, iOS pendiente de entorno macOS).

## 4) Lista para fase de publicacion

- QA funcional completa Android: **NO**
- QA funcional iOS: **NO**
- Firma release y pipeline final: **NO**
- Evidencia de smoke tests en dispositivo: **NO**

**Decision:** NO-GO.

