document.addEventListener('DOMContentLoaded', function() {
    loadLoansData();
    setupEventListeners();
});

async function loadLoansData() {
    try {
        const res = await fetch('/api/loans', { credentials: 'include' });
        
        if (!res.ok) {
            console.error('Failed to load loans:', res.status);
            document.getElementById('loansList').innerHTML = '<p>Unable to load loans</p>';
            return;
        }

        const loans = await res.json();
        displayLoans(loans);
    } catch (err) {
        console.error('Error loading loans:', err);
        document.getElementById('loansList').innerHTML = '<p>Error loading loans</p>';
    }
}

function displayLoans(loans) {
    const loansList = document.getElementById('loansList');
    loansList.innerHTML = '';

    if (!loans || loans.length === 0) {
        loansList.innerHTML = '<p style="text-align: center; padding: 20px;">No active loans</p>';
        return;
    }

    loans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        
        const principal = parseFloat(loan.principal_amount || 0);
        const rate = parseFloat(loan.interest_rate || 0);
        const tenure = parseInt(loan.tenure_months || 1);
        
        // Calculate EMI using simple formula: EMI = P(r/12)(1+r/12)^n / ((1+r/12)^n - 1)
        const monthlyRate = (rate / 12) / 100;
        const emi = monthlyRate > 0 
            ? (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
            : (principal / tenure);
        
        // Estimate outstanding based on EMI payments (assuming 30% paid)
        const paidPercent = 30;
        const outstanding = principal * (1 - paidPercent / 100);
        
        loanCard.innerHTML = `
            <div class="loan-header">
                <h4>${loan.loan_type || 'Loan'}</h4>
                <span class="status-badge status-${(loan.status || 'pending').toLowerCase()}">${loan.status || 'pending'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Loan Amount</span>
                <span class="info-value">$${principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Outstanding</span>
                <span class="info-value">$${outstanding.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Monthly EMI</span>
                <span class="info-value">$${emi.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Interest Rate</span>
                <span class="info-value">${rate.toFixed(2)}% p.a.</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tenure</span>
                <span class="info-value">${tenure} months</span>
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
