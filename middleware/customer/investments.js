let investmentsData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadInvestmentsData();
    setupEventListeners();
});

async function loadInvestmentsData() {
    try {
        const res = await fetch('/api/investments', {
            credentials: 'include'
        });
        if (res.status === 401) {
            showNotification('You are logged out. Please login again.', 'error');
            window.location.href = '/auth/login';
            return;
        }
        if (!res.ok) {
            throw new Error('Failed to fetch investments');
        }
        investmentsData = await res.json();
        const investments = investmentsData;
        console.log('INVESTMENTS DATA:', investments);
        displayInvestments(investments);
    } catch (err) {
        console.error(err);
        showNotification('Error loading investments', 'error');
    }
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
                <span class="info-value">$${(Number(investment.amount) || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Current Value</span>
                <span class="info-value">$${(Number(investment.currentValue) || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Returns</span>
                <span class="info-value" style="color: ${profitColor};">$${(Number(profit) || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Invested On</span>
                <span class="info-value">${investment.investedDate}</span>
            </div>
        `;
        investmentsList.appendChild(investmentCard);
        const withdrawBtn = investmentCard.querySelector('.withdraw-btn');
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
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/auth/login';
    });

    document.getElementById('browseOffersBtn').addEventListener('click', async function() {
        try {
            const res = await fetch('/api/investments/offers', {
                credentials: 'include'
            });
            const offers = await res.json();
            console.log('Offers:', offers);
            showNotification('Offers loaded (check console)', 'info');
        } catch (err) {
            console.error(err);
            showNotification('Error loading offers', 'error');
        }
    });

    document.getElementById('makeInvestmentBtn').addEventListener('click', async function() {
        const amount = prompt('Enter investment amount:');
        if (!amount || isNaN(amount)) {
            return showNotification('Invalid amount', 'error');
        }
        try {
            const res = await fetch('/api/investments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ amount: Number(amount) })
            });
            if (res.status === 401) {
                showNotification('Session expired. Login again.', 'error');
                window.location.href = '/auth/login';
                return;
            }
            if (!res.ok) {
                const errText = await res.text();
                console.error('Backend error:', errText);
                showNotification('Error creating investment', 'error');
                return;
            }
            showNotification('Investment created!', 'success');
            loadInvestmentsData(); // refresh
        } catch (err) {
            console.error(err);
            showNotification('Error creating investment', 'error');
        }
    });

    document.getElementById('portfolioBtn').addEventListener('click', function() {
        if (investmentsData.length === 0) {
            return showNotification('No investments found', 'error');
        }
        let totalInvested = 0;
        let totalCurrent = 0;
        investmentsData.forEach(inv => {
            totalInvested += Number(inv.amount || 0);
            totalCurrent += Number(inv.currentValue || 0);
        });
        const profit = totalCurrent - totalInvested;
        const profitColor = profit >= 0 ? '#5eb575' : '#d97974';
        const container = document.getElementById('portfolioSummary');
        container.innerHTML = `
            <h3>Portfolio Summary</h3>
            <div class="summary-row">
                <span>Total Invested</span>
                <span>$${totalInvested.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Current Value</span>
                <span>$${totalCurrent.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Profit / Loss</span>
                <span style="color: ${profitColor};">
                    $${profit.toFixed(2)}
                </span>
            </div>
        `;
        container.style.display = 'block';
    });

    document.getElementById('withdrawBtn').addEventListener('click', async function() {
        if (investmentsData.length === 0) {
            return showNotification('No investments found', 'error');
        }
        // create selection list
        let list = 'Select Investment:\n';
        investmentsData.forEach(inv => {
            list += `${inv.id}: ${inv.name} ($${inv.amount})\n`;
        });
        const investmentId = prompt(list);
        const amount = prompt('Enter amount to withdraw:');
        if (!investmentId || !amount || isNaN(amount)) {
            return showNotification('Invalid input', 'error');
        }
        try {
            const res = await fetch(`/api/investments/${investmentId}/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ amount: Number(amount) })
            });
            if (res.status === 401) {
                showNotification('Session expired. Login again.', 'error');
                window.location.href = '/auth/login';
                return;
            }
            if (!res.ok) {
                const errText = await res.text();
                console.error('Withdraw backend error:', errText);
                showNotification('Withdraw failed', 'error');
                return;
            }
            showNotification('Withdraw successful', 'success');
            loadInvestmentsData();
        } catch (err) {
            console.error(err);
            showNotification('Error withdrawing', 'error');
        }
    });
}
