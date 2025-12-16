// API Base URL
const API_URL = 'http://localhost:3000/api';

// Authentication state
let currentUser = null;
let authToken = null;

// Initialize auth state from localStorage
function initAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateNavigation();
    }
}

// Update navigation based on auth state
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const userInfo = document.getElementById('userInfo');
    const myTicketsLink = document.getElementById('myTicketsLink');
    const usernameEl = document.getElementById('username');

    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        currentUser = JSON.parse(user);
        authToken = token;

        if (loginLink) loginLink.classList.add('hidden');
        if (registerLink) registerLink.classList.add('hidden');
        if (userInfo) {
            userInfo.classList.remove('hidden');
            if (usernameEl) usernameEl.textContent = `Hi, ${currentUser.username}`;
        }
        if (myTicketsLink) myTicketsLink.classList.remove('hidden');
    } else {
        if (loginLink) loginLink.classList.remove('hidden');
        if (registerLink) registerLink.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (myTicketsLink) myTicketsLink.classList.add('hidden');
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value; // Get selected role

    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role }) // Include role
        });

        const data = await response.json();

        if (response.ok) {
            const roleText = role === 'admin' ? 'Admin' : 'User';
            successEl.textContent = `Registration successful as ${roleText}! Please login.`;
            successEl.classList.remove('hidden');

            // Clear form
            document.getElementById('registerForm').reset();

            // Switch to login modal after 2 seconds
            setTimeout(() => {
                closeModal('registerModal');
                openModal('loginModal');
            }, 2000);
        } else {
            errorEl.textContent = data.error || 'Registration failed';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Register error:', error);
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.classList.remove('hidden');
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const errorEl = document.getElementById('loginError');
    errorEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save auth data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Check if user is admin
            if (data.user.role === 'admin') {
                // Save admin token for admin panel
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));

                // Redirect to admin dashboard
                window.location.href = '/admin/dashboard.html';
                return; // Exit function
            }

            // For regular users, stay on main site
            authToken = data.token;
            currentUser = data.user;

            // Update UI
            updateNavigation();

            // Close modal
            closeModal('loginModal');

            // Clear form
            document.getElementById('loginForm').reset();

            // Show success message
            showNotification('Login successful!', 'success');
        } else {
            errorEl.textContent = data.error || 'Login failed';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.classList.remove('hidden');
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    authToken = null;
    currentUser = null;

    updateNavigation();

    // Redirect to home if on protected page
    if (window.location.pathname.includes('my-tickets')) {
        window.location.href = '/';
    }

    showNotification('Logged out successfully', 'success');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Require auth (redirect to home if not logged in)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.animation = 'fadeInUp 0.3s ease-out';

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Helper function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        logout();
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
