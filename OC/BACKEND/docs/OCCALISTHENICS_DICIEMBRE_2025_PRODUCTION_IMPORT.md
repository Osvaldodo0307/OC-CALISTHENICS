# Importación productiva OCCALISTHENICS — diciembre 2025 (Fase 2B.8)

Preparación controlada del segundo lote histórico. **Sin commit productivo** en esta fase.

## Estado

| Paso | Estado |
|------|--------|
| Transformación matriz diciembre | **OK** — `OCCALISTHENICS_clean_diciembre_2025.csv` |
| Review manual automatizado | **OK** — `OCCALISTHENICS_review_diciembre_2025.csv` |
| Paquete seguro | **OK** — 4 filas |
| Paquete pendiente | **OK** — 28 filas |
| Preview local (sin commit) | **OK** — `scripts/validate_diciembre_closure.py` |
| Commit producción | **PENDIENTE** — requiere Go/No-Go + respaldo |

**Noviembre (lote #1):** no reimportar. Referencias `OCCALISTHENICS:NOVIEMBRE 2025:*` ya committed.

---

## Resumen numérico

| Métrica | Valor |
|---------|-------|
| Filas review total | 32 |
| `include=true` en review | 5 |
| `include=false` en review | 27 |
| **Paquete seguro** | **4** |
| **Paquete pendiente** | **28** |
| Ingresos estimados seguros | **$3,285.00** |
| Ingresos brutos matriz (13 pagos) | $10,055.50 |
| Socios procesados en hoja | 34 |
| Teléfonos ausentes (todos) | 34 |
| Teléfonos desde contacts_master | 0 (`contacts_master.csv` vacío) |

---

## Archivos locales (repo público)

El repositorio `Osvaldodo0307/OC-CALISTHENICS` es **público**. Los CSV productivos con nombres y montos reales **no se versionan**:

- `fixtures/OCCALISTHENICS_prod_safe_diciembre_2025.csv` (local, en `.gitignore`)
- `fixtures/OCCALISTHENICS_prod_pending_review_diciembre_2025.csv` (local, en `.gitignore`)

Plantillas anonimizadas en Git: `*.csv.example`. Regenerar paquetes con `scripts/build_prod_diciembre_packages.py`.

---

## Paquete seguro — `fixtures/OCCALISTHENICS_prod_safe_diciembre_2025.csv`

| Socio | Monto | Plan | Coincide noviembre prod | Match esperado |
|-------|-------|------|-------------------------|----------------|
| VALERIA QUINTANA | $945.00 | PLAN OC | Sí | `existing` |
| ARLETTE ROMÁN | $945.00 | PLAN OC | Sí | `existing` |
| RODRIGO ALVA | $995.00 | PLAN OC | Sí | `existing` |
| OSVALDO | $400.00 | OPEN GYM | No | `new` |

**Método:** `historico_sin_metodo`  
**Fuente:** `OCCALISTHENICS`  
**Periodo:** 2025-12-01 → 2025-12-31  
**Referencias:** únicas, prefijo `OCCALISTHENICS:DICIEMBRE 2025:`

### Excluido del seguro aunque review `include=true`

| Socio | Motivo |
|-------|--------|
| URIEL CARDIEL | Sobrepago no explicado ($1,890.02 vs costo $171.82); política explícita no importar |

---

## Paquete pendiente — `fixtures/OCCALISTHENICS_prod_pending_review_diciembre_2025.csv`

28 registros con columnas de diagnóstico: `pending_reason`, `warning_flags`, `costo_plan`, `review_include`.

### Motivos principales de exclusión

| Motivo | Cantidad aprox. |
|--------|-----------------|
| `sin_pago_detectado` (monto $0) | 19 |
| `sobrepago_extremo` / `plan_no_mapeado_monto_extrano` | 6 |
| `fila_auxiliar_no_socio` | 4 (APRIL, PRIMA CHARLIE, HERMANA LIRIA) |
| Sobrepago POR CHECK IN (TOÑITO) | 1 |
| URIEL CARDIEL (validación humana) | 1 |

### Socios noviembre sin pago en diciembre (pendientes, no importar)

LIRIA VILLEGAS, PEDRO FLORES, LUIS ALBERTO, TOÑITO OSNAYA — aparecen con `sin_pago_detectado` en diciembre (adeudo posible, no pago histórico).

---

## Preview local (Fase 2B.8)

```powershell
cd OC\BACKEND
.\.venv\Scripts\python.exe scripts\build_occalisthenics_review.py --tag clean_diciembre_2025
.\.venv\Scripts\python.exe scripts\build_prod_diciembre_packages.py
.\.venv\Scripts\python.exe scripts\validate_diciembre_closure.py
.\.venv\Scripts\python.exe scripts\prod_safe_diciembre_import.py --preview
```

### Resultado preview paquete seguro

| Campo | Valor |
|-------|-------|
| total_rows | 4 |
| error_rows | 0 |
| duplicate_rows | 0 |
| ambiguous_members | 0 |
| existing_members | 3 |
| new_members | 1 (OSVALDO) |
| estimated_real_income | $3,285.00 |
| blocking_errors | false |
| warning_rows | 4 (`missing_phone` en todas) |

**Comportamiento esperado post-commit (fase posterior):**

- VALERIA / ARLETTE / RODRIGO: ciclo histórico dic-2025 + pago; **sin** vigencia operativa activa.
- OSVALDO: usuario nuevo + ciclo histórico.
- Ciclos con `is_historical_import=true`, `is_active_cycle=false`.

---

## Go / No-Go

**Recomendación actual:** **Diciembre listo para preview productivo**

Condiciones antes de commit:

1. Preview en UI producción con `OCCALISTHENICS_prod_safe_diciembre_2025.csv`.
2. Confirmar match por nombre de VALERIA / ARLETTE / RODRIGO (sin teléfono).
3. Respaldo Supabase previo al commit (lote #2).
4. URIEL y pendientes siguen fuera del CSV seguro.

**No importar todavía:** URIEL, filas pendientes, re-import noviembre, lote #1.

---

## Scripts

| Script | Uso |
|--------|-----|
| `scripts/build_prod_diciembre_packages.py` | Genera safe + pending |
| `scripts/validate_diciembre_closure.py` | Preview + diagnóstico duplicados |
| `scripts/prod_safe_diciembre_import.py` | Wrapper preview/commit (commit bloqueado en 2B.8) |
