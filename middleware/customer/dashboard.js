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

async function loadDashboardData() {
    try {
        const res = await fetch('/api/dashboard', {credentials: 'include'});
        const data = await res.json();

        document.getElementById('welcomeName').textContent = 'User';
        document.getElementById('userName').textContent = 'User';

        document.getElementById('totalBalance').textContent =
            `$${data.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('monthlyIncome').textContent =
            `$${data.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('monthlyExpenses').textContent =
            `$${data.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('activeLoans').textContent = data.activeLoans;

        displayTransactions(
            data.transactions.map(tx => ({
                date: new Date(tx.timestamp).toLocaleDateString(),
                description: tx.description,
                type: tx.transaction_type,
                amount: tx.amount
            }))
        );

        // displayAccounts(data.accounts);

    } catch (err) {
        console.error('Dashboard error:', err);
    }
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
        document.querySelector('.transfer-section').scrollIntoView({
            behavior: 'smooth'
        });
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

document.addEventListener('DOMContentLoaded', () => {
    const transferBtn = document.getElementById('transferSubmit');

    if (transferBtn) {
        transferBtn.addEventListener('click', async () => {

            const fromAccount = document.getElementById('fromAccount').value;
            const toAccount = document.getElementById('toAccount').value;
            const amount = parseFloat(document.getElementById('amount').value);

            if (!fromAccount || !toAccount || !amount) {
                alert('Please fill all fields');
                return;
            }

            try {
                const res = await fetch('/api/transactions/transfer', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fromAccount, toAccount, amount })
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Transfer successful');
                    location.reload();
                } else {
                    alert('Error: ' + data.error);
                }

            } catch (err) {
                console.error(err);
                alert('Something went wrong');
            }

        });
    }
});