@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS em https://nodejs.org/ e depois abra este arquivo novamente.
  pause
  exit /b 1
)
echo Abrindo seu caderno de programacao...
node desktop.cjs
if errorlevel 1 pause
