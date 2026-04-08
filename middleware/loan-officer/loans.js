document.addEventListener('DOMContentLoaded', function() {
	setupEventListeners();
});

function setupEventListeners() {
	// Hamburger menu toggle
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
			window.location.href = '../shared/login.html';
		});
	}
}
