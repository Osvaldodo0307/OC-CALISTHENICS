# Respaldo manual de Supabase (OC Club)

Procedimiento para crear un respaldo local **antes** de importaciones históricas u otros cambios destructivos en producción.

**No versionar** credenciales ni archivos de respaldo en Git.

---

## Requisitos

| Requisito | Notas |
|-----------|--------|
| **Supabase CLI** | [Instalación](https://supabase.com/docs/guides/cli/getting-started) — debe estar en `PATH` |
| **Docker Desktop** | `supabase db dump` ejecuta `pg_dump` dentro de un contenedor |
| **Connection string** | URI PostgreSQL del proyecto OC-CALISTHENICS |

---

## Configurar credenciales (sin pegar en el chat)

### Opción A — archivo local (recomendado)

```powershell
cd OC\BACKEND
copy .env.backup.local.example .env.backup.local
```

Edita `.env.backup.local` y define **solo**:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

Obtén la URL en: **Supabase Dashboard → Settings → Database → Connection string → URI**.

### Opción B — variable de entorno (sesión actual)

```powershell
$env:DATABASE_URL = "postgresql://..."
```

La variable de entorno tiene **prioridad** sobre `.env.backup.local`.

---

## Ejecutar respaldo

```powershell
cd OC\BACKEND
.\.venv\Scripts\python.exe scripts\supabase_manual_backup.py
```

### Qué hace el script

1. Lee `DATABASE_URL` (entorno o `.env.backup.local`).
2. Crea carpeta `backups/supabase/YYYY-MM-DD_HHMMSS/`.
3. Ejecuta:
   - `supabase db dump ... -f roles.sql --role-only`
   - `supabase db dump ... -f schema.sql`
   - `supabase db dump ... -f data.sql --use-copy --data-only`
4. Verifica que los tres archivos existen y no están vacíos.
5. Genera ZIP: `backups/supabase/oc-calisthenics_backup_YYYY-MM-DD_HHMMSS.zip`
6. Escribe `BACKUP_MANIFEST.txt` en la carpeta del respaldo.

**Seguridad:** el script **no imprime** la URL completa; solo muestra `host:puerto/base`.

### Opciones

```powershell
# Directorio de salida personalizado
.\.venv\Scripts\python.exe scripts\supabase_manual_backup.py --output-dir backups\supabase\manual-test

# Sin ZIP (solo SQL en carpeta)
.\.venv\Scripts\python.exe scripts\supabase_manual_backup.py --skip-zip
```

---

## Verificar el respaldo

Tras ejecutar, confirma:

- [ ] Carpeta con fecha/hora en `OC/BACKEND/backups/supabase/`
- [ ] `roles.sql`, `schema.sql`, `data.sql` con tamaño > 0
- [ ] ZIP creado (salvo `--skip-zip`)
- [ ] `BACKUP_MANIFEST.txt` con tamaños en bytes

Abre el ZIP en un lugar seguro (disco local cifrado, nube privada del admin).

---

## Restaurar (solo referencia — emergencia)

Documentación oficial: [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

Orden típico de restauración en una base **vacía** de destino:

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command "SET session_replication_role = replica" \
  --file data.sql \
  --dbname "[CONNECTION_STRING_DESTINO]"
```

**No restaurar en producción** sin ventana de mantenimiento y prueba previa en staging.

---

## Relación con importación noviembre 2025

Antes del commit del paquete seguro:

1. Ejecutar este respaldo.
2. Confirmar ZIP válido.
3. Luego preview/commit según `docs/OCCALISTHENICS_NOVIEMBRE_2025_PRODUCTION_IMPORT.md`.

El script `scripts/prod_safe_noviembre_import.py` exige `--confirm-backup` para commit local con `DATABASE_URL`.

---

## Solución de problemas

| Error | Acción |
|-------|--------|
| `Supabase CLI no encontrado` | Instalar CLI y reiniciar terminal |
| `Docker` / `Cannot connect to the Docker daemon` | Iniciar Docker Desktop |
| `DATABASE_URL no definida` | Crear `.env.backup.local` o exportar variable |
| `connection refused` / timeout | Probar URL directa `:5432` vs pooler `:6543` |
| `Archivo vacio` | Revisar permisos de la URL; usar usuario `postgres` con contraseña de DB |

---

## Archivos excluidos de Git

- `.env.backup.local`
- `OC/BACKEND/backups/`

Nunca hacer `git add` de respaldos ni del archivo de credenciales.
