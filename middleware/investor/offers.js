document.addEventListener('DOMContentLoaded', function() {
	loadOffers();
});

async function loadOffers() {
	const grid = document.getElementById('offersGrid');
	if (!grid) return;

	try {
		const res = await fetch('/api/investments/offers', { credentials: 'include' });
		const offers = res.ok ? await res.json() : [];

		grid.innerHTML = '';

		if (!offers.length) {
			grid.innerHTML = '<article class="card panel"><h2>No Offers Available</h2><p class="meta">New offers will appear here automatically.</p></article>';
			return;
		}

		offers.forEach(offer => {
			const card = document.createElement('article');
			card.className = 'card panel';
			const validTo = offer.valid_to ? new Date(offer.valid_to).toLocaleDateString() : '--';
			card.innerHTML = `
				<h2>${offer.title || 'Offer'}</h2>
				<p class="meta">Type: ${offer.offer_type || 'General'}</p>
				<p class="meta">Valid till: ${validTo}</p>
				<br>
				<button class="btn alt">View Details</button>
			`;
			grid.appendChild(card);
		});
	} catch (err) {
		console.error('Offers load failed:', err);
		grid.innerHTML = '<article class="card panel"><h2>Error</h2><p class="meta">Unable to load offers.</p></article>';
	}
}
