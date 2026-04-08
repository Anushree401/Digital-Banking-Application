document.addEventListener('DOMContentLoaded', function() {
	loadLoanApplications();
	setupEventListeners();
});

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

async function loadLoanApplications() {
	const tbody = document.getElementById('loanApplicationsBody');
	if (!tbody) return;

	try {
		const res = await fetch('/api/loans', { credentials: 'include' });
		const loans = res.ok ? await res.json() : [];

		tbody.innerHTML = '';

		if (!loans.length) {
			tbody.innerHTML = '<tr><td colspan="8">No loan applications found.</td></tr>';
			return;
		}

		loans.forEach(loan => {
			const status = String(loan.status || 'pending').toLowerCase();
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>LN${String(loan.id).padStart(6, '0')}</td>
				<td>${loan.customer_name || `Customer #${loan.customer_id}`}</td>
				<td>${loan.loan_type || '--'}</td>
				<td>${formatCurrency(loan.principal_amount)}</td>
				<td>${loan.interest_rate || '--'}%</td>
				<td>${formatDate(loan.applied_at)}</td>
				<td><span class="status-badge status-${status}">${status}</span></td>
				<td>
					<div class="action-buttons">
						<button class="btn-approve" data-action="approve" data-id="${loan.id}" ${status !== 'pending' ? 'disabled' : ''}>Approve</button>
						<button class="btn-reject" data-action="reject" data-id="${loan.id}" ${status !== 'pending' ? 'disabled' : ''}>Reject</button>
					</div>
				</td>
			`;
			tbody.appendChild(tr);
		});
	} catch (err) {
		console.error('Loan applications load failed:', err);
		tbody.innerHTML = '<tr><td colspan="8">Unable to load applications.</td></tr>';
	}
}

async function updateLoanStatus(id, action) {
	try {
		const res = await fetch(`/api/loans/${action}/${id}`, {
			method: 'PUT',
			credentials: 'include'
		});

		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.error || 'Unable to update loan status');
		}

		alert(data.message || 'Loan updated');
		loadLoanApplications();
	} catch (err) {
		alert(err.message);
	}
}

function setupEventListeners() {
	const hamburgerBtn = document.getElementById('hamburgerBtn');
	const sidebar = document.querySelector('.sidebar');
	const overlay = document.getElementById('sidebarOverlay');

	if (hamburgerBtn && sidebar && overlay) {
		hamburgerBtn.addEventListener('click', function() {
			hamburgerBtn.classList.toggle('active');
			sidebar.classList.toggle('active');
			overlay.classList.toggle('active');
		});

		overlay.addEventListener('click', function() {
			hamburgerBtn.classList.remove('active');
			sidebar.classList.remove('active');
			overlay.classList.remove('active');
		});
	}

	const tbody = document.getElementById('loanApplicationsBody');
	if (tbody) {
		tbody.addEventListener('click', event => {
			const button = event.target.closest('button[data-action][data-id]');
			if (!button) return;

			updateLoanStatus(button.dataset.id, button.dataset.action);
		});
	}

	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', function() {
			window.location.href = '/shared/login.html';
		});
	}
}
