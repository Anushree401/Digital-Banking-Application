document.addEventListener('DOMContentLoaded', function() {
	loadSupportContext();
});

async function loadSupportContext() {
	const container = document.getElementById('supportTickets');
	if (!container) return;

	try {
		const [profileRes, investmentsRes] = await Promise.all([
			fetch('/api/profile', { credentials: 'include' }),
			fetch('/api/investments', { credentials: 'include' })
		]);

		const profile = profileRes.ok ? await profileRes.json() : null;
		const investments = investmentsRes.ok ? await investmentsRes.json() : [];

		const investorLabel = profile ? (profile.email || 'Investor') : 'Investor';
		container.innerHTML = `
			<div class="list-item"><span>Account Context</span><span class="badge badge-live">${investorLabel}</span></div>
			<div class="list-item"><span>Total Investment Records</span><span class="badge badge-review">${investments.length}</span></div>
			<div class="list-item"><span>Ticket Feed</span><span class="badge badge-closed">No ticket endpoint configured</span></div>
		`;
	} catch (err) {
		console.error('Support context load failed:', err);
		container.innerHTML = '<div class="list-item"><span>Unable to load support context</span><span class="badge badge-review">Error</span></div>';
	}
}
