document.addEventListener('DOMContentLoaded', function() {
	loadProfile();
});

async function loadProfile() {
	try {
		const [profileRes, investmentsRes] = await Promise.all([
			fetch('/api/profile', { credentials: 'include' }),
			fetch('/api/investments', { credentials: 'include' })
		]);

		const profile = profileRes.ok ? await profileRes.json() : null;
		const investments = investmentsRes.ok ? await investmentsRes.json() : [];

		const risk = investments.length ? (investments[0].risk_profile || '--') : '--';

		setText('profileName', profile ? `${profile.fname || ''} ${profile.lname || ''}`.trim() : '--');
		setText('profileEmail', profile ? (profile.email || '--') : '--');
		setText('profileRisk', risk);
		setText('profileKyc', profile ? 'Verified' : 'Pending');
	} catch (err) {
		console.error('Profile load failed:', err);
	}
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = value;
}
