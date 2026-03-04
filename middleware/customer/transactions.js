document.addEventListener('DOMContentLoaded', function() {
    loadTransactionsData();
    setupFilters();
    setupEventListeners();
});

function loadTransactionsData() {
    const mockTransactions = [
        { date: '2026-03-03', description: 'Employer Direct Deposit', account: '****7392', type: 'Credit', amount: 6200.00, balance: 18420.50 },
        { date: '2026-03-02', description: 'Whole Foods Market', account: '****7392', type: 'Debit', amount: -87.32, balance: 12220.50 },
        { date: '2026-03-01', description: 'Internet Provider - Monthly', account: '****7392', type: 'Debit', amount: -79.99, balance: 12307.82 },
        { date: '2026-02-28', description: 'ATM Withdrawal - Chase Branch', account: '****7392', type: 'Debit', amount: -100.00, balance: 12387.81 },
        { date: '2026-02-27', description: 'Freelance Project Payment', account: '****7392', type: 'Credit', amount: 750.00, balance: 12487.81 },
        { date: '2026-02-26', description: 'Starbucks Coffee', account: '****7392', type: 'Debit', amount: -6.45, balance: 11737.81 },
        { date: '2026-02-25', description: 'Costco Wholesale', account: '****7392', type: 'Debit', amount: -142.18, balance: 11744.26 },
        { date: '2026-02-24', description: 'Consulting Income', account: '****5801', type: 'Credit', amount: 1500.00, balance: 16500.00 },
        { date: '2026-02-23', description: 'Shell Gas Station', account: '****7392', type: 'Debit', amount: -52.60, balance: 11886.44 },
        { date: '2026-02-22', description: 'Netflix Subscription', account: '****7392', type: 'Debit', amount: -15.99, balance: 11939.04 }
    ];

    displayTransactions(mockTransactions);
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
            <td>${transaction.account}</td>
            <td>${transaction.type}</td>
            <td class="${amountClass}">${amountPrefix}$${Math.abs(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>$${transaction.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        `;
        tbody.appendChild(row);
    });
}

function setupFilters() {
    const accountFilter = document.getElementById('accountFilter');
    const accounts = ['****1234', '****5678', '****9012'];
    
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        accountFilter.appendChild(option);
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

    document.getElementById('accountFilter').addEventListener('change', function() {
        console.log('Filter by account:', this.value);
    });

    document.getElementById('typeFilter').addEventListener('change', function() {
        console.log('Filter by type:', this.value);
    });
}
