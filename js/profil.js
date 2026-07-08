const LOGIN_PAGE = 'signin.html';

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name')
  );
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
      window.location.href = LOGIN_PAGE;
      return;
    }

    const userName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Guest User';
    const userEmail = localStorage.getItem('user_email') || sessionStorage.getItem('user_email') || 'guest@foodsync.com';
    const userRole = localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'guest';
    const userPhone = localStorage.getItem('user_phone') || '081234567890';
    
    const roleDisplayMap = {
        'sales': 'Sales & Marketing',
        'hr': 'Human Resources',
        'finance': 'Finance',
        'production': 'Production',
        'inventory': 'Inventory',
        'purchasing': 'Purchasing',
        'super_admin': 'Super Admin'
    };
    const roleTitleMap = {
        'sales': 'Sales & Marketing Manager',
        'hr': 'HR Manager',
        'finance': 'Finance Manager',
        'production': 'Production Staff',
        'inventory': 'Inventory Manager',
        'purchasing': 'Purchasing Manager',
        'super_admin': 'Super Admin'
    };
    
    const roleDisplay = roleDisplayMap[userRole] || userRole.toUpperCase();
    const roleTitle = roleTitleMap[userRole] || userRole.toUpperCase();

    // Inisialisasi Tampilan
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.textContent = userName;
    
    // Inisialisasi Form Profil (jika ada)
    const displayProfileName = document.getElementById('displayProfileName');
    if (displayProfileName) {
        document.getElementById('displayProfileName').textContent = userName;
        document.getElementById('displayProfileEmail').textContent = userEmail;
        document.getElementById('displayProfilePhone').textContent = userPhone;
        document.getElementById('displayProfileDept').textContent = roleDisplay;
        document.getElementById('displayProfileRole').textContent = roleTitle;
        
        document.getElementById('editProfileName').value = userName;
        document.getElementById('editProfileEmail').value = userEmail;
        document.getElementById('editProfilePhone').value = userPhone;
        document.getElementById('editProfileDept').value = roleDisplay;
        document.getElementById('editProfileRole').value = roleTitle;
    }


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
    
    // --- UBAH FOTO LOGIC ---
    const btnChangePhotos = document.querySelectorAll('.btn-change-photo');
    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const avatarOptions = document.querySelectorAll('.avatar-option');

    if (avatarModal) {
      btnChangePhotos.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          avatarModal.style.display = 'flex';
        });
      });

      closeAvatarModal.addEventListener('click', () => {
        avatarModal.style.display = 'none';
      });

      avatarOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          const newSrc = opt.getAttribute('data-src');
          
          // Simpan foto di sessionStorage
          sessionStorage.setItem('user_photo', newSrc);
          
          // Update all avatars in DOM
          const userAvatars = document.querySelectorAll('.user-avatar');
          const bigAvatars = document.querySelectorAll('.big-avatar');
          
          userAvatars.forEach(av => {
            av.innerHTML = `<img src="${newSrc}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
          });
          
          bigAvatars.forEach(av => {
            av.style.backgroundImage = `url('${newSrc}')`;
            av.style.backgroundSize = 'cover';
          });

          // Close modal
          avatarModal.style.display = 'none';
          
          if(typeof showToast === 'function') {
            showToast('✅ Foto profil berhasil diubah!');
          }
        });
      });
    }

    // Load saved photo on startup
    const savedPhoto = (sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'));
    if (savedPhoto) {
      const userAvatars = document.querySelectorAll('.user-avatar');
      const bigAvatars = document.querySelectorAll('.big-avatar');
      userAvatars.forEach(av => {
        av.innerHTML = `<img src="${savedPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      });
      bigAvatars.forEach(av => {
        av.style.backgroundImage = `url('${savedPhoto}')`;
        av.style.backgroundSize = 'cover';
      });
    }

    // --- LOGIKA EDIT PROFIL ---
    const btnEditProfile = document.getElementById('btnEditProfile');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    
    const profileDisplayView = document.getElementById('profileDisplayView');
    const profileEditView = document.getElementById('profileEditView');
    
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        profileDisplayView.style.display = 'none';
        profileEditView.style.display = 'block';
      });
    }
    
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        profileEditView.style.display = 'none';
        profileDisplayView.style.display = 'block';
      });
    }
    
    if (btnSaveProfile) {
      btnSaveProfile.addEventListener('click', () => {
        // Ambil nilai dari input
        const newName = document.getElementById('editProfileName').value;
        const newEmail = document.getElementById('editProfileEmail').value;
        const newPhone = document.getElementById('editProfilePhone').value;
        const newDept = document.getElementById('editProfileDept').value;
        const newRole = document.getElementById('editProfileRole').value;
        
        // Update teks di tampilan display
        document.getElementById('displayProfileName').textContent = newName;
        document.getElementById('displayProfileEmail').textContent = newEmail;
        document.getElementById('displayProfilePhone').textContent = newPhone;
        document.getElementById('displayProfileDept').textContent = newDept;
        document.getElementById('displayProfileRole').textContent = newRole;
        
        // Update nama user di topbar
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) userNameDisplay.textContent = newName;
        
        // Simpan ke sessionStorage agar bertahan antar halaman dalam tab yang sama
        sessionStorage.setItem('user_name', newName);
        sessionStorage.setItem('user_phone', newPhone);
        
        // Kembali ke mode display
        profileEditView.style.display = 'none';
        profileDisplayView.style.display = 'block';
      });
    }

});
