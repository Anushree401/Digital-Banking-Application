document.addEventListener('DOMContentLoaded', function() {
    initializeCommonFeatures();
});

window.addEventListener('load', function() {
    console.log('Digital Banking Application Loaded');
});

function initializeCommonFeatures() {
    if (!document.querySelector('.header-container, .portal-shell')) {
        return;
    }

    document.body.classList.add('dashboard-page');
    injectDashboardThemeStyles();
    injectDashboardBrand();
    setupDashboardThemeToggle();
    setupDashboardShellControls();
}

function setupMobileMenu() {
    // Dashboard shells now handle responsive navigation through page-specific scripts.
}

function injectDashboardThemeStyles() {
    if (document.getElementById('dashboard-theme-styles')) {
        return;
    }

    const link = document.createElement('link');
    link.id = 'dashboard-theme-styles';
    link.rel = 'stylesheet';
    link.href = new URL('../shared/css/dashboard-theme.css', window.location.href).href;
    document.head.appendChild(link);
}

function injectDashboardBrand() {
    const logo = document.querySelector('.logo');
    if (!logo || logo.dataset.brandInjected === 'true') {
        return;
    }

    logo.dataset.brandInjected = 'true';

    const homeUrl = new URL('../shared/index.html', window.location.href).href;
    const logoUrl = new URL('../shared/assets/brokebank_logo.png', window.location.href).href;

    logo.innerHTML = `
        <a class="brand-link" href="${homeUrl}" aria-label="BrokeBank home">
            <img src="${logoUrl}" alt="" aria-hidden="true">
            <span>BrokeBank</span>
        </a>
    `;
}

function setupDashboardThemeToggle() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer || document.getElementById('themeToggleBtn')) {
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'theme-toggle';
    toggleButton.id = 'themeToggleBtn';

    const applyTheme = (theme) => {
        document.body.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem('dashboard-theme', theme);
        toggleButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        toggleButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        toggleButton.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    };

    const getInitialTheme = () => {
        const storedTheme = localStorage.getItem('dashboard-theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
            return storedTheme;
        }

        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    applyTheme(getInitialTheme());

    toggleButton.addEventListener('click', function() {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });

    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.appendChild(toggleButton);
    } else {
        headerContainer.appendChild(toggleButton);
    }
}

function setupDashboardShellControls() {
    const hamburgerBtn = document.querySelector('.hamburger-btn[data-dashboard-toggle="true"]');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn && sidebar && overlay && hamburgerBtn.dataset.dashboardToggleBound !== 'true') {
        hamburgerBtn.dataset.dashboardToggleBound = 'true';

        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    document.querySelectorAll('.logout-btn[data-logout-endpoint]').forEach(button => {
        if (button.dataset.logoutBound === 'true') {
            return;
        }

        button.dataset.logoutBound = 'true';

        button.addEventListener('click', async function() {
            const endpoint = button.dataset.logoutEndpoint;
            const redirectUrl = button.dataset.logoutRedirect || '../shared/login.html';
            const method = button.dataset.logoutMethod || 'POST';

            try {
                await fetch(endpoint, { method, credentials: 'include' });
            } catch (err) {
                console.error('Logout request failed:', err);
            }

            window.location.href = redirectUrl;
        });
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
