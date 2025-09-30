# 🤖 Local WhatsApp Bot Setup Guide

## 🎯 What is this?
A **personal WhatsApp bot** that runs on your computer to send outpass notifications directly through your WhatsApp account. No need for expensive APIs or business approvals!

## ✨ Features
- 🔄 **Runs on your computer** - Complete control
- 📱 **Uses your WhatsApp** - No special accounts needed
- 💰 **Completely FREE** - No SMS or API costs
- 🎨 **Rich messages** - Emojis, formatting, templates
- 🌐 **Web dashboard** - Monitor and test easily
- 📊 **Message tracking** - See delivery status
- 🚀 **Easy setup** - Just scan QR code

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Setup
1. Double-click `setup-whatsapp-bot.bat`
2. Follow the installation prompts
3. Wait for dependencies to install

### Step 2: Start Bot
1. Double-click `whatsapp-bot\start-bot.bat`
2. Wait for QR code to appear in terminal
3. Open WhatsApp on your phone
4. Go to **Settings** → **Linked Devices** → **Link a Device**
5. Scan the QR code

### Step 3: Test Bot
1. Open http://localhost:3001/dashboard
2. Enter your phone number (with country code)
3. Click "Send Test Message"
4. Check your WhatsApp!

### Step 4: Configure System
Add this to your `firebase-config.js`:

```javascript
window.whatsappConfig = {
  provider: 'local_bot',
  apiUrl: 'http://localhost:3001',
  apiKey: 'your-secret-key-123'
};
```

## 📱 How It Works

### Your Setup:
```
Your Computer → WhatsApp Bot → Your WhatsApp → Students/Mentors
```

### When Student Submits Outpass:
1. **Student** submits outpass on website
2. **System** calls local bot API
3. **Bot** sends WhatsApp message
4. **Mentor** receives instant WhatsApp notification

### When Mentor Approves:
1. **Mentor** approves on website
2. **System** calls local bot API
3. **Bot** sends WhatsApp message
4. **Student** receives approval notification

## 🎨 Message Examples

### Student Outpass Submitted:
```
🎓 Hi Rahul!

✅ Your outpass request has been submitted successfully.

📅 Date: 23/09/2025
🕒 Time: 10:00 AM
📍 Destination: Home
📝 Reason: Family function
🔗 Reference: OUT12345

Your mentor Dr. Sharma will review it soon. 📋

🏫 Amity University Outpass System
```

### Mentor Approval:
```
🎉 Congratulations Rahul!

✅ Your outpass for 23/09/2025 has been APPROVED by Dr. Sharma.

🕒 Departure Time: 10:00 AM
📍 Destination: Home
💬 Mentor's Note: Have a safe trip home!

🚗 Please travel safely and return on time.
📞 Contact your mentor if you need any assistance.

🏫 Amity University
```

### Mentor Alert:
```
🔔 New Outpass Request

👤 Student: Rahul Sharma
🆔 Enrollment: A12345678901
📅 Date: 23/09/2025
🕒 Time: 10:00 AM
📍 Destination: Home
📝 Reason: Family function
📞 Contact: +919999999999

Please review and approve/reject this request. 📋

🏫 Amity University Outpass System
```

## 🌐 Web Dashboard Features

Access at: **http://localhost:3001/dashboard**

### Real-time Status:
- ✅ Bot connection status
- ⏱️ Uptime tracking
- 📊 Message statistics
- 🕐 Last activity time

### Test Interface:
- 📝 Send test messages
- 📋 Try different templates
- 🔍 Check delivery status
- 📱 Verify phone numbers

### Statistics:
- 📤 Messages sent count
- 📨 Messages received count
- ⏰ Bot uptime
- 📈 Success rate

## 🔧 Advanced Configuration

### Custom API Key:
Edit `whatsapp-bot.js`:
```javascript
const CONFIG = {
    apiKey: 'my-super-secret-key-456', // Change this!
    port: 3001,
    logMessages: true
};
```

### Custom Templates:
Add your own message templates in `whatsapp-bot.js`:
```javascript
const messageTemplates = {
    custom_reminder: (data) => `⏰ Custom reminder for ${data.studentName}...`,
    // Add more templates here
};
```

### Different Port:
Change port in `whatsapp-bot.js`:
```javascript
const CONFIG = {
    port: 3002, // Change from 3001
    // ...
};
```

Then update frontend configuration:
```javascript
window.whatsappConfig = {
  apiUrl: 'http://localhost:3002', // Update port
  // ...
};
```

## 🛠️ API Endpoints

Your bot provides these endpoints:

### Send Single Message:
```bash
POST http://localhost:3001/send-message
{
  "number": "919999999999",
  "message": "Hello from bot!",
  "apikey": "your-secret-key-123"
}
```

### Send Template Message:
```bash
POST http://localhost:3001/send-message
{
  "number": "919999999999",
  "template": "outpass_approved",
  "templateData": {
    "studentName": "Rahul",
    "fromDate": "23/09/2025"
  },
  "apikey": "your-secret-key-123"
}
```

### Send Bulk Messages:
```bash
POST http://localhost:3001/send-bulk
{
  "numbers": ["919999999999", "918888888888"],
  "message": "Bulk announcement",
  "apikey": "your-secret-key-123"
}
```

### Check Status:
```bash
GET http://localhost:3001/status
```

## 🚨 Troubleshooting

### "QR Code not appearing"
- Check if Node.js is installed
- Make sure no other app is using port 3001
- Try restarting the bot

### "Bot disconnects frequently"
- Keep your computer awake
- Don't logout WhatsApp Web in browser
- Ensure stable internet connection

### "Messages not sending"
- Check if bot shows as "Ready" in dashboard
- Verify phone number format (country code required)
- Make sure recipient has WhatsApp

### "Cannot connect to bot"
- Check if bot is running (see terminal/command prompt)
- Try accessing dashboard: http://localhost:3001/dashboard
- Check Windows Firewall settings

### "Dependencies installation failed"
- Make sure you have internet connection
- Try running as Administrator
- Update Node.js to latest version

## 🔐 Security & Privacy

### Keep Secure:
- ✅ Change default API key
- ✅ Don't share your session data
- ✅ Keep bot computer secure
- ✅ Monitor dashboard regularly

### Privacy Notes:
- 🔒 Bot runs locally on your computer
- 🔒 No data sent to external servers
- 🔒 Messages go through your WhatsApp
- 🔒 You control everything

## 🎯 Production Tips

### Keep Bot Running 24/7:
1. **Disable sleep mode** on your computer
2. **Set up auto-startup** - Add bot to Windows startup
3. **Use UPS** - Protect against power outages
4. **Monitor regularly** - Check dashboard daily

### Auto-startup (Windows):
1. Press `Win + R`, type `shell:startup`, press Enter
2. Copy `start-bot.bat` to this folder
3. Bot will start with Windows

### Backup Session:
- Copy `whatsapp-bot\session-data` folder regularly
- If bot stops working, restore this folder

## 📊 Usage Statistics

After setup, you can track:
- 📈 Daily message volume
- ⏱️ Response times
- 📊 Success rates
- 👥 Active users

## 💡 Pro Tips

1. **Test First**: Always test with your own number first
2. **Monitor Logs**: Check `bot-logs.txt` for any issues  
3. **Backup Sessions**: Copy session data regularly
4. **Update Regularly**: Keep dependencies updated
5. **Use Templates**: Template messages are more reliable

## 🎉 Success Checklist

✅ **Node.js installed**
✅ **Bot files copied to whatsapp-bot folder**
✅ **Dependencies installed (npm install)**
✅ **Bot started and showing QR code**
✅ **QR code scanned with WhatsApp**
✅ **Dashboard accessible at localhost:3001**
✅ **Test message sent and received**
✅ **Frontend configured to use local bot**
✅ **Outpass notifications working**

---

## 🆘 Need Help?

**Common Questions:**

**Q: Can multiple people use the same bot?**
A: Yes! One bot can send messages to unlimited recipients.

**Q: What if my computer is turned off?** 
A: Bot won't work when computer is off. Consider using a dedicated computer or cloud server.

**Q: Is this against WhatsApp terms?**
A: This uses official WhatsApp Web API. It's the same as using WhatsApp Web in browser.

**Q: Can I use this for other notifications?**
A: Absolutely! Bot can send any type of WhatsApp message.

**Q: What about message limits?**
A: Personal WhatsApp accounts have reasonable limits. Business accounts have higher limits.

---

*Your personal WhatsApp bot for Amity Outpass System*
*Local • Free • Secure • Easy to use*