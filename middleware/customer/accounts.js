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

document.addEventListener('DOMContentLoaded', loadAccounts);

async function loadAccounts() {
    try {
        const res = await fetch('/api/accounts', {
            credentials: 'include'
        });

        const accounts = await res.json();

        if (!res.ok) {
            alert(accounts.error);
            return;
        }

        displayAccounts(accounts);

    } catch (err) {
        console.error(err);
    }
}

function displayAccounts(accounts) {
    const container = document.getElementById('accountsList');
    container.innerHTML = '';

    accounts.forEach(acc => {
        const div = document.createElement('div');
        div.className = 'account-item';

        div.innerHTML = `
            <div class="account-info">
                <h4>${acc.acc_type.toUpperCase()} Account</h4>
                <p>${acc.acc_no}</p>
            </div>
            <div class="account-balance">
                ₹${parseFloat(acc.balance).toLocaleString()}
            </div>
        `;

        container.appendChild(div);
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
