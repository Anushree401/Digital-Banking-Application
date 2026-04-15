document.addEventListener('DOMContentLoaded', function() {
    loadCardsData();
    loadAccounts();
    setupEventListeners();
});


async function loadCardsData() {
    try {
        const res = await fetch('/api/cards', {
            credentials: 'include'
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            alert("Server error (check console)");
            return;
        }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        displayCards(data);

    } catch (err) {
        console.error(err);
    }
}

window.blockCard = async function(cardId) {

    if (!confirm("Block this card?")) return;

    try {
        const res = await fetch(`/api/cards/block/${cardId}`, {
            method: 'PUT',
            credentials: 'include'
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            alert("Server error (check console)");
            return;
        }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Card blocked");
        loadCardsData();

    } catch (err) {
        console.error(err);
    }
}

window.unblockCard = async function(cardId) {

    if (!confirm("Unblock this card?")) return;

    try {
        const res = await fetch(`/api/cards/unblock/${cardId}`, {
            method: 'PUT',
            credentials: 'include'
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            alert("Server error (check console)");
            return;
        }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Card unblocked");
        loadCardsData();

    } catch (err) {
        console.error(err);
    }
};

window.setLimit = async function(cardId) {

    const limit = prompt("Enter new limit:");

    if (!limit) return;

    try {
        const res = await fetch(`/api/cards/limit/${cardId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ limit: Number(limit) })
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            return;
        }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Limit updated");

    } catch (err) {
        console.error(err);
    }
};

function displayCards(cards) {

    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';

    if (!cards.length) {
        cardsList.innerHTML = '<p>No active cards found</p>';
        return;
    }

    cards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card-visual';

        const number = card.card_number
            ? '**** **** **** ' + card.card_number.slice(-4)
            : '**** **** **** ****';

        const status = card.status || 'unknown';

        const color =
            status === 'active' ? 'green' :
            status === 'pending' ? 'orange' :
            status === 'blocked' ? 'red' : 'gray';

        div.innerHTML = `
            <p><strong>${card.card_type}</strong></p>
            <p>Account: ${card.account_id}</p>
            <p class="card-number">${number}</p>

            <div style="display:flex; justify-content:space-between; margin-top:20px;">
                <div>
                    <p>Status</p>
                    <p style="color:${color}; font-weight:bold;">
                        ${status.toUpperCase()}
                    </p>
                </div>
                <div>
                    <p>Expires</p>
                    <p>${new Date(card.expiry_date).toLocaleDateString()}</p>
                </div>
            </div>
        `;

        let actionBtn = '';

        if (card.status === 'active') {
            actionBtn = `
                <button onclick="blockCard(${card.id})" class="btn-danger">Block</button>
                <button onclick="setPin(${card.id})" class="btn-primary">Set PIN</button>
                <button onclick="setLimit(${card.id})" class="btn-secondary">Limit</button>
            `;
        } else if (card.status === 'blocked') {
            actionBtn = `
                <button onclick="unblockCard(${card.id})" class="btn-success">Unblock</button>
            `;
        }

        div.innerHTML += actionBtn;

        cardsList.appendChild(div);
    });
}


async function loadAccounts() {
    try {
        const res = await fetch('/api/dashboard', {
            credentials: 'include'
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            alert("Server error (check console)");
            return;
        }

        const select = document.getElementById('accountId');
        if (!select) return;

        select.innerHTML = '<option value="">Select Account</option>';

        (data.accounts || []).forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.id;
            opt.textContent = `${acc.acc_type} (${acc.acc_no})`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error(err);
    }
}

window.setPin = async function(cardId) {

    const pin = prompt("Enter 4-digit PIN:");

    if (!pin || pin.length !== 4) {
        alert("Invalid PIN");
        return;
    }

    try {
        const res = await fetch(`/api/cards/set-pin/${cardId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ pin })
        });

        let data;
        const text = await res.text();

        try {
            data = JSON.parse(text);
        } catch {
            console.error("NON-JSON RESPONSE:", text);
            return;
        }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("PIN set successfully");

    } catch (err) {
        console.error(err);
    }
};

function setupEventListeners() {

    // NAV TOGGLE
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn && sidebar && overlay) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }


    // LOGOUT
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/auth/login';
    });


    // APPLY FORM TOGGLE
    const form = document.getElementById('applyCardForm');
    const applyBtn = document.getElementById('applyCardBtn');

    if (form && applyBtn) {
        const section = form.parentElement;
        section.style.display = 'none';

        applyBtn.addEventListener('click', () => {
            section.style.display =
                section.style.display === 'none' ? 'block' : 'none';
        });
    }

    // APPLY CARD
    form?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const cardType = document.getElementById('cardType').value;
        const accountId = Number(document.getElementById('accountId').value);

        if (!accountId) {
            alert("Select account");
            return;
        }

        try {
            const res = await fetch('/api/cards/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cardType, accountId })
            });

            let data;
            const text = await res.text();

            try {
                data = JSON.parse(text);
            } catch {
                console.error("NON-JSON RESPONSE:", text);
                alert("Server error (check console)");
                return;
            }

            if (!res.ok) {
                alert(data.error);
                return;
            }

            alert(`Card applied!\nCVV: ${data.cvv || "Check server"}`);

            form.reset();
            loadCardsData();

        } catch (err) {
            console.error(err);
        }
    });

}