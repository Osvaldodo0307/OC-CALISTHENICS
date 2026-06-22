# Diagnóstico Fase 2B.9 — ENERO 2026 (OCCALISTHENICS)

**Fecha:** junio 2026  
**Archivo:** `fixtures/OCCALISTHENICS.xlsx` → hoja `ENERO 2026`  
**Acción:** solo diagnóstico — **sin preview productivo, sin commit, sin tocar producción**.

---

## Recomendación

**Enero corresponde a asistencias/check-ins** (bloque superior).

El bloque inferior contiene montos que **podrían** interpretarse como pagos de membresía, pero la hoja es **mixta**, el transformador actual **no aplica**, y hay filas agregadas que no son socios. **No importar enero como pagos** con el pipeline actual.

| Veredicto | Aplica |
|-----------|--------|
| Enero puede prepararse como pagos | **No** (sin ETL nuevo + limpieza) |
| Enero requiere limpieza | **Sí** (bloque pagos inferior) |
| Enero no debe importarse como pagos | **Sí** (ahora) |
| Enero corresponde a asistencias/check-ins | **Sí** (bloque superior) |

---

## 1. Tipo de hoja

| Bloque | Filas Excel (aprox.) | Tipo de dato |
|--------|----------------------|--------------|
| **Superior** | 2–39 | **Conteo de visitas** por mes (OCT–ENE) |
| **Inferior** | 42+ | **Matriz de pagos** (estructura similar a nov/dic, columnas desplazadas) |

**Clasificación:** mezcla de **asistencias/visitas** + **pagos de membresía** en la misma hoja.

---

## 2. Estructura detectada

### Bloque 1 — Visitas (superior)

| Elemento | Detalle |
|----------|---------|
| Encabezado fila 2 | `X`, OCTUBRE, NOVIEMBRE, DICIEMBRE, ENERO, Visitas |
| Nombres | Columna **C** (índice 2), no columna A |
| Valores | Enteros pequeños (0–23 típico; total fila ~159) |
| Socios con fila | **36** |
| Interpretación | **Número de visitas/check-ins** por mes, no montos en MXN |

### Bloque 2 — Pagos (inferior)

| Elemento | Detalle |
|----------|---------|
| Título | `OCCALISTHENICSMX` (fila 41) |
| Encabezado | Fila **42**: NOMBRE, MEMBRESIA, COSTO PLAN, TIPO DE PLAN, meses SEP–ENE, SAUNA, OPEN GYM, … |
| Nombres | Columna **L** (índice 11) |
| Socios en bloque | **42** filas con nombre |
| Pagos columna ENERO > 0 | **19** celdas |
| Filas agregadas (no socio) | **4** (`TOTAL`, `MENSUAL`, `TOTAL WELLHUB`, `TOTAL CLASES`) |
| Pagos reales estimados (sin agregados) | **~16** filas, **~$19,812.76** MXN |

---

## 3. Compatibilidad con importador de pagos históricos

| Campo plantilla | Bloque visitas | Bloque pagos |
|-----------------|----------------|--------------|
| `socio_nombre` | Sí (col 2) | Sí (col 11) |
| `fecha_pago` | No | Inferible (`2026-01-01`) |
| `monto_pagado` | **No** (son conteos) | Sí (con limpieza) |
| `metodo_pago` | No | **Ausente** |
| `periodo_inicio` / `periodo_fin` | N/A | Inferible enero 2026 |
| `referencia_externa` | N/A | Generable en ETL |
| `telefono` | Ausente | Ausente |

**`transform_occalisthenics_matrix.py`:** falla en `ENERO 2026` con  
`No se detectaron columnas de mes` (encabezados son nombres de mes, no fechas `YYYY-MM-DD`; nombres no en col 0).

**Conclusión:** **no compatible** con importación de pagos tal cual.

---

## 4. Riesgos

| Riesgo | Severidad |
|--------|-----------|
| Interpretar visitas (ej. 11, 13) como pagos de $11 / $13 | **Crítica** |
| Importar filas `MENSUAL` / `TOTAL WELLHUB` como socios | **Alta** |
| Sobrepagos tipo POR CHECK IN / montos atípicos | Media |
| Sin teléfono → match solo por nombre | Media |
| Socios ya en lotes nov (#1) y dic (#4) | Baja (esperado `existing`) |
| URIEL / pendientes — política vigente | **No importar** |

---

## 5. Estrategia posterior (si se aprueba)

### Si el objetivo es asistencias (bloque superior)

Flujo **separado**, no `importar-pagos`:

1. Definir modelo `attendance` / visitas históricas.
2. ETL: socio + mes + conteo (+ opcional columna Visitas).
3. Preview en módulo de asistencia, no membresías.

### Si el objetivo es pagos enero (bloque inferior)

Solo después de Fase asistencias separada:

1. Extender transformador para hojas 2026 (header fila 42, nombre col 11).
2. Filtrar filas agregadas (`TOTAL*`, `MENSUAL`, …).
3. Review → paquete seguro → paquete pendiente (como nov/dic).
4. Preview local → Go/No-Go → commit productivo lote #N.

**No mezclar** bloque 1 y bloque 2 en un mismo CSV.

---

## 6. Script de diagnóstico

```powershell
cd OC\BACKEND
.\.venv\Scripts\python.exe scripts\diagnose_enero_2026_sheet.py
```

Salida JSON agregada (sin nombres por defecto). `--verbose` solo para uso local.

---

## 7. Restricciones respetadas

- Producción no tocada
- Sin preview productivo
- Sin commit de importación
- Sin CSV productivo
- Sin CSV reales versionados
- Noviembre (#1) y diciembre (#4) no reimportados
