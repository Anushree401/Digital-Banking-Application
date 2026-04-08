document.addEventListener('DOMContentLoaded', function() {
    loadKycQueue();
});

async function loadKycQueue() {
    const tbody = document.getElementById('kycBody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/loans', { credentials: 'include' });
        const loans = res.ok ? await res.json() : [];
        const pending = loans.filter(l => String(l.status || '').toLowerCase() === 'pending');

        tbody.innerHTML = '';

        if (!pending.length) {
            tbody.innerHTML = '<tr><td colspan="6">No pending KYC verification records.</td></tr>';
            return;
        }

        pending.forEach(loan => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>CUST-${String(loan.customer_id).padStart(4, '0')}</td>
                <td>Customer #${loan.customer_id}</td>
                <td>--</td>
                <td>--</td>
                <td><span class="badge">Pending</span></td>
                <td>
                    <button class="btn btn-approve">Verify</button>
                    <button class="btn btn-reject">Reject</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('KYC queue load failed:', err);
        tbody.innerHTML = '<tr><td colspan="6">Unable to load KYC queue.</td></tr>';
    }
}
