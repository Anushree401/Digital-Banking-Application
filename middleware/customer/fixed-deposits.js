document.addEventListener('DOMContentLoaded', () => {
    loadFDData();
    loadAccounts();
    setupEventListeners();
});


async function loadFDData() {
    try {
        const res = await fetch('/api/fds', { credentials: 'include' });

        if (!res.ok) {
            const text = await res.text();
            console.error("FD FETCH ERROR:", text);
            document.getElementById('fdList').innerHTML = '<p>Error loading FDs</p>';
            return;
        }

        const fds = await res.json();
        console.log("FD DATA:", fds);

        displayFDs(fds);

    } catch (err) {
        console.error("FD LOAD ERROR:", err);
    }
}


async function loadAccounts() {
    try {
        const res = await fetch('/api/dashboard', { credentials: 'include' });

        if (!res.ok) {
            const text = await res.text();
            console.error("ACCOUNT FETCH ERROR:", text);
            return;
        }

        const data = await res.json();
        console.log("ACCOUNTS:", data.accounts); 

        const select = document.getElementById('fdAccount');

        if (!select) {
            console.error("fdAccount dropdown not found");
            return;
        }

        select.innerHTML = '<option value="">Select Account</option>';

        (data.accounts || []).forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.id;
            opt.textContent = `${acc.acc_type} (${acc.acc_no})`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Account load error:", err);
    }
}


function displayFDs(fds) {
    const fdList = document.getElementById('fdList');
    fdList.innerHTML = '';

    if (!fds || fds.length === 0) {
        fdList.innerHTML = '<p>No FDs found</p>';
        return;
    }

    fds.forEach(fd => {
        const div = document.createElement('div');
        div.className = "fd-card";

        const principal = parseFloat(fd.principal_amount || 0);
        const rate = parseFloat(fd.interest_rate || 0);

        const start = new Date(fd.start_date);
        const end = new Date(fd.maturity_date);

        const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        const maturity = principal * Math.pow(1 + rate / 100, months / 12);

        div.innerHTML = `
            <h4>FD #${fd.id}</h4>
            <p>Amount: ₹${principal.toFixed(2)}</p>
            <p>Rate: ${rate}%</p>
            <p>Tenure: ${months} months</p>
            <p>Maturity: ₹${maturity.toFixed(2)}</p>
        `;

        fdList.appendChild(div);
    });
}


async function createFD(accountId, amount, tenure) {
    try {
        const res = await fetch('/api/fds/create', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountId,
                amount: Number(amount),
                tenureMonths: Number(tenure)
            })
        });

        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("NOT JSON:", text);
            alert("Server error");
            return;
        }

        if (res.ok) {
            alert("FD Created");
            loadFDData();  
        } else {
            alert(data.error);
        }

    } catch (err) {
        console.error("FD CREATE ERROR:", err);
    }
}


function setupEventListeners() {
    const btn = document.getElementById('openFdBtn');

    if (!btn) {
        console.error("openFdBtn not found");
        return;
    }

    btn.addEventListener('click', () => {

        const accountId = document.getElementById('fdAccount').value;
        const amount = document.getElementById('fdAmount').value;
        const tenure = document.getElementById('fdTenure').value;

        if (!accountId || !amount || !tenure) {
            alert("Fill all fields");
            return;
        }

        createFD(accountId, amount, tenure);
    });

    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                window.location.href = '/auth/login';

            } catch (err) {
                console.error("Logout error:", err);
            }
        });
    }
}