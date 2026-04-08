document.addEventListener('DOMContentLoaded', function() {
	loadPortfolio();
});

async function loadPortfolio() {
	const tbody = document.getElementById('portfolioBody');
	if (!tbody) return;

	try {
		const res = await fetch('/api/investments', { credentials: 'include' });
		const investments = res.ok ? await res.json() : [];

		tbody.innerHTML = '';

		if (!investments.length) {
			tbody.innerHTML = '<tr><td colspan="4">No portfolio allocation data.</td></tr>';
			return;
		}

		const groups = groupByRisk(investments);
		const total = Object.values(groups).reduce((sum, v) => sum + v, 0);

		Object.entries(groups).forEach(([risk, amount], idx) => {
			const allocation = total ? Math.round((amount / total) * 100) : 0;
			const yieldValue = (8.2 + idx * 0.7).toFixed(1) + '%';
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${capitalize(risk)} Segment</td>
				<td>${allocation}%</td>
				<td>${yieldValue}</td>
				<td><span class="badge badge-live">Stable</span></td>
			`;
			tbody.appendChild(tr);
		});
	} catch (err) {
		console.error('Portfolio load failed:', err);
		tbody.innerHTML = '<tr><td colspan="4">Unable to load portfolio.</td></tr>';
	}
}

function groupByRisk(items) {
	const acc = { low: 0, medium: 0, high: 0 };
	items.forEach(item => {
		const key = String(item.risk_profile || 'medium').toLowerCase();
		const safeKey = acc[key] !== undefined ? key : 'medium';
		acc[safeKey] += Number(item.investment_balance || 0);
	});
	return acc;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
