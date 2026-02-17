# Solución para Error de Permisos con esbuild en Windows

## Problema
Error: `spawn EPERM` al intentar iniciar el servidor de desarrollo de Vite.

## Soluciones Recomendadas

### Solución 1: Ejecutar como Administrador
1. Abrir PowerShell como Administrador
2. Navegar al directorio del frontend
3. Ejecutar `npm run dev`

### Solución 2: Agregar excepción en Windows Defender
1. Abrir Windows Defender
2. Ir a "Protección contra virus y amenazas"
3. Agregar excepción para la carpeta del proyecto

### Solución 3: Reinstalar esbuild
```powershell
cd Frontend
npm uninstall esbuild
npm install esbuild --save-dev
```

### Solución 4: Usar una versión diferente de Vite
```powershell
cd Frontend
npm install vite@4.5.0 --save-dev
```

### Solución 5: Usar variables de entorno
```powershell
$env:ESBUILD_BINARY_PATH=""
npm run dev
```

## Estado Actual
- ✅ Backend funcionando en http://127.0.0.1:8000
- ❌ Frontend bloqueado por error de permisos de esbuild
