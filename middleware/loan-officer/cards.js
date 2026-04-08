document.addEventListener('DOMContentLoaded', () => {
    loadPendingCards();
});

async function loadPendingCards() {
    try {
        const res = await fetch('/api/cards/pending', {
            credentials: 'include'
        });

        const data = await res.json();

        displayPendingCards(data);

    } catch (err) {
        console.error(err);
    }
}

function displayPendingCards(cards) {
    const container = document.getElementById('pendingCards');
    container.innerHTML = '';

    if (!cards.length) {
        container.innerHTML = '<p>No pending applications</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Card ID</th>
                <th>Type</th>
                <th>Account</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    cards.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>CRD${String(card.id).padStart(6, '0')}</td>
            <td>${card.card_type}</td>
            <td>${card.account_id}</td>
            <td><span class="badge">${card.status}</span></td>
            <td>
                <button class="btn btn-approve" onclick="approveCard(${card.id})">Approve</button>
                <button class="btn btn-reject" onclick="rejectCard(${card.id})">Reject</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    container.appendChild(table);
}

async function approveCard(id) {
    const res = await fetch(`/api/cards/approve/${id}`, {
        method: 'PUT',
        credentials: 'include'
    });

    const data = await res.json();

    alert(data.message);
    loadPendingCards();
}

async function rejectCard(id) {
    const res = await fetch(`/api/cards/reject/${id}`, {
        method: 'PUT',
        credentials: 'include'
    });

    const data = await res.json();

    alert(data.message);
    loadPendingCards();
}