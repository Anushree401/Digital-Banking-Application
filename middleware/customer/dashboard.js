document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadDashboardData();
    setupEventListeners();
});

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

function loadDashboardData() {
    const mockData = {
        userName: 'Sarah Chen',
        totalBalance: 38420.50,
        monthlyIncome: 6200.00,
        monthlyExpenses: 2150.75,
        activeLoans: 1,
        accounts: [
            { id: 1, name: 'Primary Checking', number: '****7392', balance: 18420.50 },
            { id: 2, name: 'Emergency Fund', number: '****5801', balance: 15000.00 },
            { id: 3, name: 'Travel Reserve', number: '****2647', balance: 5000.00 }
        ],
        transactions: [
            { date: '2026-03-03', description: 'Employer Direct Deposit', type: 'Credit', amount: 6200.00 },
            { date: '2026-03-02', description: 'Whole Foods Market', type: 'Debit', amount: -87.32 },
            { date: '2026-03-01', description: 'Internet Provider - Monthly', type: 'Debit', amount: -79.99 },
            { date: '2026-02-28', description: 'ATM Withdrawal - Chase', type: 'Debit', amount: -100.00 },
            { date: '2026-02-27', description: 'Freelance Project Payment', type: 'Credit', amount: 750.00 }
        ]
    };

    document.getElementById('welcomeName').textContent = mockData.userName.split(' ')[0];
    document.getElementById('userName').textContent = mockData.userName;
    document.getElementById('totalBalance').textContent = `$${mockData.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('monthlyIncome').textContent = `$${mockData.monthlyIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('monthlyExpenses').textContent = `$${mockData.monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('activeLoans').textContent = mockData.activeLoans;

    displayAccounts(mockData.accounts);
    displayTransactions(mockData.transactions);
}

function displayAccounts(accounts) {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = '';

    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        accountItem.innerHTML = `
            <div class="account-info">
                <h4>${account.name}</h4>
                <p class="account-number">${account.number}</p>
            </div>
            <div class="account-balance">$${account.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        `;
        accountsList.appendChild(accountItem);
    });
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const amountClass = transaction.type === 'Credit' ? 'transaction-credit' : 'transaction-debit';
        const amountPrefix = transaction.type === 'Credit' ? '+' : '';
        
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.type}</td>
            <td class="${amountClass}">${amountPrefix}$${Math.abs(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        `;
        tbody.appendChild(row);
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
        alert('Logout functionality will be implemented');
        window.location.href = '../shared/login.html';
    });

    document.getElementById('transferBtn').addEventListener('click', function() {
        alert('Transfer Money functionality will be implemented');
    });

    document.getElementById('payBillBtn').addEventListener('click', function() {
        alert('Pay Bills functionality will be implemented');
    });

    document.getElementById('depositBtn').addEventListener('click', function() {
        alert('Deposit functionality will be implemented');
    });

    document.getElementById('applyLoanBtn').addEventListener('click', function() {
        window.location.href = 'loans.html';
    });
}
