@echo off
echo ========================================
echo   PhonePe Payment - GitHub Setup
echo ========================================
echo.

echo [1/4] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Git repository already exists or Git not installed
) else (
    echo Git repository initialized successfully!
)

echo.
echo [2/4] Adding all files to Git...
git add .
if %errorlevel% neq 0 (
    echo Error adding files to Git
    pause
    exit /b 1
)
echo Files added successfully!

echo.
echo [3/4] Creating initial commit...
git commit -m "Initial commit: PhonePe payment integration with OAuth production setup"
if %errorlevel% neq 0 (
    echo Error creating commit or no changes to commit
) else (
    echo Initial commit created successfully!
)

echo.
echo [4/4] Repository is ready for GitHub!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run these commands:
echo.
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Then follow GITHUB_NETLIFY_DEPLOYMENT.md
echo    for Netlify deployment instructions
echo ========================================
echo.
pause