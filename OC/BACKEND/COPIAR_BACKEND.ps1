# Script para copiar el backend a una carpeta limpia para Render
# Ejecutar como Administrador si hay problemas de permisos

# Rutas basadas en la ubicación del script (portables entre PCs)
$origen = $PSScriptRoot
$destino = Join-Path (Split-Path $PSScriptRoot -Parent) "BACKEND_RENDER"

Write-Host "Copiando archivos del backend..." -ForegroundColor Cyan

# Crear carpeta destino si no existe
if (-not (Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Write-Host "Carpeta creada: $destino" -ForegroundColor Green
}

# Copiar archivos excluyendo venv, __pycache__, .db, .pyc
$excluir = @("venv", "__pycache__", "*.db", "*.pyc", ".git", ".env")
Get-ChildItem -Path $origen -Recurse | Where-Object {
    $excluirItem = $false
    foreach ($patron in $excluir) {
        if ($_.FullName -like "*\$patron\*" -or $_.Name -like $patron) {
            $excluirItem = $true
            break
        }
    }
    -not $excluirItem
} | Copy-Item -Destination {
    $_.FullName.Replace($origen, $destino)
} -Force

Write-Host "`n¡Archivos copiados exitosamente!" -ForegroundColor Green
Write-Host "Ubicación: $destino" -ForegroundColor Cyan
Write-Host "`nAhora puedes subir esta carpeta a GitHub y conectar con Render" -ForegroundColor Yellow
