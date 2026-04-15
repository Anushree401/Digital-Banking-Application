document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupEventListeners();
});

async function loadProfileData() {
    try {
        const res = await fetch('/api/profile', {
            credentials: 'include'
        });
        if (res.status === 401) {
            window.location.href = '/auth/login';
            return;
        }
        const user = await res.json();
        document.getElementById('fullName').value =
            (user.fname || '') + ' ' + (user.lname || '');
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';

    } catch (err) {
        console.error(err);
        alert('Error loading profile');
    }
}

function setupEventListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
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

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = '../shared/login.html';
    });

    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!fullName || !email || !phone || !address) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    fname: fullName.split(' ')[0],
                    lname: fullName.split(' ').slice(1).join(' '),
                    email,
                    phone,
                    address
                })
            });

            if (!res.ok) {
                throw new Error('Update failed');
            }

            alert('Profile updated successfully!');

        } catch (err) {
            console.error(err);
            alert('Error updating profile');
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                return alert(data.error || 'Error changing password');
            }

            alert('Password changed successfully!');
            document.getElementById('passwordForm').reset();

        } catch (err) {
            console.error(err);
            alert('Server error');
        }
        document.getElementById('passwordForm').reset();
    });
}
