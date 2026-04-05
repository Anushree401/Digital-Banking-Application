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

    cards.forEach(card => {
        const div = document.createElement('div');

        div.innerHTML = `
            <p>Card Type: ${card.card_type}</p>
            <p>Account ID: ${card.account_id}</p>
            <p>Status: ${card.status}</p>

            <button onclick="approveCard(${card.id})">Approve</button>
            <button onclick="rejectCard(${card.id})">Reject</button>

            <hr/>
        `;

        container.appendChild(div);
    });
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