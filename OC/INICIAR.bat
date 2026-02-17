@echo off
chcp 65001 >nul
title OC-CALISTHENICS - Iniciando...
echo.
echo ========================================
echo   OC-CALISTHENICS
echo   Iniciando aplicacion...
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar que el script PowerShell existe
if not exist "%~dp0INICIAR_APP.ps1" (
    echo ERROR: No se encontro INICIAR_APP.ps1
    echo Directorio actual: %~dp0
    pause
    exit /b 1
)

REM Ejecutar script PowerShell
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0INICIAR_APP.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error al iniciar. Revisa los mensajes anteriores.
    echo.
    pause
    exit /b %ERRORLEVEL%
)
