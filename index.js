/**
 * Outpass System - Main JavaScript
 * 
 * This file provides global error handling and initialization
 * for the Outpass System application.
 */

// Check if running on localhost or a real server
const isLocalhost = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1" ||
                    window.location.hostname === "";

// Enable detailed error messages on localhost
if (isLocalhost) {
    console.log('Development mode - detailed errors enabled');
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error || event.message);
    
    // Only show UI errors on localhost/development
    if (isLocalhost) {
        const errorMessage = event.error ? event.error.message : event.message;
        if (typeof showErrorNotification === 'function') {
            showErrorNotification(`Error: ${errorMessage}. Check console for details.`);
        } else {
            alert(`Error: ${errorMessage}. Check console for details.`);
        }
    }
    
    // Prevent the error from showing in the console again
    event.preventDefault();
});

// Firebase connection monitor
function monitorFirebaseConnection() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('.info/connected').on('value', function(snapshot) {
            const isConnected = snapshot.val();
            console.log('Firebase connection status:', isConnected ? 'Connected' : 'Disconnected');
            
            // Update connection status indicator if it exists
            const statusIndicator = document.getElementById('connection-status');
            if (statusIndicator) {
                statusIndicator.className = isConnected ? 'connected' : 'disconnected';
                statusIndicator.title = isConnected ? 'Connected to Firebase' : 'Disconnected from Firebase';
            }
            
            // Show notification on disconnect
            if (!isConnected && typeof showErrorNotification === 'function') {
                showErrorNotification('Database connection lost. Please check your internet connection.');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Outpass System initializing...');
    
    // Add connection status indicator to the page
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connection-status';
    statusDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; width: 10px; height: 10px; border-radius: 50%; background-color: gray; z-index: 1000;';
    statusDiv.title = 'Checking database connection...';
    document.body.appendChild(statusDiv);
    
    // Start monitoring Firebase connection after a short delay
    setTimeout(monitorFirebaseConnection, 2000);
    
    // Add global navigation event listeners if present
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
});