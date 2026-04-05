document.addEventListener('DOMContentLoaded', function() {
    loadCardsData();
    setupEventListeners();
});

async function loadCardsData() {
    try {
        const res = await fetch('/api/cards', {
            credentials: 'include'
        });

        const data = await res.json();
        // const text = await res.text();
        // console.log("RAW RESPONSE:", text);

        // let data;
        // try {
        //     data = JSON.parse(text);
        // } catch (e) {
        //     console.error("NOT JSON RESPONSE");
        //     return;
        // }

        if (!res.ok) {
            alert(data.error);
            return;
        }

        displayCards(data);

    } catch (err) {
        console.error(err);
    }
}

function displayCards(cards) {

    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';

    if (!cards.length) {
        cardsList.innerHTML = '<p>No active cards found</p>';
        return;
    }

    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-visual';

        const number = card.card_number
        ? '**** **** **** ' + card.card_number.slice(-4)
        : '**** **** **** ****';

        cardDiv.innerHTML = `
            <p>${card.card_type || 'Card'}</p>
            <p class="card-number">${number}</p>

            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Status</p>
                    <p class="card-holder">${card.status}</p>
                </div>
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Expires</p>
                    <p class="card-holder">
                        ${new Date(card.expiry_date).toLocaleDateString()}
                    </p>
                </div>
            </div>
        `;

        cardsList.appendChild(cardDiv);
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

    const applyBtn = document.getElementById('applyCardBtn');
    if (form) {
        const formSection = form.parentElement;
        formSection.style.display = 'none';

        applyBtn.addEventListener('click', () => {
            formSection.style.display =
                formSection.style.display === 'none' ? 'block' : 'none';
        });
    }

    const form = document.getElementById('applyCardForm');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const cardType = document.getElementById('cardType').value;
            const accountId = document.getElementById('accountId').value;

            try {
                const res = await fetch('/api/cards/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        cardType,
                        accountId
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.error);
                    return;
                }

                alert("Card applied successfully!");

                form.reset();        // clear form
                loadCardsData();     // refresh cards

            } catch (err) {
                console.error(err);
            }
        });
    }

    document.getElementById('blockCardBtn').addEventListener('click', function() {
        alert('Block Card functionality will be implemented');
    });

    document.getElementById('setPinBtn').addEventListener('click', function() {
        alert('Set PIN functionality will be implemented');
    });

    document.getElementById('cardLimitsBtn').addEventListener('click', function() {
        alert('Manage Limits functionality will be implemented');
    });
}
