document.addEventListener('DOMContentLoaded', function() {
    loadCardsData();
    setupEventListeners();
});

function loadCardsData() {
    const mockCards = [
        { id: 1, number: '4532 **** **** 7281', type: 'Visa Signature', holder: 'SARAH CHEN', expiry: '11/27', status: 'Active', limit: 15000, used: 4200 },
        { id: 2, number: '5425 **** **** 8364', type: 'Mastercard', holder: 'SARAH CHEN', expiry: '09/28', status: 'Active', limit: 8000, used: 1850 }
    ];

    displayCards(mockCards);
}

function displayCards(cards) {
    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';

    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-visual';
        const available = card.limit - card.used;
        const usagePercent = (card.used / card.limit * 100).toFixed(1);
        
        cardDiv.innerHTML = `
            <p>${card.type}</p>
            <p class="card-number">${card.number}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Card Holder</p>
                    <p class="card-holder">${card.holder}</p>
                </div>
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Expires</p>
                    <p class="card-holder">${card.expiry}</p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <p style="font-size: 12px; opacity: 0.8;">Available Credit</p>
                <p style="font-size: 20px; font-weight: 600;">$${available.toLocaleString('en-US', {minimumFractionDigits: 2})} / $${card.limit.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                <div class="progress-bar" style="background: rgba(255,255,255,0.3);">
                    <div class="progress-fill" style="width: ${usagePercent}%; background: white;"></div>
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

    document.getElementById('applyCardBtn').addEventListener('click', function() {
        alert('Apply for New Card functionality will be implemented');
    });

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
