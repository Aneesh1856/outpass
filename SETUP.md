# Outpass System - Setup Guide

This guide will walk you through setting up and running the Outpass System.

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- Python (for running a local server)
- Internet connection (for Firebase)

## Step 1: Setup Local Server

The application needs to run on a web server to work correctly. You can use Python's built-in HTTP server:

### On Windows

1. Open PowerShell or Command Prompt
2. Navigate to the project directory:
   ```
   cd "c:\path\to\your\project"
   ```
3. Start the Python HTTP server:
   ```
   python -m http.server 8000
   ```
4. The terminal will show: `Serving HTTP on :: port 8000`

## Step 2: Access the Setup Page

1. Open your web browser
2. Navigate to: http://localhost:8000/setup-database.html

## Step 3: Initialize the Database

On the setup page, perform these steps in order:

1. **Test Connection**:
   - Click the "Test Connection" button
   - Wait for confirmation that Firebase is connected

2. **Setup Roll Numbers**:
   - Click "Setup Sample Roll Numbers"
   - This adds valid roll numbers that students can use for registration
   - Note these roll numbers for testing:
     - A27701221001
     - A27701221002
     - A27701221003
     - etc.

3. **Create Admin Account**:
   - The default credentials are:
     - Username: admin
     - Password: admin123
   - Click "Create Admin Account"
   - You'll see a confirmation message

4. **Verify Database Contents**:
   - Click "View Database" to see what's been set up
   - This confirms your database has been properly initialized

## Step 4: Try the Application

1. **Home Page**: http://localhost:8000/
2. **Register a Student**:
   - Go to the registration page
   - Use one of the valid roll numbers (e.g., A27701221001)
   - Complete the form and submit

3. **Student Login**:
   - Use the roll number as username
   - Enter the password you created
   - You should be redirected to the student dashboard

4. **Admin Login**:
   - Go to http://localhost:8000/admin-login.html
   - Use the admin credentials:
     - Username: admin
     - Password: admin123
   - You should be redirected to the admin dashboard

## Troubleshooting

If you encounter any issues:

1. Check the browser console (F12 > Console) for error messages
2. Refer to the TROUBLESHOOTING.md file for common problems and solutions
3. Make sure Firebase is properly connected
4. Ensure you're using the application through the local server (http://localhost:8000)

## Security Note

This setup is for development and testing purposes only. In a production environment, you would need:

1. Proper authentication with Firebase Auth
2. Secure Firebase Database Rules
3. HTTPS for all communications
4. Proper password hashing

## Need Help?

If you continue to have issues after following this guide and checking the troubleshooting file, try:

1. Clearing your browser cache
2. Restarting the local server
3. Checking for any network restrictions
4. Verifying your Firebase project is active and properly configured