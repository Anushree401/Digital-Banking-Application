document.addEventListener('DOMContentLoaded', function() {
	loadInvestments();
});

async function loadInvestments() {
	const tbody = document.getElementById('investmentsBody');
	if (!tbody) return;

	try {
		const res = await fetch('/api/investments', { credentials: 'include' });
		const rows = res.ok ? await res.json() : [];

		tbody.innerHTML = '';

		if (!rows.length) {
			tbody.innerHTML = '<tr><td colspan="4">No investments found.</td></tr>';
			return;
		}

		rows.forEach((row, idx) => {
			const tr = document.createElement('tr');
			const balance = Number(row.investment_balance || 0);
			const estYield = (8 + (idx % 5) * 0.6).toFixed(1) + '%';
			tr.innerHTML = `
				<td>Investor #${row.id}</td>
				<td>$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
				<td>${estYield}</td>
				<td><span class="badge badge-live">${row.risk_profile || 'Active'}</span></td>
			`;
			tbody.appendChild(tr);
		});
	} catch (err) {
		console.error('Investments load failed:', err);
		tbody.innerHTML = '<tr><td colspan="4">Unable to load investments.</td></tr>';
	}
}
