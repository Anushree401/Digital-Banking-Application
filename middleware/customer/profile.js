document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
    setupEventListeners();
});

function loadProfileData() {
    const mockProfile = {
        fullName: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1-415-238-5972',
        address: '847 Oak Avenue, San Francisco, CA 94102'
    };

    document.getElementById('fullName').value = mockProfile.fullName;
    document.getElementById('email').value = mockProfile.email;
    document.getElementById('phone').value = mockProfile.phone;
    document.getElementById('address').value = mockProfile.address;
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

    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!fullName || !email || !phone || !address) {
            alert('Please fill in all fields');
            return;
        }

        alert('Profile updated successfully!');
    });

    document.getElementById('passwordForm').addEventListener('submit', function(e) {
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

        alert('Password changed successfully!');
        document.getElementById('passwordForm').reset();
    });
}
