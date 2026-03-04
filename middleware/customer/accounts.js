document.addEventListener('DOMContentLoaded', function() {
    loadAccountsData();
    setupEventListeners();
});

function loadAccountsData() {
    const mockAccounts = [
        { id: 1, name: 'Primary Checking', number: '****7392', balance: 18420.50, type: 'Checking', status: 'Active' },
        { id: 2, name: 'Emergency Fund', number: '****5801', balance: 15000.00, type: 'Savings', status: 'Active' },
        { id: 3, name: 'Travel Reserve', number: '****2647', balance: 5000.00, type: 'Money Market', status: 'Active' }
    ];

    displayAccounts(mockAccounts);
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
                <p class="account-number">${account.number} | ${account.type} | ${account.status}</p>
            </div>
            <div class="account-balance">$${account.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        `;
        accountsList.appendChild(accountItem);
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

    document.getElementById('openAccountBtn').addEventListener('click', function() {
        alert('Open New Account functionality will be implemented');
    });

    document.getElementById('closeAccountBtn').addEventListener('click', function() {
        alert('Close Account functionality will be implemented');
    });

    document.getElementById('downloadStatementBtn').addEventListener('click', function() {
        alert('Download Statement functionality will be implemented');
    });

    document.getElementById('updateDetailsBtn').addEventListener('click', function() {
        alert('Update Details functionality will be implemented');
    });
}
