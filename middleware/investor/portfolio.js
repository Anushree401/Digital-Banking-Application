document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
    const res = await fetch('/api/investments', {
        credentials: 'include'
    });

    const data = await res.json();

    let total = 0;

    data.forEach(inv => {
        total += Number(inv.amount);
    });

    document.getElementById('invTotalDeployed').textContent = `₹${total}`;
    document.getElementById('invActiveDeals').textContent = data.length;
    document.getElementById('invExpectedYield').textContent = '10%';
    document.getElementById('invMonthPayout').textContent = '₹0';
}

function groupByRisk(items) {
	const acc = { low: 0, medium: 0, high: 0 };
	items.forEach(item => {
		const key = String(item.risk_profile || 'medium').toLowerCase();
		const safeKey = acc[key] !== undefined ? key : 'medium';
		acc[safeKey] += Number(item.investment_balance || 0);
	});
	return acc;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
