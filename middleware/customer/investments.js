document.addEventListener('DOMContentLoaded', function() {
    loadInvestmentsData();
    setupEventListeners();
});

function loadInvestmentsData() {
    const mockInvestments = [
        { 
            id: 1, 
            name: 'Balanced Index Fund', 
            type: 'Mutual Fund',
            amount: 8000, 
            currentValue: 8720,
            returns: 9.0,
            investedDate: '2025-09-01',
            status: 'Active'
        },
        { 
            id: 2, 
            name: 'Dividend Growth Fund', 
            type: 'Mutual Fund',
            amount: 12000, 
            currentValue: 12540,
            returns: 4.5,
            investedDate: '2025-11-20',
            status: 'Active'
        }
    ];

    displayInvestments(mockInvestments);
}

function displayInvestments(investments) {
    const investmentsList = document.getElementById('investmentsList');
    investmentsList.innerHTML = '';

    investments.forEach(investment => {
        const investmentCard = document.createElement('div');
        investmentCard.className = 'investment-card';
        const profit = investment.currentValue - investment.amount;
        const profitColor = profit >= 0 ? '#5eb575' : '#d97974';
        
        investmentCard.innerHTML = `
            <div class="investment-header">
                <div>
                    <h4>${investment.name}</h4>
                    <p style="color: #7a8f99; font-size: 14px;">${investment.type}</p>
                </div>
                <span class="status-badge status-active">${investment.status}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Invested Amount</span>
                <span class="info-value">$${investment.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Current Value</span>
                <span class="info-value">$${investment.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Returns</span>
                <span class="info-value" style="color: ${profitColor};">$${profit.toLocaleString('en-US', {minimumFractionDigits: 2})} (${investment.returns}%)</span>
            </div>
            <div class="info-row">
                <span class="info-label">Invested On</span>
                <span class="info-value">${investment.investedDate}</span>
            </div>
        `;
        investmentsList.appendChild(investmentCard);
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

    document.getElementById('browseOffersBtn').addEventListener('click', function() {
        alert('Browse Offers functionality will be implemented');
    });

    document.getElementById('makeInvestmentBtn').addEventListener('click', function() {
        alert('New Investment functionality will be implemented');
    });

    document.getElementById('withdrawBtn').addEventListener('click', function() {
        alert('Withdraw functionality will be implemented');
    });

    document.getElementById('portfolioBtn').addEventListener('click', function() {
        alert('View Portfolio functionality will be implemented');
    });
}
