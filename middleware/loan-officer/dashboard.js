document.addEventListener('DOMContentLoaded', function() {
	loadOfficerDashboard();
});

async function loadOfficerDashboard() {
	try {
		const [loansRes, cardsRes] = await Promise.all([
			fetch('/api/loans', { credentials: 'include' }),
			fetch('/api/cards/pending', { credentials: 'include' })
		]);

		const loans = loansRes.ok ? await loansRes.json() : [];
		const pendingCards = cardsRes.ok ? await cardsRes.json() : [];

		const pendingLoans = loans.filter(l => String(l.status || '').toLowerCase() === 'pending');
		const approvedLoans = loans.filter(l => String(l.status || '').toLowerCase() === 'approved' || String(l.status || '').toLowerCase() === 'active');

		setText('loPendingApplications', pendingLoans.length);
		setText('loKycReview', pendingLoans.length);
		setText('loApprovalsWeek', approvedLoans.length);
		setText('loRiskState', pendingLoans.length > approvedLoans.length ? 'Moderate' : 'Stable');

		setText('loDecisionToday', pendingLoans.length);
		setText('loCardPending', pendingCards.length);
		setText('loEscalations', 0);
		setText('loSla', '96%');
	} catch (err) {
		console.error('Loan officer dashboard load failed:', err);
	}
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = String(value);
}
