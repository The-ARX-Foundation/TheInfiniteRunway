@echo off
setlocal
cd /d "%~dp0"
set "NODEEXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODEEXE%" set "NODEEXE=%ProgramW6432%\nodejs\node.exe"
if not exist "%NODEEXE%" set "NODEEXE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODEEXE%" set "NODEEXE=node"
rem Default :3780 — keeps InsightAlly Project Command free to use :3700
set "PC_PORT=3780"
if not "%~1"=="" set "PC_PORT=%~1"
start "ProjectCommand-ARX" /MIN cmd /c ""%NODEEXE%" "%~dp0server.js" --port %PC_PORT% >> "%~dp0server.log" 2>&1"
