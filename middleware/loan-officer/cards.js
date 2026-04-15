document.addEventListener('DOMContentLoaded', () => {
    loadPendingCards();
    setupEventListeners();
});

function formatDate(value) {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function loadPendingCards() {
    try {
        const res = await fetch('/api/cards/pending', {
            credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Failed to load cards');
            return;
        }

        displayPendingCards(data);

    } catch (err) {
        console.error(err);
    }
}

function displayPendingCards(cards) {
    const tbody = document.getElementById('pendingCards');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!cards.length) {
        tbody.innerHTML = '<tr><td colspan="7">No pending applications</td></tr>';
        return;
    }

    cards.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>CRD${String(card.id).padStart(6, '0')}</td>
            <td>${card.customer_name || 'Customer'}</td>
            <td>${card.account_number || `ACC-${card.account_id}`}</td>
            <td>${card.card_type || '--'}</td>
            <td>${formatDate(card.requested_at)}</td>
            <td><span class="status-badge status-pending">${card.status || 'pending'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-approve" data-action="approve" data-id="${card.id}">Approve</button>
                    <button class="btn-reject" data-action="reject" data-id="${card.id}">Reject</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateCardStatus(id, action) {
    try {
        const res = await fetch(`/api/cards/${action}/${id}`, {
            method: 'PUT',
            credentials: 'include'
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Unable to update card status');
        }

        alert(data.message);
        loadPendingCards();
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

    const tbody = document.getElementById('pendingCards');
    if (tbody) {
        tbody.addEventListener('click', event => {
            const button = event.target.closest('button[data-action][data-id]');
            if (!button) return;
            updateCardStatus(button.dataset.id, button.dataset.action);
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', async function() {
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        window.location.href = '/auth/login';
    });
}