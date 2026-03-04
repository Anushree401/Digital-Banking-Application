document.addEventListener('DOMContentLoaded', function() {
    initializeCommonFeatures();
});

window.addEventListener('load', function() {
    console.log('Digital Banking Application Loaded');
});

function initializeCommonFeatures() {
    setupMobileMenu();
}

function setupMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (window.innerWidth <= 768) {
        sidebar.style.display = 'none';
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'block';
        }
    });
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showNotification(message, type = 'info') {
    alert(message);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
