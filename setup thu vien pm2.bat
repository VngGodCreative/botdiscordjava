@echo off
set LOGFILE=start_log.txt

:: Check if npm is installed
echo Checking if npm is installed...
where npm >nul 2>>%LOGFILE%
IF %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm before running this script. >> %LOGFILE%
    echo npm is not installed. Please install npm before running this script.
    pause
    exit /b %ERRORLEVEL%
)

:: Install necessary libraries
echo Installing necessary libraries...
npm install >> %LOGFILE% 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Error installing libraries. Please check the log for details. >> %LOGFILE%
    echo Error installing libraries. Please check the log for details.
    pause
    exit /b %ERRORLEVEL%
)

:: Check if pm2 is installed
echo Checking if pm2 is installed...
where pm2 >nul 2>>%LOGFILE%
IF %ERRORLEVEL% NEQ 0 (
    echo pm2 is not installed. Installing pm2... >> %LOGFILE%
    echo pm2 is not installed. Installing pm2...
    npm install -g pm2 >> %LOGFILE% 2>&1
    IF %ERRORLEVEL% NEQ 0 (
        echo Error installing pm2. Please check the log for details. >> %LOGFILE%
        echo Error installing pm2. Please check the log for details.
        pause
        exit /b %ERRORLEVEL%
    )
)

echo Libraries installed successfully. >> %LOGFILE%
echo Libraries installed successfully.
pause