// Admin API helpers
const ADMIN_API_URL = '/api';

// Check admin authentication
function isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken');
}

// Require admin auth
function requireAdminAuth() {
    if (!isAdminAuthenticated()) {
        // Redirect to main site login instead
        window.location.href = '/?showLogin=true';
        return false;
    }
    return true;
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // Redirect to main site
    window.location.href = '/';
}

// Fetch with admin auth
async function fetchWithAdminAuth(url, options = {}) {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    // Default to JSON unless explicitly removed (by passing null) or set to something else
    if (headers['Content-Type'] === undefined) {
        headers['Content-Type'] = 'application/json';
    } else if (headers['Content-Type'] === null) {
        delete headers['Content-Type'];
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        adminLogout();
        throw new Error('Session expired');
    }

    return response;
}

// Show notification
function showNotification(message, type = 'info') {
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

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format datetime
function formatDateTime(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Set active nav
function setActiveNav(pageId) {
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.admin-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}
