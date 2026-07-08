document.addEventListener('DOMContentLoaded', () => {
    // 1. Load user data from localStorage
    const userName = localStorage.getItem('user_name') || 'Guest User';
    const userEmail = localStorage.getItem('user_email') || 'guest@foodsync.com';
    const userRole = localStorage.getItem('user_role') || 'guest';
    
    // Map role key to display string
    const roleDisplayMap = {
        'sales': 'Sales & Marketing',
        'hr': 'Human Resources',
        'finance': 'Finance',
        'production': 'Production',
        'inventory': 'Inventory',
        'purchasing': 'Purchasing',
        'super_admin': 'Super Admin'
    };
    
    const roleDisplay = roleDisplayMap[userRole] || userRole.toUpperCase();
    
    // 2. Populate UI elements
    const topName = document.getElementById('userNameDisplay');
    const topRole = document.getElementById('userRoleDisplay');
    if (topName) topName.textContent = userName;
    if (topRole) topRole.textContent = roleDisplay;
    
    const pdName = document.getElementById('pdName');
    const pdEmail = document.getElementById('pdEmail');
    const pdRoleBadge = document.getElementById('pdRoleBadge');
    
    if (pdName) pdName.textContent = userName;
    if (pdEmail) pdEmail.textContent = userEmail;
    if (pdRoleBadge) pdRoleBadge.textContent = userRole.toUpperCase();

    // 2.5 Load Avatar
    const savedPhoto = (sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'));
    if (savedPhoto) {
        const userAvatars = document.querySelectorAll('.user-avatar');
        const bigAvatars = document.querySelectorAll('.big-avatar');
        const pdAvatars = document.querySelectorAll('.pd-avatar');
        
        userAvatars.forEach(av => {
            av.innerHTML = `<img src="${savedPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        });
        pdAvatars.forEach(av => {
            av.innerHTML = `<img src="${savedPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        });
        bigAvatars.forEach(av => {
            av.style.backgroundImage = `url('${savedPhoto}')`;
            av.style.backgroundSize = 'cover';
        });
    }
    
    // 3. Dropdown Toggle Logic
    const profileBtn = document.getElementById('userProfileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileChevron = document.querySelector('.profile-chevron');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            if (profileChevron) {
                if (profileDropdown.classList.contains('show')) {
                    profileChevron.classList.remove('bx-chevron-down');
                    profileChevron.classList.add('bx-chevron-up');
                } else {
                    profileChevron.classList.remove('bx-chevron-up');
                    profileChevron.classList.add('bx-chevron-down');
                }
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
                if (profileChevron) {
                    profileChevron.classList.remove('bx-chevron-up');
                    profileChevron.classList.add('bx-chevron-down');
                }
            }
        });
    }
    
    // 4. Logout Logic
    const logoutBtn = document.getElementById('pdLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            window.location.href = 'signin.html';
        });
    }
});
