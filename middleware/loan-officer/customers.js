document.addEventListener('DOMContentLoaded', function() {
	loadCustomerSummary();
});

async function loadCustomerSummary() {
	try {
		const [profileRes, loansRes, accountsRes] = await Promise.all([
			fetch('/api/profile', { credentials: 'include' }),
			fetch('/api/loans', { credentials: 'include' }),
			fetch('/api/accounts', { credentials: 'include' })
		]);

		const profile = profileRes.ok ? await profileRes.json() : null;
		const loans = loansRes.ok ? await loansRes.json() : [];
		const accounts = accountsRes.ok ? await accountsRes.json() : [];

		setText('custName', profile ? `${profile.fname || ''} ${profile.lname || ''}`.trim() : '--');
		setText('custEmail', profile ? (profile.email || '--') : '--');
		setText('custPhone', profile ? (profile.phone || '--') : '--');
		setText('custKyc', profile ? 'Verified' : '--');

		setText('custAccount', accounts.length ? `Account #${accounts[0].id}` : '--');
		setText('custBalance', accounts.length ? `₹${Number(accounts[0].balance || 0).toLocaleString('en-IN')}` : '--');
		setText('custLoans', loans.length);
		setText('custRisk', loans.some(l => String(l.status).toLowerCase() === 'pending') ? 'Moderate' : 'Low');
	} catch (err) {
		console.error('Customer summary load failed:', err);
	}
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = String(value);
}
