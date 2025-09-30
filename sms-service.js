// SMS Service Integration
// This service handles SMS notifications through various providers

class SMSService {
    constructor() {
        this.provider = 'console'; // Default to console logging
        this.config = this.loadConfig();
        
        // Initialize based on available configuration
        this.initializeProvider();
    }

    loadConfig() {
        // In a real implementation, these would come from environment variables
        // or a secure configuration file
        return {
            twilio: {
                accountSid: process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID',
                authToken: process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN',
                fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890'
            },
            msg91: {
                apiKey: process.env.MSG91_API_KEY || 'YOUR_MSG91_API_KEY',
                senderId: process.env.MSG91_SENDER_ID || 'AMTYOT'
            },
            textlocal: {
                apiKey: process.env.TEXTLOCAL_API_KEY || 'YOUR_TEXTLOCAL_API_KEY',
                sender: process.env.TEXTLOCAL_SENDER || 'AMTYOT'
            }
        };
    }

    initializeProvider() {
        // Check which SMS provider is configured
        if (this.config.msg91.apiKey !== 'YOUR_MSG91_API_KEY') {
            this.provider = 'msg91';
            console.log('✅ SMS Service: Using MSG91');
        } else if (this.config.twilio.accountSid !== 'YOUR_TWILIO_ACCOUNT_SID') {
            this.provider = 'twilio';
            console.log('✅ SMS Service: Using Twilio');
        } else if (this.config.textlocal.apiKey !== 'YOUR_TEXTLOCAL_API_KEY') {
            this.provider = 'textlocal';
            console.log('✅ SMS Service: Using TextLocal');
        } else {
            console.log('⚠️ SMS Service: No provider configured, using console logging');
        }
    }

    async sendSMS(phoneNumber, message, options = {}) {
        try {
            // Clean phone number
            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            if (!cleanPhone) {
                throw new Error('Invalid phone number');
            }

            switch (this.provider) {
                case 'msg91':
                    return await this.sendViaMSG91(cleanPhone, message, options);
                case 'twilio':
                    return await this.sendViaTwilio(cleanPhone, message, options);
                case 'textlocal':
                    return await this.sendViaTextLocal(cleanPhone, message, options);
                default:
                    return this.sendViaConsole(cleanPhone, message, options);
            }
        } catch (error) {
            console.error('SMS sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // MSG91 Integration (Popular in India)
    async sendViaMSG91(phoneNumber, message, options) {
        const url = 'https://api.msg91.com/api/v5/flow/';
        
        const payload = {
            flow_id: options.templateId || 'FLOW_ID',
            sender: this.config.msg91.senderId,
            mobiles: phoneNumber,
            message: message,
            authkey: this.config.msg91.apiKey
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        return {
            success: response.ok,
            provider: 'MSG91',
            response: result,
            messageId: result.message_id
        };
    }

    // Twilio Integration
    async sendViaTwilio(phoneNumber, message, options) {
        const accountSid = this.config.twilio.accountSid;
        const authToken = this.config.twilio.authToken;
        const fromNumber = this.config.twilio.fromNumber;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        
        const payload = new URLSearchParams({
            To: phoneNumber,
            From: fromNumber,
            Body: message
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: payload
        });

        const result = await response.json();
        
        return {
            success: response.ok,
            provider: 'Twilio',
            response: result,
            messageId: result.sid
        };
    }

    // TextLocal Integration
    async sendViaTextLocal(phoneNumber, message, options) {
        const url = 'https://api.textlocal.in/send/';
        
        const payload = new URLSearchParams({
            apikey: this.config.textlocal.apiKey,
            numbers: phoneNumber,
            message: message,
            sender: this.config.textlocal.sender
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: payload
        });

        const result = await response.json();
        
        return {
            success: result.status === 'success',
            provider: 'TextLocal',
            response: result,
            messageId: result.message_id
        };
    }

    // Console logging (for testing)
    sendViaConsole(phoneNumber, message, options) {
        console.log('📱 SMS SIMULATION:');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log(`Options:`, options);
        console.log('---');
        
        return {
            success: true,
            provider: 'Console',
            messageId: 'console_' + Date.now()
        };
    }

    cleanPhoneNumber(phoneNumber) {
        if (!phoneNumber) return null;
        
        // Remove all non-digits
        let cleaned = phoneNumber.replace(/\D/g, '');
        
        // Add country code if missing
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned; // India country code
        }
        
        // Ensure it starts with +
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        
        return cleaned;
    }

    // Predefined message templates
    getMessageTemplate(type, data) {
        const templates = {
            'outpass_submitted': `Hi ${data.studentName}, your outpass request for ${data.fromDate} has been submitted successfully. Reference: ${data.outpassId}`,
            
            'outpass_approved': `Great news ${data.studentName}! Your outpass for ${data.fromDate} has been APPROVED by ${data.mentorName}. Have a safe trip!`,
            
            'outpass_rejected': `Hi ${data.studentName}, your outpass for ${data.fromDate} has been rejected by ${data.mentorName}. Reason: ${data.reason}`,
            
            'mentor_notification': `New outpass request from ${data.studentName} for ${data.fromDate}. Reason: ${data.reason}. Please review and approve/reject.`,
            
            'reminder': `Reminder: Your outpass expires on ${data.toDate}. Please return to campus on time.`,
            
            'overdue': `URGENT: Your outpass expired on ${data.toDate}. Please contact your mentor immediately.`
        };
        
        return templates[type] || data.message;
    }

    // Bulk SMS functionality
    async sendBulkSMS(phoneNumbers, message, options = {}) {
        const results = [];
        
        for (const phoneNumber of phoneNumbers) {
            try {
                const result = await this.sendSMS(phoneNumber, message, options);
                results.push({
                    phoneNumber,
                    ...result
                });
                
                // Add delay between messages to avoid rate limiting
                await this.delay(options.delay || 1000);
            } catch (error) {
                results.push({
                    phoneNumber,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Schedule SMS for future delivery
    async scheduleSMS(phoneNumber, message, scheduleTime, options = {}) {
        const now = new Date();
        const scheduleDate = new Date(scheduleTime);
        const delay = scheduleDate.getTime() - now.getTime();

        if (delay <= 0) {
            // Send immediately if schedule time is in the past
            return await this.sendSMS(phoneNumber, message, options);
        }

        // Schedule the SMS
        setTimeout(async () => {
            await this.sendSMS(phoneNumber, message, options);
        }, delay);

        return {
            success: true,
            scheduled: true,
            scheduleTime: scheduleDate.toISOString(),
            delay: delay
        };
    }

    // Get delivery status (provider dependent)
    async getDeliveryStatus(messageId, provider) {
        switch (provider) {
            case 'msg91':
                return await this.getMSG91Status(messageId);
            case 'twilio':
                return await this.getTwilioStatus(messageId);
            default:
                return { status: 'unknown' };
        }
    }

    async getMSG91Status(messageId) {
        const url = `https://api.msg91.com/api/v5/report/${messageId}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'authkey': this.config.msg91.apiKey
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async getTwilioStatus(messageId) {
        const accountSid = this.config.twilio.accountSid;
        const authToken = this.config.twilio.authToken;
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageId}.json`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`)
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
}

// Export for use
window.SMSService = SMSService;

// Example usage and integration with notification system
window.sendOutpassSMS = async function(type, data) {
    const smsService = new SMSService();
    
    let phoneNumber = null;
    let message = '';
    
    switch (type) {
        case 'outpass_submitted':
            phoneNumber = data.studentPhone;
            message = smsService.getMessageTemplate('outpass_submitted', data);
            break;
            
        case 'outpass_approved':
            phoneNumber = data.studentPhone;
            message = smsService.getMessageTemplate('outpass_approved', data);
            break;
            
        case 'outpass_rejected':
            phoneNumber = data.studentPhone;
            message = smsService.getMessageTemplate('outpass_rejected', data);
            break;
            
        case 'mentor_notification':
            phoneNumber = data.mentorPhone;
            message = smsService.getMessageTemplate('mentor_notification', data);
            break;
    }
    
    if (phoneNumber && message) {
        return await smsService.sendSMS(phoneNumber, message);
    }
    
    return { success: false, error: 'Invalid SMS data' };
};

console.log('✅ SMS Service loaded successfully');