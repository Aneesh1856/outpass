# Outpass System - Troubleshooting Guide

## Common Issues and Solutions

### 1. Firebase Connection Issues

**Problem**: "Firebase is not defined" or connection errors
**Solutions**:
- Make sure you're running the website from a local server (not opening files directly)
- Check that Firebase scripts are loading properly
- Verify your Firebase configuration in `firebase-config.js`

### 2. Registration Not Working

**Problem**: "Invalid roll number" error during registration
**Solution**: 
1. Open `setup-database.html` in your browser
2. Click "Setup Sample Roll Numbers" 
3. Use one of these roll numbers to register:
   - A27701221001
   - A27701221002
   - A27701221003
   - etc.

### 3. Admin Login Not Working

**Problem**: "Admin not found" error
**Solution**:
1. Open `setup-database.html` in your browser
2. Setup an admin account with username: `admin` and password: `admin123`
3. Or create your own admin credentials

### 4. Student Login Issues

**Problem**: Can't login after registration
**Solution**:
- Make sure you registered successfully first
- Use the exact same username and password you registered with
- Check browser console for error messages

### 5. Database Permission Issues

**Problem**: "Permission denied" errors
**Solution**:
- Check your Firebase Realtime Database rules
- For development, you can use these rules (NOT for production):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 6. CORS Issues

**Problem**: Cross-origin request blocked
**Solution**:
- Always run from a local server (python -m http.server 8000)
- Never open HTML files directly in browser (file:// protocol)

## How to Run the Project

1. **Start Local Server**:
   ```bash
   cd "c:\Users\Admin\Desktop\1.0"
   python -m http.server 8000
   ```

2. **Setup Database**:
   - Open http://localhost:8000/setup-database.html
   - Run all setup steps

3. **Test the System**:
   - Open http://localhost:8000
   - Register a new student using one of the valid roll numbers
   - Login with the registered credentials
   - Test admin login at http://localhost:8000/admin-login.html

## Test Data

### Valid Roll Numbers for Registration:
- A27701221001
- A27701221002
- A27701221003
- A27701221004
- A27701221005

### Default Admin Credentials:
- Username: admin
- Password: admin123

## Firebase Database Structure

Your database should have this structure:
```
{
  "validRollNumbers": {
    "A27701221001": true,
    "A27701221002": true,
    ...
  },
  "admins": {
    "uniqueKey1": {
      "username": "admin",
      "password": "admin123",
      "role": "admin"
    }
  },
  "students": {
    "uniqueKey1": {
      "username": "student1",
      "password": "password123",
      "rollNumber": "A27701221001",
      "name": "Student Name",
      ...
    }
  },
  "outpasses": {
    "uniqueKey1": {
      "studentId": "uniqueKey1",
      "reason": "Medical",
      "status": "pending",
      ...
    }
  }
}
```

## Browser Console Debugging

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages in red
4. Common errors and solutions:
   - "Firebase is not defined" → Check if scripts are loading
   - "Permission denied" → Check Firebase rules
   - "Network error" → Check internet connection and Firebase config

## Need More Help?

1. Check the browser console for specific error messages
2. Open `setup-database.html` to verify database setup
3. Make sure Firebase project is active and properly configured
4. Verify you're using the correct Firebase configuration keys