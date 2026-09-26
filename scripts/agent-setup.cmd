@echo off
rem Launcher for scripts\agent-setup.ts on Windows. Needs Node (the major in
rem .nvmrc or newer) on PATH, from fnm, nvm-windows or nodejs.org. Safe to run
rem repeatedly. Linux and macOS: scripts/agent-setup.
setlocal
cd /d "%~dp0.."
set /p WANTED=<.nvmrc
where node >nul 2>nul || (echo agent-setup: Node %WANTED% or newer is required. Install it and run again. 1>&2 & exit /b 1)
for /f %%v in ('node -p "process.versions.node.split(\".\")[0]"') do set MAJOR=%%v
if %MAJOR% LSS %WANTED% (echo agent-setup: Node %WANTED% or newer is required; found %MAJOR%. 1>&2 & exit /b 1)
node scripts\agent-setup.ts %*
