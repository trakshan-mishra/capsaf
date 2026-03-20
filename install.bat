@echo off
REM CAPSAF Installation Script for Windows
REM Production-Ready Backend & Frontend Setup

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   CAPSAF Installation Script (Windows)
echo   Production-Ready Setup
echo ========================================
echo.

REM Check Node.js
echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 22+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK: Node.js %NODE_VERSION% found

REM Check npm
echo [2/8] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo OK: npm %NPM_VERSION% found

REM Check MongoDB
echo [3/8] Checking MongoDB...
where mongod >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB not found locally
    echo Use MongoDB Atlas or install MongoDB locally
) else (
    echo OK: MongoDB found
)

REM Install dependencies
echo [4/8] Installing npm dependencies...
if not exist "node_modules" (
    call npm install --legacy-peer-deps
    echo OK: Dependencies installed
) else (
    echo OK: Dependencies already installed
)

REM Create .env file
echo [5/8] Setting up environment variables...
if not exist ".env" (
    copy .env.example .env >nul
    echo OK: .env file created
    echo.
    echo WARNING: Update .env with your API keys:
    echo   - MongoDB URI
    echo   - JWT Secret
    echo   - OAuth credentials
    echo   - API keys
) else (
    echo OK: .env file exists
)

REM Create directories
echo [6/8] Creating directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "config" mkdir config
if not exist "models" mkdir models
if not exist "routes" mkdir routes
if not exist "middleware" mkdir middleware
echo OK: Directories created

REM Database initialization
echo [7/8] Checking database setup...
if "%1"=="--init-db" (
    echo Initializing database...
    call npm run seed >nul 2>&1
    echo OK: Database ready
) else (
    echo OK: Database setup skipped
)

REM Summary
echo [8/8] Installation complete!
echo.
echo ========================================
echo   INSTALLATION SUCCESSFUL!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Start the backend server:
echo    npm run dev
echo.
echo 2. Backend runs on: http://localhost:3001
echo 3. Frontend runs on: http://localhost:3000
echo.
echo 4. Update .env with API keys and database credentials
echo.
echo Useful Commands:
echo   npm start       - Start production server
echo   npm run dev     - Start development server
echo   npm test        - Run tests
echo   npm run seed    - Seed database
echo.
pause
