document.addEventListener('DOMContentLoaded', () => {
	loadInvestorDashboard();
	setupEventListeners();
});

const investorState = {
	investments: [],
	offers: [],
	watchlist: new Set(JSON.parse(localStorage.getItem('investor-watchlist') || '[]')),
	focusHighRisk: false
};

let investorProfile = null;

async function loadInvestorDashboard() {
	try {
		const [profileRes, investmentsRes, offersRes] = await Promise.all([
			fetch('/api/profile', { credentials: 'include' }),
			fetch('/api/investments', { credentials: 'include' }),
			fetch('/api/investments/offers', { credentials: 'include' })
		]);

		investorProfile = profileRes.ok ? await profileRes.json() : null;
		investorState.investments = investmentsRes.ok ? await investmentsRes.json() : [];
		investorState.offers = offersRes.ok ? await offersRes.json() : [];
		renderDashboard();
	} catch (err) {
		console.error('Investor dashboard load failed:', err);
	}
}

function renderDashboard() {
	const investments = getVisibleInvestments();
	const offers = getVisibleOffers();
	const total = investments.reduce((sum, investment) => sum + Number(investment.investment_balance || 0), 0);
	const activeDeals = investments.length;
	const blendedYield = activeDeals ? (8 + (activeDeals % 5) * 0.6).toFixed(1) : '--';

	setText('welcomeName', getDisplayName());
	setText('userName', getDisplayName());
	setText('currentDate', new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}));
	setText('invTotalDeployed', formatCurrency(total));
	setText('invActiveDeals', String(activeDeals));
	setText('invExpectedYield', blendedYield === '--' ? '--' : `${blendedYield}%`);
	setText('invWatchlistCount', String(investorState.watchlist.size));

	renderInvestmentList(investments);
	renderLiveOffers(offers);
	renderRiskSplit(investments);
	renderActivityFeed(investments, offers);
	updateActionLabels();
}

function getVisibleInvestments() {
	if (!investorState.focusHighRisk) {
		return investorState.investments;
	}

	return investorState.investments.filter(investment => String(investment.risk_profile || '').toLowerCase() === 'high');
}

function getVisibleOffers() {
	if (!investorState.focusHighRisk) {
		return investorState.offers;
	}

	return investorState.offers.filter(offer => Number(offer.return_rate || 0) >= 10);
}

function renderInvestmentList(investments) {
	const list = document.getElementById('invInvestmentList');
	if (!list) return;

	if (!investments.length) {
		list.innerHTML = '<div class="empty-state">No active investments available.</div>';
		return;
	}

	list.innerHTML = '';
	investments.slice(0, 5).forEach(investment => {
		const itemId = `inv-${investment.id}`;
		const tracked = investorState.watchlist.has(itemId);
		const item = document.createElement('div');
		item.className = 'account-item';
		item.innerHTML = `
			<div class="account-info">
				<h4>Investment #${investment.id}</h4>
				<p class="account-number">Risk: ${investment.risk_profile || 'medium'}</p>
			</div>
			<div class="account-balance">${formatCurrency(investment.investment_balance || 0)}</div>
			<div style="display:flex; align-items:center; gap:8px;">
				<span class="badge ${tracked ? 'badge-live' : 'badge-review'}">${tracked ? 'Tracked' : 'Watch'}</span>
				<button class="btn alt" type="button" data-track-id="${itemId}">${tracked ? 'Untrack' : 'Track'}</button>
			</div>
		`;
		list.appendChild(item);
	});

	list.querySelectorAll('[data-track-id]').forEach(button => {
		button.addEventListener('click', function() {
			const id = button.dataset.trackId;
			if (investorState.watchlist.has(id)) {
				investorState.watchlist.delete(id);
			} else {
				investorState.watchlist.add(id);
			}

			localStorage.setItem('investor-watchlist', JSON.stringify(Array.from(investorState.watchlist)));
			renderDashboard();
		});
	});
}

function renderLiveOffers(offers) {
	const list = document.getElementById('invLiveOffers');
	if (!list) return;

	if (!offers.length) {
		list.innerHTML = '<div class="list-item"><span>No live offers found</span><span class="badge badge-closed">None</span></div>';
		return;
	}

	list.innerHTML = '';
	offers.slice(0, 4).forEach(offer => {
		const itemId = `offer-${offer.id || offer.title}`;
		const tracked = investorState.watchlist.has(itemId);
		const item = document.createElement('div');
		item.className = 'list-item';
		item.innerHTML = `
			<div>
				<span>${offer.title || 'Offer'}</span>
				<div class="meta">Return ${Number(offer.return_rate || 0).toFixed(1)}%</div>
			</div>
			<div style="display:flex; align-items:center; gap:8px;">
				<span class="badge badge-live">${offer.offer_type || 'Live'}</span>
				<button class="btn alt" type="button" data-offer-track="${itemId}">${tracked ? 'Tracked' : 'Track'}</button>
			</div>
		`;
		list.appendChild(item);
	});

	list.querySelectorAll('[data-offer-track]').forEach(button => {
		button.addEventListener('click', function() {
			const id = button.dataset.offerTrack;
			if (investorState.watchlist.has(id)) {
				investorState.watchlist.delete(id);
			} else {
				investorState.watchlist.add(id);
			}

			localStorage.setItem('investor-watchlist', JSON.stringify(Array.from(investorState.watchlist)));
			renderDashboard();
		});
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
	const low = investments.filter(investment => (investment.risk_profile || '').toLowerCase() === 'low').length;
	const medium = investments.filter(investment => (investment.risk_profile || '').toLowerCase() === 'medium').length;
	const high = total - low - medium;

	list.innerHTML = `
		<div class="list-item"><span>Low Risk</span><strong>${Math.round((low / total) * 100)}%</strong></div>
		<div class="list-item"><span>Medium Risk</span><strong>${Math.round((medium / total) * 100)}%</strong></div>
		<div class="list-item"><span>High Risk</span><strong>${Math.round((high / total) * 100)}%</strong></div>
	`;
}

function renderActivityFeed(investments, offers) {
	const list = document.getElementById('invActivityFeed');
	if (!list) return;

	const recentActivity = [
		...investments.slice(0, 2).map(investment => ({
			label: `Investment #${investment.id}`,
			value: formatCurrency(investment.investment_balance || 0),
			badge: investment.risk_profile || 'medium'
		})),
		...offers.slice(0, 2).map(offer => ({
			label: offer.title || 'Offer',
			value: `${Number(offer.return_rate || 0).toFixed(1)}%`,
			badge: offer.offer_type || 'live'
		}))
	];

	if (!recentActivity.length) {
		list.innerHTML = '<div class="empty-state">No recent activity.</div>';
		return;
	}

	list.innerHTML = recentActivity.map(entry => `
		<div class="list-item">
			<div>
				<div>${entry.label}</div>
				<div class="meta">Recent signal</div>
			</div>
			<div style="display:flex; align-items:center; gap:8px;">
				<span class="badge badge-review">${entry.badge}</span>
				<strong>${entry.value}</strong>
			</div>
		</div>
	`).join('');
}

function updateActionLabels() {
	const toggleRiskButton = document.getElementById('toggleRiskBtn');
	if (toggleRiskButton) {
		toggleRiskButton.textContent = investorState.focusHighRisk ? 'Show All' : 'Focus High Risk';
	}

	const watchlistCount = document.getElementById('invWatchlistCount');
	if (watchlistCount) {
		watchlistCount.textContent = String(investorState.watchlist.size);
	}
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = value;
}

function formatCurrency(value) {
	return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDisplayName() {
	if (investorProfile) {
		const fullName = [investorProfile.fname, investorProfile.lname].filter(Boolean).join(' ').trim();
		if (fullName) {
			return fullName;
		}

		if (investorProfile.email) {
			return investorProfile.email;
		}
	}

	return 'Investor';
}

function setupEventListeners() {
	const refreshButton = document.getElementById('refreshInvestorBtn');
	if (refreshButton) {
		refreshButton.addEventListener('click', loadInvestorDashboard);
	}

	const toggleRiskButton = document.getElementById('toggleRiskBtn');
	if (toggleRiskButton) {
		toggleRiskButton.addEventListener('click', function() {
			investorState.focusHighRisk = !investorState.focusHighRisk;
			renderDashboard();
		});
	}

	const exportButton = document.getElementById('exportSnapshotBtn');
	if (exportButton) {
		exportButton.addEventListener('click', downloadSnapshot);
	}

	const saveSnapshotButton = document.getElementById('saveSnapshotBtn');
	if (saveSnapshotButton) {
		saveSnapshotButton.addEventListener('click', downloadSnapshot);
	}

	const clearWatchlistButton = document.getElementById('clearWatchlistBtn');
	if (clearWatchlistButton) {
		clearWatchlistButton.addEventListener('click', function() {
			investorState.watchlist.clear();
			localStorage.removeItem('investor-watchlist');
			renderDashboard();
		});
	}

	const trackOffersButton = document.getElementById('trackOffersBtn');
	if (trackOffersButton) {
		trackOffersButton.addEventListener('click', function() {
			document.getElementById('invLiveOffers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	const rebalanceButton = document.getElementById('rebalanceBtn');
	if (rebalanceButton) {
		rebalanceButton.addEventListener('click', function() {
			const highRiskCount = investorState.investments.filter(item => String(item.risk_profile || '').toLowerCase() === 'high').length;
			alert(highRiskCount > 0
				? `Rebalance suggestion: reduce ${highRiskCount} high-risk position(s) and rotate into low-risk offers.`
				: 'Portfolio is balanced. No rebalance needed right now.');
		});
	}

	const viewPortfolioButton = document.getElementById('viewPortfolioBtn');
	if (viewPortfolioButton) {
		viewPortfolioButton.addEventListener('click', function() {
			window.location.href = 'portfolio.html';
		});
	}

	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn && !logoutBtn.dataset.logoutEndpoint) {
		logoutBtn.addEventListener('click', async function() {
			await fetch('/api/logout', { method: 'POST', credentials: 'include' });
			window.location.href = '../shared/login.html';
		});
	}
}

function downloadSnapshot() {
	const payload = {
		totalDeployed: investorState.investments.reduce((sum, investment) => sum + Number(investment.investment_balance || 0), 0),
		activeDeals: investorState.investments.length,
		watchlist: Array.from(investorState.watchlist),
		exportedAt: new Date().toISOString()
	};

	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = 'investor-snapshot.json';
	anchor.click();
	URL.revokeObjectURL(url);
}