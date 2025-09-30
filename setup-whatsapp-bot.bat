@echo off
title WhatsApp Bot Setup - Amity Outpass System
color 0A

echo.
echo ========================================
echo   WhatsApp Bot Setup for Amity Outpass
echo ========================================
echo.

REM Check if Node.js is installed
echo 1️⃣ Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installation, run this setup again.
    pause
    exit /b 1
) else (
    node --version
    echo ✅ Node.js is installed
)

echo.
echo 2️⃣ Creating bot directory...
if not exist "whatsapp-bot" (
    mkdir whatsapp-bot
    echo ✅ Directory created: whatsapp-bot
) else (
    echo ✅ Directory already exists: whatsapp-bot
)

cd whatsapp-bot

echo.
echo 3️⃣ Installing dependencies...
if not exist "package.json" (
    echo ❌ Package.json not found!
    echo Please ensure all bot files are in the whatsapp-bot directory.
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo.
echo 4️⃣ Configuration...
echo.
echo Your bot will run on: http://localhost:3001
echo Dashboard will be available at: http://localhost:3001/dashboard
echo Default API Key: your-secret-key-123
echo.
echo ⚠️  IMPORTANT: Change the API key in whatsapp-bot.js for security!
echo.

echo 5️⃣ Setup complete! 🎉
echo.
echo To start your bot:
echo   Option 1: Double-click start-bot.bat
echo   Option 2: Run 'npm start' in this directory
echo   Option 3: Run 'node whatsapp-bot.js'
echo.
echo Next steps:
echo 1. Start the bot
echo 2. Scan QR code with WhatsApp
echo 3. Update your outpass system configuration
echo 4. Test with the dashboard
echo.

set /p choice="Would you like to start the bot now? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo Starting WhatsApp Bot...
    node whatsapp-bot.js
) else (
    echo.
    echo Setup completed. Start the bot when ready!
)

pause