// WhatsApp Messaging Service Integration
// This service handles WhatsApp notifications through various providers

class WhatsAppService {
    constructor() {
        this.provider = 'console'; // Default to console logging
        this.config = this.loadConfig();
        
        // Initialize based on available configuration
        this.initializeProvider();
    }

    loadConfig() {
        // Browser environment - use window.whatsappConfig or defaults
        const browserConfig = window.whatsappConfig || {};
        
        return {
            // WhatsApp Business API (Official)
            whatsappBusiness: {
                accessToken: browserConfig.whatsappBusinessToken || 'YOUR_WHATSAPP_ACCESS_TOKEN',
                phoneNumberId: browserConfig.phoneNumberId || 'YOUR_PHONE_NUMBER_ID',
                verifyToken: browserConfig.verifyToken || 'YOUR_VERIFY_TOKEN'
            },
            
            // Twilio WhatsApp API
            twilioWhatsApp: {
                accountSid: browserConfig.twilioAccountSid || 'YOUR_TWILIO_ACCOUNT_SID',
                authToken: browserConfig.twilioAuthToken || 'YOUR_TWILIO_AUTH_TOKEN',
                fromNumber: browserConfig.twilioFromNumber || 'whatsapp:+14155238886' // Twilio Sandbox
            },
            
            // WhatsApp Web API (Unofficial but popular)
            whatsappWeb: {
                apiUrl: browserConfig.whatsappWebUrl || 'http://localhost:3000',
                apiKey: browserConfig.whatsappWebKey || 'YOUR_API_KEY'
            },
            
            // Local WhatsApp Bot (Personal bot) - Use browser config
            localBot: {
                apiUrl: browserConfig.apiUrl || 'http://localhost:3001',
                apiKey: browserConfig.apiKey || 'your-secret-key-123'
            },
            
            // CallMeBot (Simple solution)
            callMeBot: {
                apiKey: browserConfig.callMeBotKey || 'YOUR_CALLMEBOT_API_KEY'
            },
            
            // WhatsStack API
            whatsStack: {
                apiKey: browserConfig.whatsStackKey || 'YOUR_WHATSSTACK_API_KEY',
                instanceId: browserConfig.whatsStackInstance || 'YOUR_INSTANCE_ID'
            }
        };
    }

    initializeProvider() {
        // Check which WhatsApp provider is configured
        // Check for local bot first (default configuration is acceptable for local bot)
        if (window.whatsappConfig && window.whatsappConfig.provider === 'local') {
            this.provider = 'local_bot';
            console.log('✅ WhatsApp Service: Using Local WhatsApp Bot (from window.whatsappConfig)');
        } else if (this.config.localBot.apiUrl === 'http://localhost:3001') {
            // Local bot is configured (even with default API key)
            this.provider = 'local_bot';
            console.log('✅ WhatsApp Service: Using Local WhatsApp Bot');
        } else if (this.config.whatsappBusiness.accessToken !== 'YOUR_WHATSAPP_ACCESS_TOKEN') {
            this.provider = 'whatsapp_business';
            console.log('✅ WhatsApp Service: Using WhatsApp Business API (Official)');
        } else if (this.config.twilioWhatsApp.accountSid !== 'YOUR_TWILIO_ACCOUNT_SID') {
            this.provider = 'twilio_whatsapp';
            console.log('✅ WhatsApp Service: Using Twilio WhatsApp API');
        } else if (this.config.whatsappWeb.apiKey !== 'YOUR_API_KEY') {
            this.provider = 'whatsapp_web';
            console.log('✅ WhatsApp Service: Using WhatsApp Web API');
        } else if (this.config.callMeBot.apiKey !== 'YOUR_CALLMEBOT_API_KEY') {
            this.provider = 'callmebot';
            console.log('✅ WhatsApp Service: Using CallMeBot');
        } else if (this.config.whatsStack.apiKey !== 'YOUR_WHATSSTACK_API_KEY') {
            this.provider = 'whatsstack';
            console.log('✅ WhatsApp Service: Using WhatsStack');
        } else {
            console.log('⚠️ WhatsApp Service: No provider configured, using console logging');
        }
    }

    async sendWhatsApp(phoneNumber, message, options = {}) {
        try {
            // Clean phone number
            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            if (!cleanPhone) {
                throw new Error('Invalid phone number');
            }

            switch (this.provider) {
                case 'local_bot':
                    return await this.sendViaLocalBot(cleanPhone, message, options);
                case 'whatsapp_business':
                    return await this.sendViaWhatsAppBusiness(cleanPhone, message, options);
                case 'twilio_whatsapp':
                    return await this.sendViaTwilioWhatsApp(cleanPhone, message, options);
                case 'whatsapp_web':
                    return await this.sendViaWhatsAppWeb(cleanPhone, message, options);
                case 'callmebot':
                    return await this.sendViaCallMeBot(cleanPhone, message, options);
                case 'whatsstack':
                    return await this.sendViaWhatsStack(cleanPhone, message, options);
                default:
                    return this.sendViaConsole(cleanPhone, message, options);
            }
        } catch (error) {
            console.error('WhatsApp sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // Local WhatsApp Bot
    async sendViaLocalBot(phoneNumber, message, options) {
        // Use browser config if available, otherwise use default config
        const config = window.whatsappConfig || this.config.localBot;
        const url = config.apiUrl || this.config.localBot.apiUrl;
        
        const payload = {
            number: phoneNumber,
            message: message,
            apikey: config.apiKey || this.config.localBot.apiKey
        };

        // If it's a template message, use the template
        if (options.template) {
            payload.template = options.template;
            payload.templateData = options.templateData || {};
            delete payload.message; // Don't send both message and template
        }

        console.log('🤖 Sending WhatsApp via Local Bot:', {
            url: url,
            number: phoneNumber,
            messagePreview: message.substring(0, 50) + '...'
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        console.log('📱 Local Bot Response:', result);
        
        return {
            success: result.success || response.ok,
            provider: 'Local WhatsApp Bot',
            response: result,
            messageId: result.messageId
        };
    }

    // WhatsApp Business API (Official)
    async sendViaWhatsAppBusiness(phoneNumber, message, options) {
        const url = `https://graph.facebook.com/v17.0/${this.config.whatsappBusiness.phoneNumberId}/messages`;
        
        const payload = {
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "text",
            text: {
                body: message
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.whatsappBusiness.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        return {
            success: response.ok,
            provider: 'WhatsApp Business API',
            response: result,
            messageId: result.messages?.[0]?.id
        };
    }

    // Twilio WhatsApp API
    async sendViaTwilioWhatsApp(phoneNumber, message, options) {
        const accountSid = this.config.twilioWhatsApp.accountSid;
        const authToken = this.config.twilioWhatsApp.authToken;
        const fromNumber = this.config.twilioWhatsApp.fromNumber;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        
        const payload = new URLSearchParams({
            To: `whatsapp:${phoneNumber}`,
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
            provider: 'Twilio WhatsApp',
            response: result,
            messageId: result.sid
        };
    }

    // WhatsApp Web API (Unofficial)
    async sendViaWhatsAppWeb(phoneNumber, message, options) {
        const url = `${this.config.whatsappWeb.apiUrl}/send-message`;
        
        const payload = {
            number: phoneNumber,
            message: message,
            apikey: this.config.whatsappWeb.apiKey
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
            success: result.success || response.ok,
            provider: 'WhatsApp Web API',
            response: result,
            messageId: result.id || result.messageId
        };
    }

    // CallMeBot (Simple solution)
    async sendViaCallMeBot(phoneNumber, message, options) {
        // CallMeBot requires phone number registration first
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${this.config.callMeBot.apiKey}`;
        
        const response = await fetch(url, {
            method: 'GET'
        });

        const result = await response.text();
        
        return {
            success: response.ok && !result.includes('error'),
            provider: 'CallMeBot',
            response: result,
            messageId: 'callmebot_' + Date.now()
        };
    }

    // WhatsStack API
    async sendViaWhatsStack(phoneNumber, message, options) {
        const url = 'https://api.whatsstack.com/v1/messages';
        
        const payload = {
            instance_id: this.config.whatsStack.instanceId,
            to: phoneNumber,
            message: message
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.whatsStack.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        return {
            success: response.ok,
            provider: 'WhatsStack',
            response: result,
            messageId: result.message_id
        };
    }

    // Console logging (for testing)
    sendViaConsole(phoneNumber, message, options) {
        console.log('📱 WHATSAPP SIMULATION:');
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
        
        // Convert to string and remove all non-digits
        let cleaned = String(phoneNumber).replace(/\D/g, '');
        
        console.log(`📞 Original phone: ${phoneNumber} → Cleaned: ${cleaned}`);
        
        // Add Indian country code (+91) if missing
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned; // Add India country code
            console.log(`🇮🇳 Added country code: ${cleaned}`);
        } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
            // Already has country code
            console.log(`✅ Country code already present: ${cleaned}`);
        } else if (cleaned.length === 13 && cleaned.startsWith('091')) {
            // Remove leading 0 from country code
            cleaned = cleaned.substring(1);
            console.log(`🔧 Fixed country code format: ${cleaned}`);
        }
        
        // For WhatsApp, we don't need + prefix for most APIs
        if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1);
        }
        
        // Final validation
        if (cleaned.length !== 12 || !cleaned.startsWith('91')) {
            console.warn(`⚠️ Unusual phone format: ${cleaned} (length: ${cleaned.length})`);
        }
        
        console.log(`📱 Final WhatsApp number: ${cleaned}`);
        return cleaned;
    }

    // Enhanced message templates with emojis for WhatsApp
    getMessageTemplate(type, data) {
        const templates = {
            'outpass_submitted': `🎓 Hi ${data.studentName}!\n\n✅ Your outpass request has been submitted successfully.\n\n📅 Date: ${data.fromDate}\n🔗 Reference: ${data.outpassId}\n\nYour mentor will review it soon. 📋`,
            
            'outpass_approved': `🎉 Great news ${data.studentName}!\n\n✅ Your outpass for ${data.fromDate} has been APPROVED by ${data.mentorName}.\n\n🚗 Have a safe trip!\n💬 ${data.comments || 'No additional comments'}`,
            
            'outpass_rejected': `❌ Hi ${data.studentName},\n\nYour outpass request for ${data.fromDate} has been rejected by ${data.mentorName}.\n\n📝 Reason: ${data.reason}\n\nPlease contact your mentor for more details. 📞`,
            
            'mentor_notification': `🔔 New Outpass Request\n\n👤 Student: ${data.studentName}\n📅 Date: ${data.fromDate}\n📝 Reason: ${data.reason}\n\nPlease review and approve/reject. 📋\n\n🏫 Amity University Outpass System`,
            
            'reminder': `⏰ Reminder!\n\nYour outpass expires on ${data.toDate}.\n\nPlease return to campus on time. 🏫\n\nSafe travels! 🚗`,
            
            'overdue': `🚨 URGENT!\n\nYour outpass expired on ${data.toDate}.\n\nPlease contact your mentor immediately. 📞\n\n🏫 Amity University`
        };
        
        return templates[type] || data.message;
    }

    // Send WhatsApp with media (images, documents)
    async sendWhatsAppWithMedia(phoneNumber, message, mediaUrl, mediaType = 'image') {
        try {
            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            
            if (this.provider === 'whatsapp_business') {
                const url = `https://graph.facebook.com/v17.0/${this.config.whatsappBusiness.phoneNumberId}/messages`;
                
                const payload = {
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: mediaType,
                    [mediaType]: {
                        link: mediaUrl,
                        caption: message
                    }
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.whatsappBusiness.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                return {
                    success: response.ok,
                    provider: 'WhatsApp Business API',
                    response: result,
                    messageId: result.messages?.[0]?.id
                };
            } else {
                // Fallback to text message for other providers
                return await this.sendWhatsApp(phoneNumber, `${message}\n\n📎 Media: ${mediaUrl}`);
            }
        } catch (error) {
            console.error('WhatsApp media sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send WhatsApp template message (for WhatsApp Business)
    async sendWhatsAppTemplate(phoneNumber, templateName, templateParams = []) {
        try {
            if (this.provider !== 'whatsapp_business') {
                throw new Error('Template messages only supported with WhatsApp Business API');
            }

            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            const url = `https://graph.facebook.com/v17.0/${this.config.whatsappBusiness.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: "en"
                    },
                    components: templateParams.length > 0 ? [
                        {
                            type: "body",
                            parameters: templateParams.map(param => ({
                                type: "text",
                                text: param
                            }))
                        }
                    ] : []
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.whatsappBusiness.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            return {
                success: response.ok,
                provider: 'WhatsApp Business API Template',
                response: result,
                messageId: result.messages?.[0]?.id
            };
        } catch (error) {
            console.error('WhatsApp template sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // Bulk WhatsApp messaging
    async sendBulkWhatsApp(phoneNumbers, message, options = {}) {
        const results = [];
        
        for (const phoneNumber of phoneNumbers) {
            try {
                const result = await this.sendWhatsApp(phoneNumber, message, options);
                results.push({
                    phoneNumber,
                    ...result
                });
                
                // Add delay between messages to avoid rate limiting
                await this.delay(options.delay || 2000);
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

    // Get delivery status
    async getWhatsAppStatus(messageId, provider) {
        switch (provider) {
            case 'whatsapp_business':
                return await this.getWhatsAppBusinessStatus(messageId);
            case 'twilio_whatsapp':
                return await this.getTwilioWhatsAppStatus(messageId);
            default:
                return { status: 'unknown' };
        }
    }

    async getWhatsAppBusinessStatus(messageId) {
        const url = `https://graph.facebook.com/v17.0/${messageId}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.config.whatsappBusiness.accessToken}`
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    async getTwilioWhatsAppStatus(messageId) {
        const accountSid = this.config.twilioWhatsApp.accountSid;
        const authToken = this.config.twilioWhatsApp.authToken;
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
window.WhatsAppService = WhatsAppService;

// Integration functions for the notification system
window.sendOutpassWhatsApp = async function(type, data) {
    const whatsappService = new WhatsAppService();
    
    let phoneNumber = null;
    let message = '';
    
    switch (type) {
        case 'outpass_submitted':
            phoneNumber = data.studentPhone;
            message = whatsappService.getMessageTemplate('outpass_submitted', data);
            break;
            
        case 'outpass_approved':
            phoneNumber = data.studentPhone;
            message = whatsappService.getMessageTemplate('outpass_approved', data);
            break;
            
        case 'outpass_rejected':
            phoneNumber = data.studentPhone;
            message = whatsappService.getMessageTemplate('outpass_rejected', data);
            break;
            
        case 'mentor_notification':
            phoneNumber = data.mentorPhone;
            message = whatsappService.getMessageTemplate('mentor_notification', data);
            break;
    }
    
    if (phoneNumber && message) {
        return await whatsappService.sendWhatsApp(phoneNumber, message);
    }
    
    return { success: false, error: 'Invalid WhatsApp data' };
};

console.log('✅ WhatsApp Service loaded successfully');