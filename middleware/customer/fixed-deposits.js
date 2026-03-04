document.addEventListener('DOMContentLoaded', function() {
    loadFDData();
    setupEventListeners();
});

function loadFDData() {
    const mockFDs = [
        { 
            id: 1, 
            amount: 10000, 
            interestRate: 5.2, 
            tenure: 12, 
            startDate: '2026-01-01',
            maturityDate: '2027-01-01',
            maturityAmount: 10520,
            status: 'Active'
        },
        { 
            id: 2, 
            amount: 25000, 
            interestRate: 5.8, 
            tenure: 24, 
            startDate: '2025-08-01',
            maturityDate: '2027-08-01',
            maturityAmount: 27900,
            status: 'Active'
        }
    ];

    displayFDs(mockFDs);
}

function displayFDs(fds) {
    const fdList = document.getElementById('fdList');
    fdList.innerHTML = '';

    fds.forEach(fd => {
        const fdCard = document.createElement('div');
        fdCard.className = 'deposit-card';
        
        fdCard.innerHTML = `
            <div class="deposit-header">
                <h4>Fixed Deposit #${fd.id}</h4>
                <span class="status-badge status-active">${fd.status}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Principal Amount</span>
                <span class="info-value">$${fd.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Interest Rate</span>
                <span class="info-value">${fd.interestRate}% p.a.</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tenure</span>
                <span class="info-value">${fd.tenure} months</span>
            </div>
            <div class="info-row">
                <span class="info-label">Start Date</span>
                <span class="info-value">${fd.startDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Maturity Date</span>
                <span class="info-value">${fd.maturityDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Maturity Amount</span>
                <span class="info-value" style="color: #5eb575; font-size: 18px;">$${fd.maturityAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
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
