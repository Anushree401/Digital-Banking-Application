document.addEventListener('DOMContentLoaded', function() {
	loadLoanApplications();
});

async function loadLoanApplications() {
	const tbody = document.getElementById('loanApplicationsBody');
	if (!tbody) return;

	try {
		const res = await fetch('/api/loans', { credentials: 'include' });
		const loans = res.ok ? await res.json() : [];

		tbody.innerHTML = '';

		if (!loans.length) {
			tbody.innerHTML = '<tr><td colspan="7">No loan applications found.</td></tr>';
			return;
		}

		loans.forEach(loan => {
			const tr = document.createElement('tr');
			const status = String(loan.status || 'pending');
			tr.innerHTML = `
				<td>LN${String(loan.id).padStart(6, '0')}</td>
				<td>Customer #${loan.customer_id}</td>
				<td>${loan.loan_type || '--'}</td>
				<td>₹${Number(loan.principal_amount || 0).toLocaleString('en-IN')}</td>
				<td>--</td>
				<td><span class="badge">${status}</span></td>
				<td>
					<button class="btn btn-approve" data-id="${loan.id}">Approve</button>
					<button class="btn btn-reject" data-id="${loan.id}">Reject</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
	} catch (err) {
		console.error('Loan applications load failed:', err);
		tbody.innerHTML = '<tr><td colspan="7">Unable to load applications.</td></tr>';
	}
}
