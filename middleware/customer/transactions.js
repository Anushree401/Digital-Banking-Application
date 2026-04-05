document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setupFilters();
    setupEventListeners();
});

async function loadTransactions(query = '') {
    try {
        const res = await fetch('/api/transactions' + query, {
            credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        displayTransactions(data);

    } catch (err) {
        console.error(err);
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    transactions.forEach(tx => {
        const row = document.createElement('tr');

        const type = tx.transaction_type;
        const amountClass = type === 'Credit' ? 'transaction-credit' : 'transaction-debit';
        const prefix = type === 'Credit' ? '+' : '-';

        row.innerHTML = `
            <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
            <td>${tx.description || 'Transaction'}</td>
            <td>${tx.from_account_id}</td>
            <td>${type}</td>
            <td class="${amountClass}">
                ${prefix}₹${parseFloat(tx.amount).toLocaleString()}
            </td>
        `;

        tbody.appendChild(row);
    });
}

function setupFilters() {
    const filterBtn = document.getElementById('filterBtn');

    filterBtn.addEventListener('click', () => {
        const type = document.getElementById('typeFilter').value;
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;

        const params = new URLSearchParams();

        if (type) params.append('type', type);
        if (start && end) {
            params.append('startDate', start);
            params.append('endDate', end);
        }

        const query = '?' + params.toString();

        console.log("FILTER QUERY:", query);

        loadTransactions(query);
    });
}

function setupEventListeners() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = '../shared/login.html';
        });
    }
}