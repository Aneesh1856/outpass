// Notification & SMS Configuration Guide
// Follow these steps to set up real-time notifications and SMS services

/*
=============================================================================
🔧 SETUP INSTRUCTIONS FOR NOTIFICATION SYSTEM
=============================================================================

1. 📱 SMS SERVICE SETUP
   =====================
   
   Choose one of these SMS providers:

   A) MSG91 (Popular in India)
   -------------------------
   - Visit: https://msg91.com/
   - Sign up and get API key
   - Add to firebase-config.js:
     
     window.smsConfig = {
       provider: 'msg91',
       apiKey: 'YOUR_MSG91_API_KEY',
       senderId: 'AMTYOT'  // Your sender ID
     };

   B) Twilio (Global)
   -----------------
   - Visit: https://www.twilio.com/
   - Sign up and get Account SID, Auth Token, Phone Number
   - Add to firebase-config.js:
     
     window.smsConfig = {
       provider: 'twilio',
       accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
       authToken: 'YOUR_TWILIO_AUTH_TOKEN',
       fromNumber: '+1234567890'  // Your Twilio phone number
     };

   C) TextLocal (India)
   -------------------
   - Visit: https://www.textlocal.in/
   - Sign up and get API key
   - Add to firebase-config.js:
     
     window.smsConfig = {
       provider: 'textlocal',
       apiKey: 'YOUR_TEXTLOCAL_API_KEY',
       sender: 'AMTYOT'  // Your sender name
     };

2. 🔔 PUSH NOTIFICATIONS SETUP
   ===========================
   
   A) Firebase Cloud Messaging (FCM)
   ---------------------------------
   - Go to Firebase Console
   - Select your project
   - Go to Project Settings > Cloud Messaging
   - Generate a Web Push certificate
   - Add to firebase-config.js:
     
     window.fcmConfig = {
       vapidKey: 'YOUR_VAPID_KEY'
     };

   B) Browser Notifications
   -----------------------
   - Already configured! The system will request permission automatically
   - Users will see browser notifications when the page is open

3. 🏗️ DATABASE STRUCTURE SETUP
   =============================
   
   The notification system will automatically create these database structures:
   
   notifications/
   ├── {studentId}/
   │   ├── {notificationId}/
   │   │   ├── type: "outpass_status_change"
   │   │   ├── title: "Outpass APPROVED"
   │   │   ├── message: "Your outpass has been approved"
   │   │   ├── timestamp: "2024-01-15T10:30:00Z"
   │   │   ├── read: false
   │   │   └── delivered: true
   │   └── ...
   └── {mentorId}/
       └── ...

4. 🔐 SECURITY RULES (Firebase)
   ============================
   
   Add these rules to your Firebase Realtime Database:
   
   {
     "rules": {
       "notifications": {
         "$userId": {
           ".read": "$userId == auth.uid || root.child('mentors').child(auth.uid).exists()",
           ".write": "$userId == auth.uid || root.child('mentors').hasChild(auth.uid)"
         }
       },
       "outpasses": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "students": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "mentors": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }

5. 🌐 CORS SETUP (If needed)
   =========================
   
   If you encounter CORS issues with SMS APIs:
   
   - For local development, use a CORS browser extension
   - For production, set up a simple proxy server
   - Or use Firebase Cloud Functions (recommended)

6. ☁️ FIREBASE CLOUD FUNCTIONS (Optional but Recommended)
   =====================================================
   
   For production, set up Firebase Cloud Functions for SMS:
   
   // functions/index.js
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   const axios = require('axios');
   
   admin.initializeApp();
   
   exports.sendSMS = functions.database.ref('/notifications/{userId}/{notificationId}')
     .onCreate(async (snapshot, context) => {
       const notification = snapshot.val();
       const userId = context.params.userId;
       
       // Get user phone number
       const userSnapshot = await admin.database().ref(`students/${userId}`).once('value');
       const user = userSnapshot.val();
       
       if (user && user.phone) {
         // Send SMS using your preferred provider
         // Implementation depends on your chosen SMS service
       }
     });

=============================================================================
📋 TESTING THE NOTIFICATION SYSTEM
=============================================================================

1. Test Real-time Notifications:
   - Open two browser tabs
   - Login as student in one, mentor in another
   - Submit outpass as student
   - Check if mentor receives notification instantly

2. Test SMS Notifications:
   - Configure SMS provider credentials
   - Submit/approve outpass
   - Check if SMS is received on mobile

3. Test Push Notifications:
   - Allow notifications when browser prompts
   - Submit/approve outpass
   - Check if browser notification appears

=============================================================================
🎯 CUSTOMIZATION OPTIONS
=============================================================================

1. Notification Templates:
   - Edit templates in sms-service.js
   - Customize messages for different scenarios

2. Notification Sounds:
   - Replace the default notification sound
   - Add different sounds for different notification types

3. UI Customization:
   - Modify notification popup styles
   - Change notification panel appearance
   - Customize notification icons and colors

4. Advanced Features:
   - Add email notifications
   - Implement notification scheduling
   - Add notification history cleanup
   - Create notification preferences

=============================================================================
🚨 TROUBLESHOOTING
=============================================================================

Common Issues:

1. "SMS not sending"
   - Check API credentials
   - Verify phone number format
   - Check API rate limits
   - Ensure CORS is configured

2. "Notifications not appearing"
   - Check if Firebase is connected
   - Verify database rules
   - Check browser console for errors
   - Ensure notification permission is granted

3. "Real-time updates not working"
   - Check Firebase Realtime Database connection
   - Verify listener setup
   - Check network connectivity
   - Ensure proper authentication

4. "CORS errors"
   - Use Firebase Cloud Functions for production
   - Enable CORS on your server
   - Use a CORS browser extension for development

For technical support, check the browser console and Firebase console for detailed error messages.

=============================================================================
*/

// Configuration object - Update with your actual credentials
window.notificationConfig = {
  sms: {
    enabled: true,
    provider: 'console', // Change to 'msg91', 'twilio', or 'textlocal'
    // Add your credentials here when ready:
    // apiKey: 'YOUR_API_KEY',
    // accountSid: 'YOUR_ACCOUNT_SID', // for Twilio
    // authToken: 'YOUR_AUTH_TOKEN',   // for Twilio
    // fromNumber: '+1234567890',      // for Twilio
    // senderId: 'AMTYOT'              // for MSG91/TextLocal
  },
  
  whatsapp: {
    enabled: true,
    provider: 'local_bot', // Local WhatsApp bot (recommended)
    localBot: {
      apiUrl: 'http://localhost:3001',
      apiKey: 'your-secret-key-123' // Change this for security
    }
    // Other provider options:
    // provider: 'whatsapp_business', // Official WhatsApp Business API
    // provider: 'twilio_whatsapp',   // Twilio WhatsApp
    // provider: 'callmebot',         // CallMeBot (simple)
  },
  
  push: {
    enabled: true,
    requestPermission: true,
    // vapidKey: 'YOUR_VAPID_KEY' // for FCM
  },
  
  realtime: {
    enabled: true,
    soundEnabled: true,
    showPopups: true
  },
  
  ui: {
    notificationDuration: 5000, // 5 seconds
    maxHistoryItems: 50,
    bellIconEnabled: true
  }
};

// Apply configuration to services
if (typeof window !== 'undefined') {
  // Make config globally available
  window.SMS_CONFIG = window.notificationConfig.sms;
  window.PUSH_CONFIG = window.notificationConfig.push;
  window.REALTIME_CONFIG = window.notificationConfig.realtime;
  window.UI_CONFIG = window.notificationConfig.ui;
  
  console.log('🔧 Notification configuration loaded');
  console.log('📱 SMS Provider:', window.notificationConfig.sms.provider);
  console.log('🔔 Push notifications:', window.notificationConfig.push.enabled ? 'enabled' : 'disabled');
  console.log('⚡ Real-time notifications:', window.notificationConfig.realtime.enabled ? 'enabled' : 'disabled');
}