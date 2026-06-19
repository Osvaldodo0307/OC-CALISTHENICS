# Diagnóstico — archivo real OCCALISTHENICS.xlsx

**Fecha:** junio 2026  
**Archivo:** `OC/BACKEND/fixtures/OCCALISTHENICS.xlsx`  
**Acción:** solo preview / diagnóstico — **sin commit**, sin producción.

---

## Conclusión ejecutiva

| Pregunta | Respuesta |
|----------|-----------|
| ¿El archivo real es compatible con el importador actual tal cual? | **No** |
| ¿Se puede importar directo desde `/app/admin/importar-pagos`? | **No** |
| ¿Recomendación? | **No importar todavía** — requiere transformación previa |
| ¿Estrategia recomendada? | **Importar por hoja y por mes**, tras convertir matriz → filas de pago |

El archivo es una **matriz operativa de control mensual** (una fila por socio, columnas por mes), no un listado de pagos en formato largo. Las hojas `ENERO 2026` en adelante tienen **otra estructura** (visitas), distinta a `NOVIEMBRE/DICIEMBRE 2025`.

---

## 1. Hojas detectadas

| Hoja | Filas totales | Socios (col. NOMBRE) | Estructura |
|------|---------------|----------------------|------------|
| NOVIEMBRE 2025 | 344 | ~31 | Matriz membresías + meses |
| DICIEMBRE 2025 | 443 | ~39 | Matriz membresías + meses |
| ENERO 2026 | 484 | 0 | Matriz de visitas (OCT–ENE) |
| FEBRERO 2026 | 522 | 0 | Layout distinto |
| MARZO 2026 | 648 | 0 | Layout distinto |
| ABRIL 2026 | 421 | 0 | Layout distinto |

**Preview directo (`pilot_historical_import.py`):** `can_preview = false` en **todas** las hojas.

---

## 2. Columnas reales (hojas NOVIEMBRE / DICIEMBRE)

Encabezado en **fila 2** del Excel (fila 1 = título `OCCALISTHENICSMX`):

| Col | Etiqueta real | Interpretación |
|-----|---------------|----------------|
| A (0) | NOMBRE | Nombre del socio |
| B (1) | *(número interno)* | ID / consecutivo |
| C (2) | MEMBRESIA | Monto parcial o abono (no siempre = pago del mes) |
| D (3) | COSTO PLAN | Costo mensual del plan |
| E (4) | TIPO DE PLAN | Plan (`PLAN OC`, `WELLHUB`, `12 CLASES`, etc.) |
| F+ | `2025-09-01`, `2025-10-01`, … | **Pago del mes** (monto o 0) |
| … | SAUNA, OPEN GYM, 5 VISITAS | Flags de servicios (✅/❌) |
| … | CLASES, CLASES POR DIA | Configuración de clases |

### Columnas no presentes en archivo real

- `telefono` / Celular
- `metodo_pago` / Forma de pago
- `fecha_pago` por fila (la fecha está en encabezado de columna)
- `payment_action`
- `referencia_externa` / Folio
- `nota` estructurada (solo flags y montos)

---

## 3. Mapeo sugerido (archivo crudo → campos internos)

| Columna real | Campo interno | Confianza | Confirmación manual |
|--------------|---------------|-----------|-------------------|
| NOMBRE | `socio_nombre` | **Alta** | No |
| *(no existe)* | `telefono` | — | Sí — completar fuera del archivo |
| TIPO DE PLAN | `plan` | **Alta** | No |
| Encabezado mes (`2025-11-01`) | `fecha_pago` | **Media** | Sí — asumir día 1 del mes |
| Encabezado mes | `periodo_inicio` | **Media** | Sí |
| Fin de mes calculado | `periodo_fin` | **Media** | Sí |
| Celda mes (monto) | `monto_pagado` | **Alta** | Sí — validar 0, X, 1890.02, etc. |
| *(no existe)* | `metodo_pago` | — | **Sí — obligatorio** |
| COSTO PLAN − monto | `saldo_pendiente` | **Media** | Sí |
| MEMBRESIA | *(referencia)* | **Baja** | Sí — no es pago directo |
| SAUNA / OPEN GYM / CLASES | *(no importar)* | — | Ignorar en fase pagos |
| *(no existe)* | `payment_action` | — | Sí — default `register_only` |
| *(no existe)* | `referencia_externa` | — | Sí — generar al transformar |

---

## 4. Calidad de datos (archivo crudo)

| Métrica | NOVIEMBRE 2025 | DICIEMBRE 2025 |
|---------|----------------|----------------|
| Filas totales | 344 | 443 |
| Filas válidas para import directo | **0** | **0** |
| Errores bloqueantes | 344 (sin columnas obligatorias) | 443 |
| Socios sin teléfono | **100%** | **100%** |
| Método de pago | **No registrado** | **No registrado** |
| Fechas | En encabezados de columna | En encabezados |
| Montos inválidos | `X`, `✅`, `0` mezclados | Igual |
| Casos detectados | Pago 0 = vencido; parcial (EDIT 630); WELLHUB | Toñito dic `1890.02` (revisar) |

### Casos de negocio observados en datos reales

| Socio | Caso |
|-------|------|
| TOÑITO OSNAYA | Al corriente (945/mes) |
| LIRIA VILLEGAS | MEMBRESIA=0, pagos 945 |
| FERNANDA ALVA | Noviembre monto=0 (vencido) |
| URIEL. CARDIEL | WELLHUB, meses en 0 |
| EDIT | Plan `12 CLASES`, pagos parciales (630) |
| RODRIGO / FERNANDA ALVA | Mismo apellido, socios distintos |
| LUIS ALBERTO | Varios meses pagados |

---

## 5. Preview archivo crudo (sin transformar)

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py --file fixtures\OCCALISTHENICS.xlsx --sheet "NOVIEMBRE 2025"
```

**Resultado:** bloqueado — columnas `0..105` numéricas, sin mapeo a plantilla.

---

## 6. Lote piloto real transformado

Archivo generado (transformación manual asistida por script, **no commit**):

`OC/BACKEND/fixtures/OCCALISTHENICS_real_piloto.csv` (10 filas)

Script: `scripts/build_real_pilot_from_occalisthenics.py`

### Preview del lote piloto

| Métrica | Valor |
|---------|-------|
| Filas | 10 |
| Mapeo plantilla | **100% automático** |
| Errores | **10** (`metodo_pago` vacío — no existe en fuente) |
| Advertencias | **10** (sin teléfono) |
| Importables sin corrección | **0** |
| Ingresos estimados | $0 (bloqueado por errores) |

**Registros que podrían importarse** tras completar `metodo_pago` manualmente (o regla acordada con admin).

**Registros que deben corregirse antes:**

- Todas las filas: `metodo_pago` obligatorio
- Todas las filas: `telefono` recomendado (match más seguro)
- FERNANDA ALVA nov: monto=0 — decidir si importar como histórico sin pago
- Validar montos atípicos (ej. 1890.02 en diciembre)

---

## 7. Correcciones necesarias antes de importar histórico completo

1. **Transformar matriz → CSV plantilla** (unpivot: 1 fila por socio × mes con monto > 0).
2. **Completar `metodo_pago`** — el archivo fuente no lo tiene; definir política (ej. default `efectivo` solo con confirmación admin).
3. **Agregar teléfonos** desde otra fuente (WhatsApp, lista socios).
4. **Importar por hoja/mes:** empezar con `NOVIEMBRE 2025` y `DICIEMBRE 2025`; **no** mezclar con hojas de visitas (ENE–ABR 2026).
5. **Normalizar planes:** `WELLHUB`, `12 CLASES`, `PLAN OC` → mapear a planes del sistema.
6. **Revisar montos** `X`, 0, decimales raros antes de commit.
7. **Generar `referencia_externa`** estable por socio+mes.

---

## 8. Archivos de apoyo generados

| Archivo | Propósito |
|---------|-----------|
| `fixtures/OCCALISTHENICS_inspection.json` | Inspección estructural |
| `fixtures/OCCALISTHENICS_structure.json` | Headers y muestras |
| `fixtures/OCCALISTHENICS_sheets_summary.json` | Resumen por hoja |
| `fixtures/OCCALISTHENICS_real_piloto.csv` | Lote 10 filas transformado |
| `fixtures/preview_real_piloto.txt` | Salida preview piloto |
| `scripts/inspect_real_import_file.py` | Diagnóstico estructural |
| `scripts/build_real_pilot_from_occalisthenics.py` | Generar piloto CSV |

---

## 9. Recomendación final

### No importar todavía

El importador actual funciona con **formato plantilla** (una fila = un pago). El archivo real del gimnasio es un **formato matriz** incompatible sin ETL previo.

### Próximo paso sugerido

1. Revisar este reporte con el admin del gym.
2. Completar `metodo_pago` y teléfonos en `OCCALISTHENICS_real_piloto.csv`.
3. Re-ejecutar preview del piloto (sin `--commit`).
4. Si preview limpio → commit piloto en **staging local**.
5. Diseñar transformador automático matriz→plantilla (fase posterior, fuera de este alcance).
