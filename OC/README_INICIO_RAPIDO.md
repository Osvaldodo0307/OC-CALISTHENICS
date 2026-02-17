# 🚀 Inicio Rápido - OC-CALISTHENICS

## ⚡ Inicio Automático (Recomendado)

### Opción 1: Doble clic (Más Fácil)
1. **Doble clic** en `INICIAR_APP.bat` o `INICIAR_APP.ps1`
2. Espera unos segundos
3. ¡La aplicación se abrirá automáticamente en tu navegador!

### Opción 2: Desde PowerShell
```powershell
.\INICIAR_APP.ps1
```

## 🛑 Detener la Aplicación

### Opción 1: Doble clic
- **Doble clic** en `DETENER_APP.bat` o `DETENER_APP.ps1`

### Opción 2: Manualmente
- Cierra las ventanas de PowerShell que se abrieron
- O presiona `Ctrl+C` en cada una

## 📋 Qué hace el script automático

1. ✅ **Verifica Backend** - Si no está corriendo, lo inicia en puerto 8000
2. ✅ **Verifica Frontend** - Si no está corriendo, lo inicia en puerto 5173
3. ✅ **Importa Ejercicios** - Si no están en la BD, los importa del Excel
4. ✅ **Abre Navegador** - Abre automáticamente la aplicación

## 🔧 Requisitos Previos

- Python 3.8+ instalado
- Node.js y npm instalados
- Dependencias del backend instaladas (se instalan automáticamente si faltan)
- Dependencias del frontend instaladas (se instalan automáticamente si faltan)

## 📍 URLs

Una vez iniciado:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

## 🐛 Solución de Problemas

### Si el backend no inicia:
```powershell
cd BACKEND
python -m uvicorn app.main:app --reload
```

### Si el frontend no inicia:
```powershell
cd Frontend
npm install
npm run dev
```

### Si faltan ejercicios:
```powershell
cd BACKEND
python import_exercises_sql.py
```

## 👤 Credenciales Demo

- **Admin:** `admin` / `admin123`
- **Coach:** `coach1` / `coach123`
- **Socio:** `socio1` / `socio123`
