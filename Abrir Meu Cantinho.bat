@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS em https://nodejs.org/ e depois abra este arquivo novamente.
  pause
  exit /b 1
)
echo Abrindo Meu Cantinho...
echo Mantenha a janela do servidor aberta enquanto estiver usando o app.
start "Meu Cantinho - servidor" node server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
