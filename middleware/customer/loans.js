document.addEventListener('DOMContentLoaded', function() {
    loadLoansData();
    setupEventListeners();
});

function loadLoansData() {
    const mockLoans = [
        { 
            id: 1, 
            type: 'Personal Loan', 
            amount: 12000, 
            disbursed: 12000,
            outstanding: 8400, 
            tenure: 36, 
            monthsLeft: 24, 
            interestRate: 9.2, 
            emi: 485.00,
            status: 'Active'
        },
        { 
            id: 2, 
            type: 'Home Loan', 
            amount: 185000, 
            disbursed: 185000,
            outstanding: 142000, 
            tenure: 240, 
            monthsLeft: 198, 
            interestRate: 6.8, 
            emi: 2150.00,
            status: 'Active'
        }
    ];

    displayLoans(mockLoans);
}

function displayLoans(loans) {
    const loansList = document.getElementById('loansList');
    loansList.innerHTML = '';

    loans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        const paidPercent = ((loan.tenure - loan.monthsLeft) / loan.tenure * 100).toFixed(1);
        
        loanCard.innerHTML = `
            <div class="loan-header">
                <h4>${loan.type}</h4>
                <span class="status-badge status-active">${loan.status}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Loan Amount</span>
                <span class="info-value">$${loan.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Outstanding</span>
                <span class="info-value">$${loan.outstanding.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">EMI Amount</span>
                <span class="info-value">$${loan.emi.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Interest Rate</span>
                <span class="info-value">${loan.interestRate}% p.a.</span>
            </div>
            <div class="info-row">
                <span class="info-label">Months Remaining</span>
                <span class="info-value">${loan.monthsLeft} of ${loan.tenure}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${paidPercent}%"></div>
            </div>
            <p style="text-align: center; color: #7a8f99; font-size: 12px; margin-top: 5px;">${paidPercent}% paid</p>
        `;
        loansList.appendChild(loanCard);
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

    document.getElementById('applyLoanBtn').addEventListener('click', function() {
        alert('Apply for Loan functionality will be implemented');
    });

    document.getElementById('makePaymentBtn').addEventListener('click', function() {
        alert('Make Payment functionality will be implemented');
    });

    document.getElementById('viewScheduleBtn').addEventListener('click', function() {
        alert('View Schedule functionality will be implemented');
    });

    document.getElementById('earlyPayoffBtn').addEventListener('click', function() {
        alert('Early Payoff functionality will be implemented');
    });
}
