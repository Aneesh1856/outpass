/**
 * Utility functions for the Outpass System
 */

// Check if Firebase is loaded and initialized
function checkFirebase() {
    if (typeof firebase === 'undefined') {
        showErrorNotification('Firebase is not loaded. Please check your internet connection and refresh the page.');
        return false;
    }
    return true;
}

// Display error notification
function showErrorNotification(message, duration = 5000) {
    // Create error notification if it doesn't exist
    if (!document.getElementById('error-notification')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-notification';
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f44336; color: white; padding: 15px; border-radius: 5px; z-index: 1000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 300px;';
        document.body.appendChild(errorDiv);
    }
    
    // Update error message
    const errorElement = document.getElementById('error-notification');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after duration
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, duration);
}

// Display success notification
function showSuccessNotification(message, duration = 3000) {
    // Create success notification if it doesn't exist
    if (!document.getElementById('success-notification')) {
        const successDiv = document.createElement('div');
        successDiv.id = 'success-notification';
        successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; z-index: 1000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 300px;';
        document.body.appendChild(successDiv);
    }
    
    // Update success message
    const successElement = document.getElementById('success-notification');
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after duration
    setTimeout(() => {
        successElement.style.display = 'none';
    }, duration);
}

// Check if user is logged in
function checkStudentAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        showErrorNotification('You must be logged in to access this page');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    return true;
}

// Check if admin is logged in
function checkAdminAuth() {
    const isAdmin = sessionStorage.getItem('isAdmin');
    const adminData = sessionStorage.getItem('adminData');
    
    if (!isAdmin || !adminData) {
        showErrorNotification('Admin authentication required');
        setTimeout(() => {
            sessionStorage.clear(); // Clear any partial session data
            window.location.href = 'admin-login.html';
        }, 2000);
        return false;
    }
    return true;
}

// Format date to readable format
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as is if invalid date
    
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Handle database errors
function handleDatabaseError(error, message = 'Database operation failed') {
    console.error(error);
    let errorMessage = message + '. ';
    
    if (error.message.includes('network')) {
        errorMessage += 'Please check your internet connection.';
    } else if (error.message.includes('permission')) {
        errorMessage += 'Database access denied. Please contact administrator.';
    } else {
        errorMessage += 'Please try again or contact support.';
    }
    
    showErrorNotification(errorMessage);
    return errorMessage;
}

// Set loading state for button
function setButtonLoading(button, isLoading, originalText = 'Submit') {
    if (isLoading) {
        button.disabled = true;
        button.originalText = button.textContent; // Store original text
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.originalText || originalText;
    }
}

// Logout user
function logoutUser() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Logout admin
function logoutAdmin() {
    sessionStorage.clear();
    window.location.href = 'admin-login.html';
}