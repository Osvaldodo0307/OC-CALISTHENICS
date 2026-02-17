# Script para copiar el frontend a una carpeta limpia para Netlify
# Ejecutar como Administrador si hay problemas de permisos

# Rutas basadas en la ubicación del script (portables entre PCs)
$origen = Join-Path $PSScriptRoot "Frontend"
$destino = Join-Path $PSScriptRoot "Frontend_NETLIFY"

Write-Host "Copiando archivos del frontend..." -ForegroundColor Cyan

# Crear carpeta destino si no existe
if (-not (Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Write-Host "Carpeta creada: $destino" -ForegroundColor Green
}

# Copiar archivos excluyendo node_modules, dist, .git, .npm-cache
$excluir = @("node_modules", "dist", ".git", ".npm-cache")
Get-ChildItem -Path $origen -Recurse | Where-Object {
    $excluirDir = $false
    foreach ($dir in $excluir) {
        if ($_.FullName -like "*\$dir\*") {
            $excluirDir = $true
            break
        }
    }
    -not $excluirDir
} | Copy-Item -Destination {
    $_.FullName.Replace($origen, $destino)
} -Force

Write-Host "`n¡Archivos copiados exitosamente!" -ForegroundColor Green
Write-Host "Ubicación: $destino" -ForegroundColor Cyan
Write-Host "`nAhora puedes subir esta carpeta directamente a Netlify" -ForegroundColor Yellow
