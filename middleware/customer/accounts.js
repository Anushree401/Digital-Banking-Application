document.addEventListener('DOMContentLoaded', function() {
    loadAccounts();
    setupEventListeners();
});

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

    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p>No accounts found</p>';
        return;
    }

    accounts.forEach(acc => {
        const div = document.createElement('div');
        div.className = 'account-item';

        div.innerHTML = `
            <div class="account-info">
                <h4>${(acc.acc_type || 'Account').toUpperCase()}</h4>
                <p>${acc.acc_no || 'N/A'}</p>
            </div>
            <div class="account-balance">
                ₹${Number(acc.balance || 0).toLocaleString()}
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

    document.getElementById('openAccountBtn').addEventListener('click', async function() {
        const type = prompt("Enter account type (savings/current):");

        if (!type) return;

        try {
            const res = await fetch('/api/accounts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ acc_type: type })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error);
                return;
            }

            alert("Account created!");
            loadAccounts(); // refresh UI

        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('closeAccountBtn').addEventListener('click', async function() {
        const id = prompt("Enter Account ID to close:");

        if (!id) return;

        try {
            const res = await fetch(`/api/accounts/close/${id}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error);
                return;
            }

            alert("Account closed");
            loadAccounts();

        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('downloadStatementBtn').addEventListener('click', async function() {
        const id = prompt("Enter Account ID:");

        if (!id) return;

        try {
            const res = await fetch(`/api/accounts/${id}/transactions`, {
                credentials: 'include'
            });

            const data = await res.json();

            console.log("Transactions:", data);
            alert("Check console for transactions");

        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('updateDetailsBtn').addEventListener('click', function() {
        alert('Profile update coming soon');
    });
}
