document.addEventListener('DOMContentLoaded', function () {

    displayCurrentDate();
    loadDashboardData();
    setupEventListeners();

    const transferBtn = document.getElementById('transferSubmit');

    if (transferBtn) {
        transferBtn.addEventListener('click', async () => {
            transferBtn.disabled = true;
            transferBtn.textContent = "Processing...";
            const fromAccount = document.getElementById('fromAccount').value;
            const toAccount = document.getElementById('toAccount').value;
            const amount = parseFloat(document.getElementById('amount').value);
            if (!fromAccount || !toAccount || !amount) {
                alert('Please fill all fields');
                transferBtn.disabled = false;
                transferBtn.textContent = "Send Money";
                return;
            }
            if (fromAccount === toAccount) {
                alert("Cannot transfer to same account");
                transferBtn.disabled = false;
                transferBtn.textContent = "Send Money";
                return;
            }
            if (amount <= 0) {
                alert("Amount must be greater than 0");
                transferBtn.disabled = false;
                transferBtn.textContent = "Send Money";
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
                    // reset button
                    transferBtn.disabled = false;
                    transferBtn.textContent = "Send Money";
                    location.reload();
                } else {
                    alert(data.error || 'Transfer failed');
                    transferBtn.disabled = false;
                    transferBtn.textContent = "Send Money";
                }
            } catch (err) {
                console.error(err);
                alert('Something went wrong');
                transferBtn.disabled = false;
                transferBtn.textContent = "Send Money";
            }

        });
    }

});

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

async function loadDashboardData() {
    try {
        const res = await fetch('/api/dashboard', { credentials: 'include' });

        if (!res.ok) {
            throw new Error("Unauthorized or server error");
        }

        const data = await res.json();

        // Dynamic user
        document.getElementById('welcomeName').textContent = data.user?.name || 'User';
        document.getElementById('userName').textContent = data.user?.name || 'User';

        document.getElementById('totalBalance').textContent =
            `$${(data.totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('monthlyIncome').textContent =
            `$${(data.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('monthlyExpenses').textContent =
            `$${(data.monthlyExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.getElementById('activeLoans').textContent = data.activeLoans || 0;

        displayTransactions(data.transactions || []);
        displayAccounts(data.accounts || []);

    } catch (err) {
        console.error('Dashboard error:', err);
        alert("Session expired. Please login again.");
        window.location.href = '../shared/login.html';
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
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        const type = tx.transaction_type || tx.type;
        const amount = tx.amount;
        row.innerHTML = `
            <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
            <td>${tx.description || '—'}</td>
            <td>${type}</td>
            <td class="${type === 'Credit' ? 'transaction-credit' : 'transaction-debit'}">
                ${type === 'Credit' ? '+' : '-'}$${Math.abs(amount).toFixed(2)}
            </td>
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

    document.getElementById('logoutBtn').addEventListener('click', async function() {
        // alert('Logout functionality will be implemented');
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '../shared/login.html';
    });

    // document.getElementById('transferBtn').addEventListener('click', function() {
    //     const section = document.querySelector('.transfer-section');
    //     if (section.style.display === 'block') {
    //         section.style.display = 'none';
    //     } else {
    //         section.style.display = 'block';
    //         section.scrollIntoView({ behavior: 'smooth' });
    //     }
    // });

    document.getElementById('transferBtn').addEventListener('click', function() {
        const section = document.querySelector('.transfer-section');
        section.style.display = 'block';
        section.scrollIntoView({
            behavior: 'smooth'
        });
    });

    // document.getElementById('payBillBtn').addEventListener('click', async function() {
    //     const recipientAccountNumber = document.getElementById('recipientAccountNumber').value;
    //     const amount = Number(document.getElementById('transferAmount').value);
        
    //     if (recipientAccountNumber && amount > 0) {
    //         try {
    //             const response = await fetch('../api/transactions', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     recipientAccountNumber,
    //                     amount,
    //                     type: 'Transfer'
    //                 })
    //             });
    //             const data = await response.json();
    //             if (data.success) {
    //                 alert('Transfer successful');
    //                 window.location.reload();
    //             } else {
    //                 alert(data.message);
    //             }
    //         } catch (error) {
    //             alert('Transfer failed');
    //         }
    //     } else {
    //         alert('Please fill in all fields');
    //     }
    // });
    document.getElementById('payBillBtn').addEventListener('click', function() {
        const section = document.querySelector('.transfer-section');
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('depositBtn').addEventListener('click', async function() {
        const amount = prompt("Enter deposit amount:");

        if (!amount || amount <= 0) {
            alert("Invalid amount");
            return;
        }

        try {
            const res = await fetch('/api/transactions/deposit', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount) })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Deposit successful");
                location.reload();
            } else {
                alert(data.error);
            }

        } catch (err) {
            alert("Deposit failed");
        }
    });

    document.getElementById('applyLoanBtn').addEventListener('click', function() {
        window.location.href = 'loans.html';
    });
}