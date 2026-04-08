document.addEventListener('DOMContentLoaded', function() {
	loadCustomers();
	setupEventListeners();
});

function formatCurrency(value) {
	return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function buildAccountText(customer) {
	if (!customer.primary_account) return '--';
	return `${customer.primary_account.acc_no} • ${customer.primary_account.acc_type}`;
}

async function loadCustomers() {
	try {
		const res = await fetch('/api/customers', { credentials: 'include' });
		const customers = res.ok ? await res.json() : [];

		renderCustomerList(customers);
		if (customers.length) {
			renderCustomerDetail(customers[0], customers);
		}
	} catch (err) {
		console.error('Customer summary load failed:', err);
	}
}

function renderCustomerList(customers) {
	const container = document.getElementById('customerList');
	if (!container) return;

	container.innerHTML = '';

	if (!customers.length) {
		container.innerHTML = '<div class="empty-state">No customer records available.</div>';
		return;
	}

	customers.forEach((customer, index) => {
		const item = document.createElement('article');
		item.className = `customer-item${index === 0 ? ' active' : ''}`;
		item.dataset.id = customer.id;
		item.innerHTML = `
			<h4>${customer.name}</h4>
			<div>${customer.email}</div>
			<div class="meta-row">
				<span>KYC: ${customer.kyc_status}</span>
				<span>Accounts: ${customer.account_count}</span>
				<span>Loans: ${customer.loan_count}</span>
			</div>
		`;

		item.addEventListener('click', () => {
			document.querySelectorAll('.customer-item').forEach(card => card.classList.remove('active'));
			item.classList.add('active');
			renderCustomerDetail(customer, customers);
		});

		container.appendChild(item);
	});
}

function renderCustomerDetail(customer, customers) {
	const container = document.getElementById('customerDetail');
	if (!container) return;

	container.innerHTML = `
		<div class="detail-card">
			<h4>${customer.name}</h4>
			<div class="meta-row">
				<span>${customer.email}</span>
				<span>${customer.phone}</span>
			</div>
		</div>
		<div class="detail-card">
			<div class="info-item"><span class="label">KYC Status</span><span class="value value-success">${customer.kyc_status}</span></div>
			<div class="info-item"><span class="label">Customer Type</span><span class="value">${customer.customer_type}</span></div>
			<div class="info-item"><span class="label">Primary Account</span><span class="value">${buildAccountText(customer)}</span></div>
			<div class="info-item"><span class="label">Total Balance</span><span class="value">${formatCurrency(customer.total_balance)}</span></div>
			<div class="info-item"><span class="label">PAN</span><span class="value">${customer.pan_number}</span></div>
			<div class="info-item"><span class="label">Aadhaar</span><span class="value">${customer.adhaar_number}</span></div>
		</div>
		<div class="detail-card">
			<h4>Accounts</h4>
			${customer.accounts.length ? customer.accounts.map(account => `
				<div class="info-item">
					<span class="label">${account.acc_no}</span>
					<span class="value">${account.acc_type} • ${formatCurrency(account.balance)}</span>
				</div>
			`).join('') : '<div class="empty-state">No accounts linked.</div>'}
		</div>
		<div class="detail-card">
			<h4>Loans</h4>
			${customer.loans.length ? customer.loans.map(loan => `
				<div class="info-item">
					<span class="label">${loan.loan_type}</span>
					<span class="value">${formatCurrency(loan.principal_amount)} • ${loan.status}</span>
				</div>
			`).join('') : '<div class="empty-state">No loan records linked.</div>'}
		</div>
	`;
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

	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', function() {
			window.location.href = '/shared/login.html';
		});
	}
}
