# QA Report Filling Guide

Guia rapida para completar reportes sin friccion y sin inventar resultados.

## 1) Principios de llenado

1. Si no se ejecuto un caso, marcarlo como `No` / `PENDIENTE`.
2. No escribir `PASS` sin evidencia minima.
3. Si hay fallo real, registrar tambien en `ANDROID_BUG_LOG.md`.
4. Mantener texto corto y accionable.

---

## 2) Ejemplo minimo — QUICK (Sesion 01/02)

Usar en:
- `QA_SESSION_01_QUICK.md`
- `QA_SESSION_02_QUICK.md`

### Ejemplo de campos

```text
Fecha: 2026-03-12
Tester: Ana M.
Build evaluada: 1.3.1-internal / 100301
Dispositivo: Pixel 6 / Android 14
Entorno backend: QA
Red usada: Wi-Fi
```

### Ejemplo de checklist

```text
[x] AUTH-01 Login valido
[x] AUTH-03 Logout
[ ] AUTH-05 Token vencido (pendiente)
```

### Ejemplo de bug observado

```text
Bug ID: AND-014
Caso QA: RES-02
Severidad: S2
Resumen: Cancelar reserva no refresca lista al primer intento.
Evidencia: video_res02_2026-03-12.mp4
Estado: Open
```

### Ejemplo de cierre de sesion

```text
Resultado sesion: FAIL
GO para siguiente sesion: Si
GO para prueba interna Android: No
Siguiente accion inmediata: Juan / corregir refresh en RES-02 / 2026-03-12
```

---

## 3) Ejemplo minimo — FULL (Sesion 03)

Usar en:
- `QA_SESSION_03_FULL.md`

### Ejemplo de resultado ejecutivo

```text
Resultado general: PASS CON RESERVAS
¿Hubo S1?: No
¿Hubo S2 criticos?: Si
¿Se recomienda GO para prueba interna Android?: No
Resumen breve:
Se ejecuto auth y flujo socio principal. Login/persistencia ok.
Se detecto falla S2 en cancelacion de reservas intermitente.
Back button y offline pasaron.
```

### Ejemplo de fila en casos ejecutados

```text
ID: CLS-02
Ejecutado: Si
Resultado: PASS
Severidad si falla: S2
Evidencia: cap_cls02_ok.png
Notas: Sin doble envio detectado.
```

### Ejemplo de detalle por bug

```text
BUG-001 - Cancelacion no refresca
Severidad: S2
Modulo: Reservas
Pasos:
1) Abrir reservas
2) Cancelar reserva activa
3) Observar lista
Esperado: lista actualizada al instante
Observado: en algunos intentos no actualiza hasta refrescar manual
Impacto: degrada confiabilidad del flujo
Decision: Bloquea
```

---

## 4) Ejemplo minimo — QA_ROUND_SUMMARY

Usar en:
- `QA_ROUND_SUMMARY.md`

### Ejemplo de bloques probados

```text
Builds probadas:
- 1.3.1-internal (100301) commit abc123
- 1.3.1-internal (100301) commit def456 (post-fix)

Sesiones ejecutadas:
- Session-01 QUICK: FAIL
- Session-02 QUICK: PASS CON RESERVAS
- Session-03 FULL: FAIL
```

### Ejemplo de bugs/severidades

```text
Total bugs: 3
S1 abiertos: 0
S2 abiertos: 1
S3 abiertos: 1
S4 abiertos: 0
Bugs cerrados/verificados: 1
```

### Ejemplo de decision final

```text
Estado final: NO-GO
Motivo:
Persisten bugs S2 en reservas que afectan confianza operativa.
Auth y navegacion base estables.
Se requiere fix + smoke final completo para cambiar a GO.
```

---

## 5) Checklist de calidad antes de cerrar cualquier reporte

- [ ] Build y dispositivo claramente identificados.
- [ ] Casos no ejecutados marcados como pendientes.
- [ ] Evidencia asociada a casos FAIL.
- [ ] Bugs cargados en `ANDROID_BUG_LOG.md`.
- [ ] Decision GO/NO-GO coherente con severidades.

