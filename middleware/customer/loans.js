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
        // const paidPercent = 30; 
        // const outstanding = principal - (emi * (tenure * (paidPercent / 100)));
        // paid percent = (paid months / total months) * 100
        const paidMonths = loan.paid_months || 0;
        const totalMonths = tenure;

        const paidPercent = totalMonths > 0 
            ? (paidMonths / totalMonths) * 100 
            : 0;

        const outstanding = loan.outstanding_amount ?? 
            (principal - (emi * paidMonths));
        
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
            <div class="loan-actions">
                <button class="view-schedule-btn" data-loan-id="${loan.id}">View Schedule</button>
                ${loan.status !== 'closed' ? `<button class="payoff-btn" data-loan-id="${loan.id}">Early Payoff</button>` : ''}
            </div>
        `;
        loansList.appendChild(loanCard);
    });
}

function initiateEarlyPayoff(loanId) {
    // Get loan details first to show payoff amount
    fetch(`/api/loans/${loanId}/schedule`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const loan = data.loan;
            const outstanding = Number(loan.principal_amount) - (loan.emi_amount * loan.paid_months);
            const remainingMonths = loan.tenure_months - loan.paid_months;
            const payoffFee = remainingMonths > 6 ? outstanding * 0.02 : 0;
            const totalPayoff = outstanding + payoffFee;

            if (confirm(`Early Payoff Confirmation\n\nLoan: ${loan.type} #${loan.id}\nOutstanding Amount: $${outstanding.toLocaleString()}\nEarly Payoff Fee: $${payoffFee.toLocaleString()}\nTotal Amount: $${totalPayoff.toLocaleString()}\n\nAre you sure you want to proceed? This action cannot be undone.`)) {
                processEarlyPayoff(loanId);
            }
        })
        .catch(err => {
            alert("Failed to load loan details: " + err.message);
        });
}

async function processEarlyPayoff(loanId) {
    try {
        const res = await fetch('/api/loans/payoff', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loan_id: loanId })
        });

        const data = await res.json();

        if (res.ok) {
            alert(`Early payoff completed successfully!\n\nPayoff Details:\nOutstanding: $${data.payoff_details.outstanding_amount.toLocaleString()}\nFee: $${data.payoff_details.payoff_fee.toLocaleString()}\nTotal Paid: $${data.payoff_details.total_amount.toLocaleString()}`);
            location.reload();
        } else {
            alert(data.error || "Failed to process early payoff");
        }
    } catch (err) {
        alert("Early payoff failed: " + err.message);
    }
}

function openLoanScheduleSelection() {
    fetch('/api/loans', { credentials: 'include' })
        .then(res => res.json())
        .then(loans => {
            if (!Array.isArray(loans) || loans.length === 0) {
                alert('No loans available to view.');
                return;
            }
            showLoanSelectionModal(loans);
        })
        .catch(err => {
            alert('Failed to load loans: ' + err.message);
        });
}

function openLoanPayoffSelection() {
    fetch('/api/loans', { credentials: 'include' })
        .then(res => res.json())
        .then(loans => {
            if (!Array.isArray(loans) || loans.length === 0) {
                alert('No loans available for payoff.');
                return;
            }
            const activeLoans = loans.filter(loan => loan.status !== 'closed');
            if (activeLoans.length === 0) {
                alert('No active loans available for early payoff.');
                return;
            }
            showPayoffSelectionModal(activeLoans);
        })
        .catch(err => {
            alert('Failed to load loans: ' + err.message);
        });
}

function applyLoanFlow() {
    const loanType = prompt('Enter Loan Type (e.g., Personal, Home, Business):');
    if (!loanType || loanType.trim() === '') {
        alert('Loan type is required');
        return;
    }

    const amount = prompt('Enter Loan Amount (e.g., 50000):');
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert('Please enter a valid loan amount');
        return;
    }

    const tenure = prompt('Enter Tenure in months (e.g., 12):');
    if (!tenure || isNaN(tenure) || Number(tenure) <= 0) {
        alert('Please enter a valid tenure in months');
        return;
    }

    fetch('/api/loans/apply', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            principal_amount: Number(amount),
            tenure_months: Number(tenure),
            loan_type: loanType.trim()
        })
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(result => {
            if (result.ok) {
                alert('Loan application submitted successfully');
                location.reload();
            } else {
                alert(result.data.error || 'Failed to submit loan application');
            }
        })
        .catch(err => {
            alert('Failed to apply loan: ' + err.message);
        });
}

function makePaymentFlow() {
    const loanId = prompt('Enter Loan ID:');
    const amount = prompt('Enter payment amount:');

    if (!loanId || !amount || isNaN(amount) || Number(amount) <= 0) {
        alert('Please enter valid loan ID and payment amount');
        return;
    }

    fetch('/api/loans/pay', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            loan_id: loanId,
            amount: Number(amount)
        })
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(result => {
            if (result.ok) {
                alert('Payment successful');
                location.reload();
            } else {
                alert(result.data.error || 'Failed to process payment');
            }
        })
        .catch(err => {
            alert('Payment failed: ' + err.message);
        });
}

async function viewLoanSchedule(loanId) {
    try {
        const res = await fetch(`/api/loans/${loanId}/schedule`, {
            credentials: 'include'
        });

        if (!res.ok) {
            alert("Failed to load schedule");
            return;
        }

        const data = await res.json();
        showScheduleModal(data);
    } catch (err) {
        alert("Failed to load schedule: " + err.message);
    }
}

function showScheduleModal(data) {
    const { loan, schedule } = data;

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content schedule-modal">
            <div class="modal-header">
                <h3>EMI Schedule - ${loan.type} Loan</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="schedule-summary">
                    <div class="summary-item">
                        <span class="label">Principal Amount:</span>
                        <span class="value">$${loan.principal_amount.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Interest Rate:</span>
                        <span class="value">${loan.interest_rate}% p.a.</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Tenure:</span>
                        <span class="value">${loan.tenure_months} months</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Monthly EMI:</span>
                        <span class="value">$${loan.emi_amount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="schedule-table-container">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>EMI</th>
                                <th>Principal</th>
                                <th>Interest</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schedule.map(item => `
                                <tr class="${item.paid ? 'paid' : ''}">
                                    <td>${item.month}</td>
                                    <td>$${item.emi.toFixed(2)}</td>
                                    <td>$${item.principal.toFixed(2)}</td>
                                    <td>$${item.interest.toFixed(2)}</td>
                                    <td>$${item.balance.toFixed(2)}</td>
                                    <td>${item.paid ? '✓ Paid' : 'Pending'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle loan selection
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-loan-btn')) {
            const loanId = e.target.getAttribute('data-loan-id');
            document.body.removeChild(modal);
            viewLoanSchedule(loanId);
        }
    });

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showPayoffSelectionModal(loans) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Select Loan for Early Payoff</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="loan-selection-list">
                    ${loans.map(loan => {
                        const outstanding = Number(loan.outstanding_amount || loan.principal_amount);
                        const remainingMonths = loan.tenure_months - (loan.paid_months || 0);
                        const payoffFee = remainingMonths > 6 ? outstanding * 0.02 : 0;
                        const totalPayoff = outstanding + payoffFee;

                        return `
                            <div class="loan-selection-item" data-loan-id="${loan.id}">
                                <div class="loan-info">
                                    <h4>${loan.loan_type || 'Loan'} #${loan.id}</h4>
                                    <p>Outstanding: $${outstanding.toLocaleString()}</p>
                                    <p>Remaining Months: ${remainingMonths}</p>
                                    ${payoffFee > 0 ? `<p>Early Payoff Fee (2%): $${payoffFee.toLocaleString()}</p>` : ''}
                                    <p><strong>Total Payoff Amount: $${totalPayoff.toLocaleString()}</strong></p>
                                </div>
                                <button class="payoff-loan-btn" data-loan-id="${loan.id}">Payoff Now</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle loan payoff
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('payoff-loan-btn')) {
            const loanId = e.target.getAttribute('data-loan-id');
            const loanItem = e.target.closest('.loan-selection-item');
            const totalAmount = loanItem.querySelector('strong').textContent.replace('Total Payoff Amount: $', '').replace(/,/g, '');

            if (confirm(`Are you sure you want to payoff this loan for $${totalAmount}? This action cannot be undone.`)) {
                document.body.removeChild(modal);
                processEarlyPayoff(loanId);
            }
        }
    });

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
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

    document.getElementById('logoutBtn').addEventListener('click', async function() {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '../shared/login.html';
    });

    // Card-level loan action buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-schedule-btn')) {
            const loanId = event.target.getAttribute('data-loan-id');
            viewLoanSchedule(loanId);
        }
        if (event.target.classList.contains('payoff-btn')) {
            const loanId = event.target.getAttribute('data-loan-id');
            initiateEarlyPayoff(loanId);
        }
    });

    const applyBtn = document.getElementById('applyLoanBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyLoanFlow);
    }

    const paymentBtn = document.getElementById('makePaymentBtn');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', makePaymentFlow);
    }

    const scheduleBtn = document.getElementById('viewScheduleBtn');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', openLoanScheduleSelection);
    }

    const payoffBtn = document.getElementById('earlyPayoffBtn');
    if (payoffBtn) {
        payoffBtn.addEventListener('click', openLoanPayoffSelection);
    }
}

