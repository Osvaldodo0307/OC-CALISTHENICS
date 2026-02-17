# Script para detener todos los servidores
Write-Host "Deteniendo servidores..." -ForegroundColor Yellow

# Detener procesos de uvicorn (backend)
Get-Process | Where-Object { $_.ProcessName -eq "python" -or $_.ProcessName -eq "pythonw" } | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -like "*uvicorn*" -or $cmdLine -like "*app.main*") {
            Write-Host "Deteniendo backend (PID: $($_.Id))..." -ForegroundColor Cyan
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

# Detener procesos de node (frontend)
Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -like "*vite*" -or $cmdLine -like "*npm*") {
            Write-Host "Deteniendo frontend (PID: $($_.Id))..." -ForegroundColor Cyan
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

# Detener procesos en puertos específicos
$ports = @(8000, 5173, 5174)
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port.*LISTENING"
    foreach ($conn in $connections) {
        $pid = ($conn -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Write-Host "Deteniendo proceso en puerto $port (PID: $pid)..." -ForegroundColor Cyan
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Servidores detenidos." -ForegroundColor Green
Start-Sleep -Seconds 2
