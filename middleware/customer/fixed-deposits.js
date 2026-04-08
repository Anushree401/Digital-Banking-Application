document.addEventListener('DOMContentLoaded', function() {
    loadFDData();
    setupEventListeners();
});

async function loadFDData() {
    try {
        const res = await fetch('/api/fds', { credentials: 'include' });
        
        if (!res.ok) {
            console.error('Failed to load FDs:', res.status);
            document.getElementById('fdList').innerHTML = '<p>Unable to load fixed deposits</p>';
            return;
        }

        const fds = await res.json();
        displayFDs(fds);
    } catch (err) {
        console.error('Error loading FDs:', err);
        document.getElementById('fdList').innerHTML = '<p>Error loading fixed deposits</p>';
    }
}

function displayFDs(fds) {
    const fdList = document.getElementById('fdList');
    fdList.innerHTML = '';

    if (!fds || fds.length === 0) {
        fdList.innerHTML = '<p style="text-align: center; padding: 20px;">No fixed deposits</p>';
        return;
    }

    fds.forEach(fd => {
        const fdCard = document.createElement('div');
        fdCard.className = 'deposit-card';
        
        const principal = parseFloat(fd.principal_amount || 0);
        const rate = parseFloat(fd.interest_rate || 0);
        const startDate = new Date(fd.start_date);
        const maturityDate = new Date(fd.maturity_date);
        const tenureMonths = Math.round((maturityDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        
        // Calculate maturity amount: A = P(1 + r/100)^(n/12)
        const maturityAmount = principal * Math.pow(1 + (rate / 100), tenureMonths / 12);
        
        fdCard.innerHTML = `
            <div class="deposit-header">
                <h4>Fixed Deposit #${fd.id}</h4>
                <span class="status-badge status-${(fd.status || 'active').toLowerCase()}">${fd.status || 'active'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Principal Amount</span>
                <span class="info-value">$${principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Interest Rate</span>
                <span class="info-value">${rate.toFixed(2)}% p.a.</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tenure</span>
                <span class="info-value">${tenureMonths} months</span>
            </div>
            <div class="info-row">
                <span class="info-label">Start Date</span>
                <span class="info-value">${startDate.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Maturity Date</span>
                <span class="info-value">${maturityDate.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Maturity Amount</span>
                <span class="info-value" style="color: #5eb575; font-size: 18px;">$${maturityAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        `;
        fdList.appendChild(fdCard);
    });
}

function setupEventListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
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

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = '../shared/login.html';
    });

    document.getElementById('openFdBtn').addEventListener('click', function() {
        alert('Open New FD functionality will be implemented');
    });

    document.getElementById('renewFdBtn').addEventListener('click', function() {
        alert('Renew FD functionality will be implemented');
    });

    document.getElementById('breakFdBtn').addEventListener('click', function() {
        alert('Break FD functionality will be implemented');
    });

    document.getElementById('fdRatesBtn').addEventListener('click', function() {
        alert('View Rates functionality will be implemented');
    });
}
