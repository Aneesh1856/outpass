// Comprehensive Notification System for Outpass Management
class NotificationSystem {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.notificationRef = null;
        this.unreadCount = 0;
        this.init();
    }

    async init() {
        try {
            // Wait for Firebase to be ready
            if (typeof firebase === 'undefined') {
                console.error('Firebase not loaded');
                return;
            }

            this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!this.currentUser) {
                console.log('No user session found');
                return;
            }

            await this.setupRealtimeListeners();
            await this.setupNotificationUI();
            await this.requestPushPermission();
            
            this.isInitialized = true;
            console.log('✅ Notification system initialized');
        } catch (error) {
            console.error('❌ Notification system initialization error:', error);
        }
    }

    // Setup real-time Firebase listeners for notifications
    async setupRealtimeListeners() {
        const userId = this.currentUser.key || this.currentUser.id;
        const userRole = this.currentUser.role || 'student';

        // Listen for notifications specific to this user
        this.notificationRef = firebase.database().ref(`notifications/${userId}`);
        
        this.notificationRef.on('child_added', (snapshot) => {
            const notification = snapshot.val();
            this.handleNewNotification(notification, snapshot.key);
        });

        // Listen for outpass updates if user is a student
        if (userRole === 'student') {
            this.setupStudentListeners();
        }

        // Listen for new outpass submissions if user is a mentor
        if (userRole === 'mentor') {
            this.setupMentorListeners();
        }

        // Listen for all activities if user is admin
        if (userRole === 'admin') {
            this.setupAdminListeners();
        }
    }

    setupStudentListeners() {
        const studentUsername = this.currentUser.username;
        
        // Listen for outpass status changes
        firebase.database().ref('outpasses')
            .orderByChild('studentUsername')
            .equalTo(studentUsername)
            .on('child_changed', (snapshot) => {
                const outpass = snapshot.val();
                this.handleOutpassStatusChange(outpass, snapshot.key);
            });
    }

    setupMentorListeners() {
        const mentorName = this.currentUser.name;
        
        // Listen for new outpass submissions from assigned students
        firebase.database().ref('outpasses')
            .orderByChild('mentorName')
            .equalTo(mentorName)
            .on('child_added', (snapshot) => {
                const outpass = snapshot.val();
                if (outpass.status === 'pending') {
                    this.handleNewOutpassSubmission(outpass, snapshot.key);
                }
            });
    }

    setupAdminListeners() {
        // Listen for all outpass activities
        firebase.database().ref('outpasses')
            .limitToLast(1)
            .on('child_added', (snapshot) => {
                const outpass = snapshot.val();
                this.handleAdminNotification(outpass, snapshot.key);
            });
    }

    // Handle different types of notifications
    handleNewNotification(notification, notificationId) {
        this.showNotificationPopup(notification);
        this.updateNotificationBadge();
        this.playNotificationSound();
        
        // Mark as delivered
        this.markNotificationAsDelivered(notificationId);
    }

    handleOutpassStatusChange(outpass, outpassId) {
        const notification = {
            type: 'outpass_status_change',
            title: `Outpass ${outpass.status.toUpperCase()}`,
            message: `Your outpass for ${outpass.fromDate} has been ${outpass.status}`,
            timestamp: new Date().toISOString(),
            outpassId: outpassId,
            status: outpass.status,
            mentorComments: outpass.mentorComments || ''
        };

        this.showNotificationPopup(notification);
        this.sendWhatsAppNotification(notification);
        this.sendPushNotification(notification);
    }

    handleNewOutpassSubmission(outpass, outpassId) {
        const notification = {
            type: 'new_outpass_submission',
            title: 'New Outpass Request',
            message: `${outpass.studentName} submitted an outpass request for ${outpass.fromDate}`,
            timestamp: new Date().toISOString(),
            outpassId: outpassId,
            studentName: outpass.studentName,
            reason: outpass.reason
        };

        this.showNotificationPopup(notification);
        this.sendWhatsAppNotification(notification);
        this.sendPushNotification(notification);
    }

    handleAdminNotification(outpass, outpassId) {
        const notification = {
            type: 'admin_alert',
            title: 'System Activity',
            message: `New outpass activity: ${outpass.studentName} - ${outpass.status}`,
            timestamp: new Date().toISOString(),
            outpassId: outpassId
        };

        this.showNotificationPopup(notification);
    }

    // Show in-app notification popup
    showNotificationPopup(notification) {
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification-popup';
        notificationEl.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${this.getNotificationIcon(notification.type)}</span>
                <span class="notification-title">${notification.title}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">
                <p>${notification.message}</p>
                ${notification.mentorComments ? `<p><strong>Comments:</strong> ${notification.mentorComments}</p>` : ''}
                <small class="notification-time">${new Date(notification.timestamp).toLocaleString()}</small>
            </div>
        `;

        // Add styles
        this.addNotificationStyles();

        // Add to page
        document.body.appendChild(notificationEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
        }, 5000);

        // Close button functionality
        notificationEl.querySelector('.notification-close').addEventListener('click', () => {
            notificationEl.parentNode.removeChild(notificationEl);
        });

        // Store in notification history
        this.storeNotificationHistory(notification);
    }

    // Send WhatsApp notification
    async sendWhatsAppNotification(notification) {
        try {
            const phoneNumber = this.getPhoneNumber();
            if (!phoneNumber) return;

            // Use WhatsApp service if available
            if (window.sendOutpassWhatsApp) {
                const whatsappData = {
                    studentPhone: phoneNumber,
                    studentName: this.currentUser.name || this.currentUser.fullName,
                    fromDate: notification.outpassId ? 'today' : 'N/A',
                    outpassId: notification.outpassId || 'N/A',
                    mentorName: notification.mentorName || 'Your Mentor',
                    reason: notification.mentorComments || notification.message,
                    comments: notification.mentorComments || ''
                };

                const type = this.getWhatsAppMessageType(notification.type);
                const result = await window.sendOutpassWhatsApp(type, whatsappData);
                
                if (result.success) {
                    console.log('✅ WhatsApp notification sent via', result.provider);
                } else {
                    console.error('❌ WhatsApp sending failed:', result.error);
                }
            } else {
                // Fallback: console logging
                console.log('📱 WhatsApp would be sent:', {
                    to: phoneNumber,
                    message: `${notification.title}: ${notification.message}`,
                    from: 'Amity Outpass System'
                });
            }

        } catch (error) {
            console.error('WhatsApp sending error:', error);
        }
    }

    // Map notification types to WhatsApp message types
    getWhatsAppMessageType(notificationType) {
        const typeMap = {
            'outpass_status_change': 'outpass_approved', // Will be determined by status
            'new_outpass_submission': 'mentor_notification',
            'admin_alert': 'mentor_notification'
        };
        
        return typeMap[notificationType] || 'outpass_submitted';
    }

    // Send browser push notification
    async sendPushNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.type,
                requireInteraction: true
            });
        }
    }

    // Request push notification permission
    async requestPushPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        }
    }

    // Utility functions
    getNotificationIcon(type) {
        const icons = {
            'outpass_status_change': '✅',
            'new_outpass_submission': '📋',
            'admin_alert': '⚠️',
            'default': '🔔'
        };
        return icons[type] || icons.default;
    }

    getPhoneNumber() {
        return this.currentUser.phone || 
               this.currentUser.mobile || 
               this.currentUser['Contact No'] || 
               null;
    }

    playNotificationSound() {
        // Create and play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBw==');
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore if audio play fails (browser policy)
        });
    }

    updateNotificationBadge() {
        this.unreadCount++;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
        }
    }

    markNotificationAsDelivered(notificationId) {
        if (this.notificationRef) {
            this.notificationRef.child(notificationId).update({
                delivered: true,
                deliveredAt: new Date().toISOString()
            });
        }
    }

    storeNotificationHistory(notification) {
        const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
        history.unshift(notification);
        // Keep only last 50 notifications
        if (history.length > 50) history.splice(50);
        localStorage.setItem('notificationHistory', JSON.stringify(history));
    }

    // Setup notification UI components
    async setupNotificationUI() {
        this.addNotificationBell();
        this.addNotificationPanel();
    }

    addNotificationBell() {
        // Add notification bell to navigation
        const navContainer = document.querySelector('.top-nav') || document.querySelector('.nav-container');
        if (!navContainer) return;

        const bellContainer = document.createElement('div');
        bellContainer.className = 'notification-bell-container';
        bellContainer.innerHTML = `
            <div class="notification-bell" onclick="toggleNotificationPanel()">
                🔔
                <span class="notification-badge" style="display: none;">0</span>
            </div>
        `;

        navContainer.appendChild(bellContainer);
    }

    addNotificationPanel() {
        const panelHTML = `
            <div id="notificationPanel" class="notification-panel" style="display: none;">
                <div class="notification-panel-header">
                    <h3>Notifications</h3>
                    <button onclick="clearAllNotifications()">Clear All</button>
                </div>
                <div class="notification-panel-body" id="notificationList">
                    <p class="no-notifications">No notifications yet</p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    addNotificationStyles() {
        if (document.getElementById('notificationStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.textContent = `
            .notification-popup {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 300px;
                max-width: 400px;
                border-left: 4px solid #FFC300;
                animation: slideInRight 0.3s ease-out;
            }

            .notification-header {
                padding: 12px 16px;
                background: #002D62;
                color: white;
                border-radius: 4px 4px 0 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .notification-icon {
                margin-right: 8px;
                font-size: 16px;
            }

            .notification-title {
                font-weight: 600;
                flex-grow: 1;
            }

            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
            }

            .notification-body {
                padding: 16px;
            }

            .notification-time {
                color: #666;
                font-size: 12px;
            }

            .notification-bell-container {
                position: relative;
                margin-left: 15px;
            }

            .notification-bell {
                cursor: pointer;
                font-size: 20px;
                position: relative;
                padding: 8px;
                border-radius: 50%;
                transition: background-color 0.3s;
            }

            .notification-bell:hover {
                background-color: rgba(255, 195, 0, 0.2);
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .notification-panel {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 350px;
                max-height: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 9999;
                overflow: hidden;
            }

            .notification-panel-header {
                padding: 16px;
                background: #002D62;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-panel-header h3 {
                margin: 0;
                font-size: 16px;
            }

            .notification-panel-header button {
                background: #FFC300;
                color: #002D62;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }

            .notification-panel-body {
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            }

            .no-notifications {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 20px;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Static methods for global access
    static async createNotification(userId, notification) {
        await firebase.database().ref(`notifications/${userId}`).push({
            ...notification,
            timestamp: new Date().toISOString(),
            read: false,
            delivered: false
        });
    }

    static async notifyOutpassStatusChange(outpass, newStatus) {
        const notification = {
            type: 'outpass_status_change',
            title: `Outpass ${newStatus.toUpperCase()}`,
            message: `Your outpass for ${outpass.fromDate} has been ${newStatus}`,
            outpassId: outpass.id,
            status: newStatus
        };

        await NotificationSystem.createNotification(outpass.studentId, notification);
    }

    static async notifyNewOutpassSubmission(outpass) {
        // Find mentor and send notification
        const mentorsSnapshot = await firebase.database().ref('mentors').once('value');
        mentorsSnapshot.forEach(child => {
            const mentor = child.val();
            if (mentor.name === outpass.mentorName) {
                const notification = {
                    type: 'new_outpass_submission',
                    title: 'New Outpass Request',
                    message: `${outpass.studentName} submitted an outpass request`,
                    outpassId: outpass.id,
                    studentName: outpass.studentName
                };

                NotificationSystem.createNotification(child.key, notification);
            }
        });
    }
}

// Global functions
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            loadNotificationHistory();
        }
    }
}

function clearAllNotifications() {
    localStorage.removeItem('notificationHistory');
    const list = document.getElementById('notificationList');
    if (list) {
        list.innerHTML = '<p class="no-notifications">No notifications yet</p>';
    }
    
    // Reset badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.style.display = 'none';
        badge.textContent = '0';
    }
}

function loadNotificationHistory() {
    const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    const list = document.getElementById('notificationList');
    
    if (!list) return;
    
    if (history.length === 0) {
        list.innerHTML = '<p class="no-notifications">No notifications yet</p>';
        return;
    }

    list.innerHTML = history.map(notification => `
        <div class="notification-item" style="padding: 10px; border-bottom: 1px solid #eee;">
            <div style="font-weight: 600; color: #002D62;">${notification.title}</div>
            <div style="font-size: 14px; margin: 5px 0;">${notification.message}</div>
            <div style="font-size: 12px; color: #666;">${new Date(notification.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

// Initialize notification system when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        window.notificationSystem = new NotificationSystem();
    }, 1000);
});

// Export for use in other scripts
window.NotificationSystem = NotificationSystem;