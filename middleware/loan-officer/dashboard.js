document.addEventListener('DOMContentLoaded', function() {
	displayCurrentDate();
	loadOfficerDashboard();
	setupEventListeners();
});

function displayCurrentDate() {
	const dateElement = document.getElementById('currentDate');
	if (dateElement) {
		const today = new Date();
		const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		dateElement.textContent = today.toLocaleDateString('en-US', options);
	}
}

function formatCurrency(value) {
	return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
	if (!value) return '--';
	return new Date(value).toLocaleDateString('en-IN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

function fullName(person) {
	if (!person) return 'Officer';
	return [person.fname, person.lname].filter(Boolean).join(' ') || 'Officer';
}

async function loadOfficerDashboard() {
	try {
		const [profileRes, loansRes, cardsRes, customersRes] = await Promise.all([
			fetch('/api/profile', { credentials: 'include' }),
			fetch('/api/loans', { credentials: 'include' }),
			fetch('/api/cards/pending', { credentials: 'include' }),
			fetch('/api/customers', { credentials: 'include' })
		]);

		const profile = profileRes.ok ? await profileRes.json() : null;
		const loans = loansRes.ok ? await loansRes.json() : [];
		const pendingCards = cardsRes.ok ? await cardsRes.json() : [];
		const customers = customersRes.ok ? await customersRes.json() : [];

		const filter = document.getElementById('loanFilter')?.value;
		let filteredLoans = loans;

		if (filter) {
		filteredLoans = loans.filter(
			l => String(l.status || '').toLowerCase() === filter
		);
		}

		const pendingLoans = filteredLoans.filter(
		loan => String(loan.status || '').toLowerCase() === 'pending'
		);

		const approvedLoans = filteredLoans.filter(
		loan => ['approved', 'active'].includes(String(loan.status || '').toLowerCase())
		);

		const officerName = fullName(profile);
		setText('userName', officerName);
		setText('welcomeName', officerName);
		setText('loPendingApplications', pendingLoans.length);
		setText('loKycReview', customers.filter(customer => ['pending', 'review'].includes(String(customer.kyc_status || '').toLowerCase())).length);
		setText('loKycReview2', customers.filter(customer => ['pending', 'review'].includes(String(customer.kyc_status || '').toLowerCase())).length);
		setText('loApprovalsWeek', approvedLoans.length);
		setText('loDecisionToday', pendingLoans.length);
		setText('loCardPending', pendingCards.length);
		setText('loRiskState', pendingLoans.length > approvedLoans.length ? 'Moderate' : 'Stable');
		setText('loSla', '96%');

		renderLoanRows(document.getElementById('dashboardLoansBody'), pendingLoans.slice(0, 5));
		renderCardRows(document.getElementById('dashboardCardsBody'), pendingCards.slice(0, 5));
		renderCustomerSnapshots(document.getElementById('customerSnapshots'), customers.slice(0, 4));
	} catch (err) {
		console.error('Loan officer dashboard load failed:', err);
	}
}

function renderLoanRows(tbody, loans) {
	if (!tbody) return;

	tbody.innerHTML = '';

	if (!loans.length) {
		tbody.innerHTML = '<tr><td colspan="6">No pending loan applications.</td></tr>';
		return;
	}

	loans.forEach(loan => {
		const row = document.createElement('tr');
		row.onclick = () => showLoanDetails(loan);
		row.innerHTML = `
			<td>LN${String(loan.id).padStart(6, '0')}</td>
			<td>${loan.customer_name || `Customer #${loan.customer_id}`}</td>
			<td>${loan.loan_type || '--'}</td>
			<td>${formatCurrency(loan.principal_amount)}</td>
			<td><span class="status-badge status-${String(loan.status || 'pending').toLowerCase()}">${loan.status || 'pending'}</span></td>
			<td>${formatDate(loan.applied_at)}</td>
			<td>
			<button onclick="event.stopPropagation(); approveLoan(${loan.id})">Approve</button>
			<button onclick="event.stopPropagation(); rejectLoan(${loan.id})">Reject</button>
			</td>
		`;
		tbody.appendChild(row);
	});
}

function renderCardRows(tbody, cards) {
	if (!tbody) return;

	tbody.innerHTML = '';

	if (!cards.length) {
		tbody.innerHTML = '<tr><td colspan="5">No pending card requests.</td></tr>';
		return;
	}

	cards.forEach(card => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>CRD${String(card.id).padStart(6, '0')}</td>
			<td>${card.customer_name || 'Customer'}</td>
			<td>${card.card_type || '--'}</td>
			<td><span class="status-badge status-pending">${card.status || 'pending'}</span></td>
			<td>${formatDate(card.requested_at)}</td>
		`;
		tbody.appendChild(row);
	});
}

function renderCustomerSnapshots(container, customers) {
	if (!container) return;

	container.innerHTML = '';

	if (!customers.length) {
		container.innerHTML = '<div class="empty-state">No customer records available.</div>';
		return;
	}

	customers.forEach(customer => {
		const item = document.createElement('article');
		item.className = 'customer-item';
		item.innerHTML = `
			<h4>${customer.name}</h4>
			<div>${customer.email}</div>
			<div class="meta-row">
				<span>KYC: ${customer.kyc_status}</span>
				<span>Accounts: ${customer.account_count}</span>
				<span>Loans: ${customer.loan_count}</span>
			</div>
		`;
		container.appendChild(item);
	});
}

function setText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = String(value);
}

function setupEventListeners() {
	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', async function() {
			await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});

			window.location.href = '/auth/login';
		});
	}

	async function approveLoan(id) {
		try {
			const res = await fetch(`/api/loans/approve/${id}`, {
			method: 'PUT',
			credentials: 'include'
			});

			if (!res.ok) throw new Error();

			alert('Loan approved');
			loadOfficerDashboard();

		} catch {
			alert('Error approving loan');
		}
		}

		async function rejectLoan(id) {
		try {
			const res = await fetch(`/api/loans/reject/${id}`, {
			method: 'PUT',
			credentials: 'include'
			});

			if (!res.ok) throw new Error();

			alert('Loan rejected');
			loadOfficerDashboard();

		} catch {
			alert('Error rejecting loan');
		}
		}

		const filter = document.getElementById('loanFilter');

		if (filter) {
		filter.addEventListener('change', loadOfficerDashboard);
		}
}

function showLoanDetails(loan) {
  alert(`
Loan ID: ${loan.id}
Customer: ${loan.customer_name || loan.customer_id}
Type: ${loan.loan_type}
Amount: ₹${loan.principal_amount}
Interest: ${loan.interest_rate}%
Tenure: ${loan.tenure_months} months
Status: ${loan.status}
  `);
}