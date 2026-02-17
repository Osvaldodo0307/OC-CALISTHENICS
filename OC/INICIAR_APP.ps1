# Script para iniciar la aplicacion completa automaticamente
# Doble clic en este archivo o ejecuta: .\INICIAR_APP.ps1

$ErrorActionPreference = "Continue"

# Colores para output
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Rutas - Estructura: OC/BACKEND y OC/Frontend
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "BACKEND"
$frontendDir = Join-Path $scriptDir "Frontend"

# Validar rutas
if (-not (Test-Path $backendDir)) {
    Write-Error "No se encontro el directorio BACKEND"
    Write-Error "Directorio actual: $scriptDir"
    Write-Error "Ruta esperada: $backendDir"
    exit 1
}

if (-not (Test-Path (Join-Path $backendDir "app\main.py"))) {
    Write-Error "No se encontro app\main.py en BACKEND"
    Write-Error "Ruta verificada: $(Join-Path $backendDir 'app\main.py')"
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Error "No se encontro el directorio Frontend"
    Write-Error "Directorio actual: $scriptDir"
    Write-Error "Ruta esperada: $frontendDir"
    exit 1
}

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
    Write-Error "No se encontro package.json en Frontend"
    Write-Error "Ruta verificada: $(Join-Path $frontendDir 'package.json')"
    exit 1
}

Write-Info "Backend: $backendDir"
Write-Info "Frontend: $frontendDir"
# Buscar archivo Excel en ubicaciones posibles
$excelPath = $null
$possiblePaths = @(
    (Join-Path (Split-Path -Parent $scriptDir) "Ejercicios.xlsx"),
    (Join-Path $scriptDir "Ejercicios.xlsx"),
    "C:\Proyectos personales\APP GIMNASIO\Ejercicios.xlsx"
)
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $excelPath = $path
        break
    }
}

Write-Info "=========================================="
Write-Info "  OC-CALISTHENICS - Inicio Automatico"
Write-Info "=========================================="
Write-Host ""

# Funcion para verificar si un puerto esta en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

# Funcion para verificar si hay ejercicios en la BD (MySQL)
function Test-ExercisesImported {
    try {
        # Verificar conexión a MySQL y contar ejercicios usando Python
        Push-Location $backendDir
        
        # Crear script temporal de Python
        $tempPythonScript = Join-Path $env:TEMP "oc_check_exercises.py"
        $pythonCode = @'
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def build_mysql_url():
    host = os.getenv('DB_HOST')
    user = os.getenv('DB_USER')
    pwd = os.getenv('DB_PASSWORD')
    name = os.getenv('DB_NAME')
    port = os.getenv('DB_PORT', '3306')
    if host and user and pwd and name:
        return f'mysql+pymysql://{user}:{pwd}@{host}:{port}/{name}?charset=utf8mb4'
    return None

DATABASE_URL = os.getenv('DATABASE_URL') or build_mysql_url()
if not DATABASE_URL:
    sys.exit(1)

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM exercises'))
        count = result.scalar()
        print(count)
        sys.exit(0 if count > 0 else 1)
except Exception as e:
    sys.exit(1)
'@
        $pythonCode | Out-File -FilePath $tempPythonScript -Encoding UTF8
        
        # Ejecutar script Python
        $result = python $tempPythonScript 2>&1
        $exitCode = $LASTEXITCODE
        Pop-Location
        
        # Limpiar script temporal
        if (Test-Path $tempPythonScript) {
            Remove-Item $tempPythonScript -Force -ErrorAction SilentlyContinue
        }
        
        if ($exitCode -eq 0 -and $result -match '^\d+$') {
            return ([int]$result -gt 0)
        }
        return $false
    } catch {
        return $false
    }
}

# Funcion para importar ejercicios
function Import-Exercises {
    param([string]$PythonCmd)
    
    Write-Info '[PASO 3/5] Verificando ejercicios en base de datos...'
    
    if (Test-ExercisesImported) {
        Write-Success "  Ejercicios ya importados"
        return $true
    }
    
    Write-Warning "  Ejercicios no encontrados, importando..."
    
    # Intentar importar sin detener el servidor primero
    $importScripts = @(
        (Join-Path $backendDir "import_exercises_sql.py"),
        (Join-Path $backendDir "import_exercises.py"),
        (Join-Path $backendDir "import_automatico.py")
    )
    
    foreach ($importScript in $importScripts) {
        if (Test-Path $importScript) {
            Push-Location $backendDir
            Write-Info "  Intentando importar con: $(Split-Path -Leaf $importScript)"
            try {
                $output = & $PythonCmd $importScript 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "  Ejercicios importados exitosamente"
                    Pop-Location
                    return $true
                }
            } catch {
                Write-Warning "  Error al ejecutar: $_"
            }
            Pop-Location
        }
    }
    
    # Si fallo, intentar deteniendo el servidor brevemente
    Write-Warning "  Intentando importar deteniendo servidor brevemente..."
    $backendRunning = Test-Port -Port 8000
    $backendProcessId = $null
    
    if ($backendRunning) {
        # Buscar proceso del backend - usar variable diferente a $pid (reservada)
        $netstatOutput = netstat -ano | Select-String ":8000.*LISTENING"
        if ($netstatOutput) {
            $processIdStr = ($netstatOutput -split '\s+')[-1]
            if ($processIdStr -match '^\d+$') {
                $backendProcessId = [int]$processIdStr
                Write-Info "  Deteniendo backend temporalmente (PID: $backendProcessId)..."
                Stop-Process -Id $backendProcessId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 3
            }
        }
    }
    
    # Intentar importar ahora
    $imported = $false
    foreach ($importScript in $importScripts) {
        if (Test-Path $importScript) {
            Push-Location $backendDir
            try {
                Write-Info "  Intentando importar con: $(Split-Path -Leaf $importScript)"
                $output = & $PythonCmd $importScript 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "  Ejercicios importados exitosamente"
                    $imported = $true
                    break
                } else {
                    Write-Warning "  No se pudieron importar ejercicios con este script"
                }
            } catch {
                Write-Warning "  Error al importar: $_"
            } finally {
                Pop-Location
            }
        }
    }
    
    if (-not $imported) {
        Write-Warning "  No se pudieron importar ejercicios ahora"
        Write-Warning "  Puedes importarlos manualmente despues desde: http://localhost:8000/docs"
    }
    
    # Reiniciar backend si lo detuvimos
    if ($backendProcessId) {
        Write-Info "  Reiniciando backend..."
        $backendCommand = "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
        $tempScript2 = Join-Path $env:TEMP "oc_backend_restart.ps1"
        $scriptContent2 = @"
`$ErrorActionPreference = 'Continue'
cd '$backendDir'
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  Backend OC-CALISTHENICS' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ''
try {
    & '$PythonCmd' $backendCommand
} catch {
    Write-Host "ERROR: `$_" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
"@
        $scriptContent2 | Out-File -FilePath $tempScript2 -Encoding UTF8
        Start-Process powershell -ArgumentList "-NoExit", "-File", $tempScript2
        Start-Sleep -Seconds 3
    }
    
    return $imported
}

# PASO 1: Verificar e iniciar Backend
Write-Info '[PASO 1/5] Verificando Backend...'
$backendPort = 8000
$backendRunning = Test-Port -Port $backendPort

# Definir comando de Python (se usará más adelante)
$pythonCmd = "python"
$venvPython = Join-Path $backendDir "venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonCmd = $venvPython
}

if ($backendRunning) {
    Write-Success "  Backend ya esta corriendo en puerto $backendPort"
} else {
    Write-Info "  Iniciando Backend..."
    Push-Location $backendDir
    
    # Verificar que existe el entorno virtual o usar Python global
    if (Test-Path $venvPython) {
        $pythonCmd = $venvPython
        Write-Info "  Usando entorno virtual: $pythonCmd"
    } else {
        Write-Warning "  No se encontro entorno virtual, usando Python global"
        # Verificar que Python este disponible
        try {
            $pythonVersion = & $pythonCmd --version 2>&1
            Write-Info "  Python encontrado: $pythonVersion"
        } catch {
            Write-Error "  Python no encontrado. Por favor instala Python o crea un entorno virtual."
            exit 1
        }
    }
    
    # Verificar que las dependencias estén instaladas
    Write-Info "  Verificando dependencias..."
    $requirementsFile = Join-Path $backendDir "requirements.txt"
    if (Test-Path $requirementsFile) {
        try {
            # Verificar si pymysql está instalado (necesario para MySQL)
            $pymysqlCheck = & $pythonCmd -m pip show pymysql 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "  Instalando dependencias desde requirements.txt..."
                & $pythonCmd -m pip install -r $requirementsFile 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "  Error al instalar dependencias"
                    Write-Error "  Por favor instala manualmente: cd BACKEND; pip install -r requirements.txt"
                    exit 1
                }
                Write-Success "  Dependencias instaladas correctamente"
            } else {
                Write-Success "  Dependencias verificadas"
            }
        } catch {
            Write-Warning "  No se pudo verificar dependencias, continuando..."
        }
    }
    
    # Verificar que el archivo main.py existe
    $mainPy = Join-Path $backendDir "app\main.py"
    if (-not (Test-Path $mainPy)) {
        Write-Error "  No se encontro app\main.py en $backendDir"
        Write-Error "  Verifica la estructura del proyecto"
        exit 1
    }
    
    # Intentar iniciar backend y capturar errores
    Write-Info "  Iniciando servidor backend..."
    $backendCommand = "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
    
    # Crear un script temporal para capturar errores
    $tempScript = Join-Path $env:TEMP "oc_backend_start.ps1"
    $scriptContent = @"
`$ErrorActionPreference = 'Continue'
cd '$backendDir'
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  Backend OC-CALISTHENICS' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ''
try {
    & '$pythonCmd' $backendCommand
} catch {
    Write-Host "ERROR: `$_" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
"@
    $scriptContent | Out-File -FilePath $tempScript -Encoding UTF8
    
    # Iniciar backend en nueva ventana (no minimizada para ver errores)
    Start-Process powershell -ArgumentList "-NoExit", "-File", $tempScript
    Write-Info "  Esperando a que el backend inicie..."
    
    # Esperar hasta 30 segundos
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        if (Test-Port -Port $backendPort) {
            Write-Success "  Backend iniciado correctamente"
            break
        }
        if ($waited % 5 -eq 0) {
            $msg = '  ... esperando (' + $waited + '/' + $maxWait + ' segundos)'
            Write-Info $msg
        }
    }
    
    if (-not (Test-Port -Port $backendPort)) {
        Write-Error "  No se pudo iniciar el backend"
        Write-Error "  Revisa la ventana de PowerShell que se abrio para ver los errores"
        Write-Error "  Por favor, inicia manualmente:"
        Write-Error "    cd BACKEND"
        Write-Error "    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
        Write-Host ""
        Write-Warning "  Posibles causas:"
        Write-Warning "  - Python no esta instalado o no esta en PATH"
        Write-Warning "  - Faltan dependencias (ejecuta: pip install -r requirements.txt)"
        Write-Warning "  - Error en el codigo del backend"
        Write-Host ""
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

Start-Sleep -Seconds 2

# PASO 2: Verificar e iniciar Frontend
Write-Info '[PASO 2/5] Verificando Frontend...'
$frontendPort = 5173
$frontendRunning = Test-Port -Port $frontendPort

if ($frontendRunning) {
    Write-Success "  Frontend ya esta corriendo en puerto $frontendPort"
    $frontendUrl = "http://localhost:$frontendPort"
} else {
    Write-Info "  Iniciando Frontend..."
    Push-Location $frontendDir
    
    # Verificar node_modules
    if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
        Write-Info "  Instalando dependencias de Frontend (primera vez)..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "  Error al instalar dependencias"
            exit 1
        }
    }
    
    # Iniciar frontend en nueva ventana
    $tempFrontendScript = Join-Path $env:TEMP "oc_frontend_start.ps1"
    $frontendScriptContent = @"
`$ErrorActionPreference = 'Continue'
cd '$frontendDir'
`$env:NODE_OPTIONS='--no-warnings'
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  Frontend OC-CALISTHENICS' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ''
try {
    npm run dev
} catch {
    Write-Host "ERROR: `$_" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
"@
    $frontendScriptContent | Out-File -FilePath $tempFrontendScript -Encoding UTF8
    Start-Process powershell -ArgumentList "-NoExit", "-File", $tempFrontendScript
    Write-Info "  Esperando a que el frontend inicie..."
    
    # Esperar hasta 30 segundos
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        if (Test-Port -Port $frontendPort) {
            Write-Success "  Frontend iniciado correctamente"
            $frontendUrl = "http://localhost:$frontendPort"
            break
        }
        # Verificar puerto alternativo
        if (Test-Port -Port 5174) {
            Write-Success "  Frontend iniciado en puerto 5174"
            $frontendUrl = "http://localhost:5174"
            break
        }
        if ($waited % 5 -eq 0) {
            $msg = '  ... esperando (' + $waited + '/' + $maxWait + ' segundos)'
            Write-Info $msg
        }
    }
    
    if (-not $frontendUrl) {
        Write-Error "  No se pudo iniciar el frontend"
        Write-Error "  Por favor, inicia manualmente: cd Frontend; npm run dev"
        exit 1
    }
    
    Pop-Location
}

Start-Sleep -Seconds 2

# PASO 3: Importar ejercicios si es necesario
# Usar el mismo comando de Python que se usó para el backend
Import-Exercises -PythonCmd $pythonCmd | Out-Null

# PASO 4: Abrir navegador
Write-Info '[PASO 4/5] Abriendo navegador...'
Start-Sleep -Seconds 3
Start-Process $frontendUrl
Write-Success "  Navegador abierto"

# PASO 5: Resumen
Write-Host ""
Write-Info "=========================================="
Write-Success "  APLICACION INICIADA CORRECTAMENTE"
Write-Info "=========================================="
Write-Host ""
Write-Info "Backend:  http://localhost:8000"
Write-Info "Frontend: $frontendUrl"
Write-Info "Docs API: http://localhost:8000/docs"
Write-Host ""
Write-Info "Para detener los servidores, cierra las ventanas de PowerShell"
Write-Info "o presiona Ctrl+C en cada una"
Write-Host ""
Write-Success "Listo! La aplicacion esta corriendo."
