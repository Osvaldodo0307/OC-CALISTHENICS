@echo off
chcp 65001 >nul
title OC-CALISTHENICS - Deteniendo...
REM Script para detener todos los servidores

cd /d "%~dp0"

REM Verificar que el script PowerShell existe
if not exist "%~dp0DETENER_APP.ps1" (
    echo ERROR: No se encontro DETENER_APP.ps1
    echo Directorio actual: %~dp0
    pause
    exit /b 1
)

REM Ejecutar script PowerShell
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0DETENER_APP.ps1"

pause
