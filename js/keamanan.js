const LOGIN_PAGE = 'signin.html';

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name')
  );
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
      window.location.href = LOGIN_PAGE;
      return;
    }

    const userName =
      (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
      sessionStorage.getItem('user_name') ||
      'Nilam';
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.textContent = userName;

    // FITUR LOGOUT 
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        ['auth_token', 'user_name', 'user_email'].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        sessionStorage.removeItem('selectedCustomer');
        window.location.href = LOGIN_PAGE;
      });
    }

    // --- LOGIKA TOGGLE PENGATURAN POPUP ---
    const btnSettingsToggle = document.getElementById('btnSettingsToggle');
    const settingsPopup = document.getElementById('settingsPopup');
    const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');

    if (btnSettingsToggle && settingsPopup) {
      btnSettingsToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const isShowing = settingsPopup.classList.contains('show');
        if (typeof closeAllPopups === 'function') closeAllPopups();
        if (!isShowing) settingsPopup.classList.add('show');
      });
    }

    if (settingsPopup) {
      settingsPopup.addEventListener('click', (e) => e.stopPropagation());
    }

    window.addEventListener('click', () => {
      if (typeof closeAllPopups === 'function') closeAllPopups();
    });

    const btnNotifToggle = document.getElementById('btnNotifToggle');
    const notifPopup = document.getElementById('notifPopup');
    const settingsItemNotif = document.getElementById('settingsItemNotif');

    function closeAllPopups() {
      const sp = document.getElementById('settingsPopup');
      const np = document.getElementById('notifPopup');
      const fp = document.getElementById('filterPopup');
      if (sp) sp.classList.remove('show');
      if (np) np.classList.remove('show');
      if (fp) fp.classList.remove('show');
    }
    // define closeAllPopups globally if needed
    window.closeAllPopups = closeAllPopups;

    if (btnNotifToggle && notifPopup) {
      btnNotifToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = notifPopup.classList.contains('show');
        closeAllPopups();
        if (!isShowing) notifPopup.classList.add('show');
      });
      notifPopup.addEventListener('click', (e) => e.stopPropagation());
    }

    if (settingsItemNotif && notifPopup) {
      settingsItemNotif.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPopups();
        notifPopup.classList.add('show');
      });
    }

    const btnFilterToggle = document.getElementById('btnFilterToggle');
    const filterPopup = document.getElementById('filterPopup');

    if (btnFilterToggle && filterPopup) {
      btnFilterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = filterPopup.classList.contains('show');
        closeAllPopups();
        if (!isShowing) filterPopup.classList.add('show');
      });
      filterPopup.addEventListener('click', (e) => e.stopPropagation());
    }

    const markAllBtn = document.querySelector('.notif-mark-read');
    const notifItems = document.querySelectorAll('.notif-item');

    if (markAllBtn) {
      markAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        notifItems.forEach(item => {
          const dot = item.querySelector('.notif-unread-dot');
          if (dot) dot.style.display = 'none';
        });
      });
    }

    notifItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const dot = item.querySelector('.notif-unread-dot');
        if (dot) dot.style.display = 'none';
      });
    });

    if (settingsLogoutBtn) {
      settingsLogoutBtn.addEventListener('click', () => {
        ['auth_token', 'user_name', 'user_email'].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        sessionStorage.removeItem('selectedCustomer');
        window.location.href = LOGIN_PAGE;
      });
    }

  // SPA logic removed for profil page
    // Keamanan page logic can go here
});
