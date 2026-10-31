@echo off
rem Denní stažení registru eTransport (DPSHTRR) - jen pro neveřejnou analýzu.
rem Kontakt do User-Agent doplň za --contact, např. --contact "tvuj@email.cz"
setlocal
cd /d "%~dp0"
set "OUT=%~dp0..\..\data\etransport"
if not exist "%OUT%" mkdir "%OUT%"
set "PY=python"
where py >nul 2>&1 && set "PY=py -3"
%PY% etransport_fetch.py --out "%OUT%" --pause 2 --contact "" >> "%OUT%\log.txt" 2>&1
exit /b %ERRORLEVEL%
