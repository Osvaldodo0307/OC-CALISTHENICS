# Transformación matriz OCCALISTHENICS → plantilla importador

Fase 2B.3 — convertir `OCCALISTHENICS.xlsx` (formato matriz) a CSV compatible con el importador histórico.

**Sin commit. Sin escritura en BD. Sin producción.**

---

## Por qué no se importa el Excel directo

El archivo del gimnasio es una **matriz operativa**:

- 1 fila = 1 socio
- Columnas con fechas (`2025-11-01`, …) = montos del mes
- Sin teléfono, sin método de pago, sin folio por pago

El importador espera **formato largo** (1 fila = 1 pago) con columnas plantilla.

---

## Script transformador

```powershell
cd "c:\Proyectos personales\APP GIMNASIO\OC\OC\BACKEND"

# Noviembre 2025 (todas las columnas-mes de la hoja)
.\.venv\Scripts\python.exe scripts\transform_occalisthenics_matrix.py `
  --sheet "NOVIEMBRE 2025" `
  --default-method historico_sin_metodo

# Diciembre 2025
.\.venv\Scripts\python.exe scripts\transform_occalisthenics_matrix.py `
  --sheet "DICIEMBRE 2025" `
  --default-method historico_sin_metodo

# Solo un mes concreto
.\.venv\Scripts\python.exe scripts\transform_occalisthenics_matrix.py `
  --sheet "NOVIEMBRE 2025" --month 2025-11 `
  --default-method historico_sin_metodo
```

### Salidas generadas (por hoja)

| Archivo | Contenido |
|---------|-----------|
| `fixtures/OCCALISTHENICS_transformed_{hoja}.csv` | CSV plantilla |
| `fixtures/OCCALISTHENICS_transform_report_{hoja}.json` | Resumen numérico |
| `fixtures/OCCALISTHENICS_transform_warnings_{hoja}.csv` | Advertencias fila a fila |

Slug de hoja: `NOVIEMBRE 2025` → `noviembre_2025`

---

## Reglas de transformación

### Monto positivo

- Crea fila de pago
- `payment_action=renew_extend` (o `partial_debt` si monto < costo plan)
- `counts_as_income=true`, `applies_to_balance=true`

### Monto 0

- **No** crea pago
- Reporte: `sin_pago_detectado`
- Si hay `COSTO PLAN`, se registra adeudo **solo como advertencia**

### Celda vacía

- Ignorar (no es adeudo automático)

### `X`, ✅, ❌, texto

- No crear pago
- Advertencia `valor_no_numerico`

### Monto < COSTO PLAN

- `payment_action=partial_debt`
- `saldo_pendiente = costo - monto`
- Advertencia `pago_parcial`

### Monto > COSTO PLAN

- Crea pago con advertencia `sobrepago` (no divide periodos automáticamente)

---

## Método de pago ausente en fuente

El Excel **no registra** forma de pago. **No** se usa `efectivo` por defecto.

Opción recomendada al transformar:

```text
--default-method historico_sin_metodo
```

### Método `historico_sin_metodo`

- Solo para importación histórica
- **No** equivale a efectivo, transferencia ni tarjeta
- Debe distinguirse en reportes y expediente (campo `metodo_pago` + nota)
- No usar para pagos operativos actuales del panel

Si **no** se pasa `--default-method`, `metodo_pago` queda vacío y el preview del importador **bloqueará** hasta corrección manual.

---

## Teléfonos ausentes

- `telefono` vacío por defecto
- Advertencia global por socio sin contacto

### Archivo opcional de contactos

`fixtures/contacts_master.csv`:

```csv
socio_nombre,telefono
TOÑITO OSNAYA,5512345678
```

El transformador cruza por nombre normalizado si el archivo existe.

---

## Mapeo de planes

Config: `fixtures/occalisthenics_plan_mapping.json`

Planes como `WELLHUB`, `12 CLASES`, `OPEN GYM` se mapean ahí. Sin entrada → se conserva texto original + advertencia `plan_no_mapeado`.

---

## Referencia externa

Formato determinístico:

```text
OCCALISTHENICS:{hoja}:{socio_normalizado}:{periodo_inicio}
```

Ejemplo: `OCCALISTHENICS:NOVIEMBRE 2025:toñito_osnaya:2025-11-01`

---

## Fecha de pago

- `fecha_pago` = primer día del mes (inferida del encabezado de columna)
- **No** es fecha real de cobro en caja
- Nota automática en cada fila

---

## Hojas soportadas en esta fase

| Hoja | Transformar |
|------|-------------|
| NOVIEMBRE 2025 | Sí |
| DICIEMBRE 2025 | Sí |
| ENERO–ABRIL 2026 | **No** (layout distinto — visitas) |

---

## Flujo recomendado

1. Transformar hoja → CSV + reportes JSON/CSV
2. Revisar `OCCALISTHENICS_transform_warnings_*.csv`
3. (Opcional) Completar `contacts_master.csv` y re-transformar
4. Preview sin commit:

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py `
  --file fixtures\OCCALISTHENICS_transformed_noviembre_2025.csv
```

5. **Solo después de revisión humana** → commit en staging (fase posterior)

---

## Por qué no hacer commit sin revisión

- Método histórico inferido, no observado
- Teléfonos pueden faltar
- Pagos parciales y sobrepagos requieren validación
- Meses con monto 0 no generan fila pero sí adeudo potencial en advertencias
- Planes especiales (`12 CLASES`, `WELLHUB`) pueden no alinearse al catálogo del sistema

---

## Archivos relacionados

- `scripts/transform_occalisthenics_matrix.py`
- `fixtures/occalisthenics_plan_mapping.json`
- `docs/OCCALISTHENICS_REAL_FILE_DIAGNOSIS.md` — diagnóstico inicial
- `docs/HISTORICAL_PAYMENTS_IMPORT.md` — importador general
