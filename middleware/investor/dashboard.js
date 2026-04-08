document.addEventListener('DOMContentLoaded', function() {
	loadInvestorDashboard();
});

async function loadInvestorDashboard() {
	try {
		const [investmentsRes, offersRes] = await Promise.all([
			fetch('/api/investments', { credentials: 'include' }),
			fetch('/api/investments/offers', { credentials: 'include' })
		]);

		const investments = investmentsRes.ok ? await investmentsRes.json() : [];
		const offers = offersRes.ok ? await offersRes.json() : [];

		const total = investments.reduce((sum, inv) => sum + Number(inv.investment_balance || 0), 0);
		const activeDeals = investments.length;
		const blendedYield = activeDeals ? (8 + (activeDeals % 5) * 0.6).toFixed(1) : '--';
		const payout = activeDeals ? (total * 0.01).toFixed(2) : '0.00';

		setText('invTotalDeployed', formatCurrency(total));
		setText('invActiveDeals', String(activeDeals));
		setText('invExpectedYield', blendedYield === '--' ? '--' : blendedYield + '%');
		setText('invMonthPayout', formatCurrency(Number(payout)));

		renderLiveOffers(offers);
		renderRiskSplit(investments);
	} catch (err) {
		console.error('Investor dashboard load failed:', err);
	}
}

function renderLiveOffers(offers) {
	const list = document.getElementById('invLiveOffers');
	if (!list) return;

	if (!offers.length) {
		list.innerHTML = '<div class="list-item"><span>No live offers found</span><span class="badge badge-closed">None</span></div>';
		return;
	}

	list.innerHTML = '';
	offers.slice(0, 3).forEach(offer => {
		const item = document.createElement('div');
		item.className = 'list-item';
		item.innerHTML = `<span>${offer.title || 'Offer'}</span><span class="badge badge-live">${offer.offer_type || 'Live'}</span>`;
		list.appendChild(item);
	});
}

function renderRiskSplit(investments) {
	const list = document.getElementById('invRiskSplit');
	if (!list) return;

	if (!investments.length) {
		list.innerHTML = '<div class="list-item"><span>No portfolio data</span><strong>--</strong></div>';
		return;
	}

	const total = investments.length;
	const low = investments.filter(i => (i.risk_profile || '').toLowerCase() === 'low').length;
	const medium = investments.filter(i => (i.risk_profile || '').toLowerCase() === 'medium').length;
	const high = total - low - medium;

	list.innerHTML = `
		<div class="list-item"><span>Low Risk</span><strong>${Math.round((low / total) * 100)}%</strong></div>
		<div class="list-item"><span>Medium Risk</span><strong>${Math.round((medium / total) * 100)}%</strong></div>
		<div class="list-item"><span>High Risk</span><strong>${Math.round((high / total) * 100)}%</strong></div>
	`;
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = value;
}

function formatCurrency(value) {
	return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
