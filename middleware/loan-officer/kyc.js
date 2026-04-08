document.addEventListener('DOMContentLoaded', function() {
    loadKycQueue();
    setupEventListeners();
});

function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

async function loadKycQueue() {
    const tbody = document.getElementById('kycBody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/customers/pending-kyc', { credentials: 'include' });
        const customers = res.ok ? await res.json() : [];

        tbody.innerHTML = '';

        if (!customers.length) {
            tbody.innerHTML = '<tr><td colspan="7">No pending KYC verification records.</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>CUST-${String(customer.id).padStart(4, '0')}</td>
                <td>${customer.name || `Customer #${customer.id}`}</td>
                <td>${customer.email || '--'}</td>
                <td><span class="status-badge status-${String(customer.kyc_status || 'pending').toLowerCase()}">${customer.kyc_status || 'pending'}</span></td>
                <td>${customer.primary_account ? `${customer.primary_account.acc_no} (${customer.primary_account.acc_type})` : '--'}</td>
                <td>PAN: ${customer.pan_number || '--'}<br>Aadhaar: ${customer.adhaar_number || '--'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-approve" data-action="verified" data-id="${customer.id}">Verify</button>
                        <button class="btn-reject" data-action="rejected" data-id="${customer.id}">Reject</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('KYC queue load failed:', err);
        tbody.innerHTML = '<tr><td colspan="7">Unable to load KYC queue.</td></tr>';
    }
}

async function updateKycStatus(id, status) {
    try {
        const res = await fetch(`/api/customers/${id}/kyc`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Unable to update KYC status');
        }

        alert(data.message);
        loadKycQueue();
    } catch (err) {
        alert(err.message);
    }
}

function setupEventListeners() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn && sidebar && overlay) {
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
    }

    const tbody = document.getElementById('kycBody');
    if (tbody) {
        tbody.addEventListener('click', event => {
            const button = event.target.closest('button[data-action][data-id]');
            if (!button) return;
            updateKycStatus(button.dataset.id, button.dataset.action);
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = '/shared/login.html';
        });
    }
}
