@echo off
setlocal enabledelayedexpansion
title Innovation Atlas
cd /d "%~dp0"

echo.
echo  Innovation Atlas - Windows launcher
echo  (uses Git Bash to run the same run.sh as Linux/macOS)
echo.

set "BASH="
if exist "%ProgramFiles%\Git\bin\bash.exe"            set "BASH=%ProgramFiles%\Git\bin\bash.exe"
if exist "%ProgramFiles(x86)%\Git\bin\bash.exe"       set "BASH=%ProgramFiles(x86)%\Git\bin\bash.exe"
if exist "%LOCALAPPDATA%\Programs\Git\bin\bash.exe"   set "BASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"

if not defined BASH (
  for /f "delims=" %%B in ('where bash 2^>nul') do (
    echo %%B | findstr /i "System32" >nul || if not defined BASH set "BASH=%%B"
  )
)

if not defined BASH (
  echo  Git Bash not found. Installing Git for Windows...
  where winget >nul 2>nul
  if errorlevel 1 (
    echo.
    echo  Please install Git for Windows once, then run this file again:
    echo      https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
  )
  winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
  if exist "%ProgramFiles%\Git\bin\bash.exe"          set "BASH=%ProgramFiles%\Git\bin\bash.exe"
  if exist "%LOCALAPPDATA%\Programs\Git\bin\bash.exe" set "BASH=%LOCALAPPDATA%\Programs\Git\bin\bash.exe"
)

if not defined BASH (
  echo.
  echo  Git was installed but bash.exe was not found. Open a NEW terminal and retry,
  echo  or install manually: https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

"%BASH%" "%~dp0run.sh" %*
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" (
  echo  run.sh exited with code %CODE%. See logs\backend.log and logs\frontend.log.
)
pause
exit /b %CODE%
