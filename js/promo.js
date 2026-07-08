const LOGIN_PAGE = 'signin.html';

function clearAuth() {
  ['auth_token', 'user_name', 'user_email'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name')
  );
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  const userName =
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name') ||
    'Pengguna';
  document.getElementById('userNameDisplay').textContent = userName;

  // --- LOGIKA MODAL TAMBAH PROMO ---
  const modal = document.getElementById('modalPromo');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModal');
  const form = document.getElementById('formPromo');
  const tableBody = document.getElementById('promoTableBody');

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    form.reset();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      form.reset();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const kode = document.getElementById('promoKode').value;
    const nama = document.getElementById('promoNama').value;
    const diskonVal = document.getElementById('promoDiskon').value;
    const kuota = document.getElementById('promoKuota').value;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${kode.toUpperCase()}</td>
      <td>${nama}</td>
      <td><span class="badge-discount-green">${diskonVal}%</span></td>
      <td>0/${kuota}</td>
      <td><span class="status-pill aktif">Aktif</span></td>
      <td class="text-green-bold">Sesuai Periode</td>
    `;

    tableBody.insertBefore(newRow, tableBody.firstChild);

    form.reset();
    modal.classList.remove('active');
    alert(`Promo ${kode} berhasil diaktifkan!`);
  });

  // --- LOGIKA TOGGLE FILTER POPUP ---
  const btnFilterToggle = document.getElementById('btnFilterToggle');
  const filterPopup = document.getElementById('filterPopup');

  btnFilterToggle.addEventListener('click', (e) => {
    e.stopPropagation(); 
    const isShowingF = filterPopup.classList.contains('show');
      if (typeof closeAllPopups === 'function') closeAllPopups();
      if (!isShowingF) filterPopup.classList.add('show');
    
    // Tutup popup pengaturan jika sedang terbuka
    if (settingsPopup && settingsPopup.classList.contains('show')) {
      settingsPopup.classList.remove('show');
    }
  });

  filterPopup.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah popup tertutup jika area di dalam popup diklik
  });

  const btnTerapkan = filterPopup.querySelector('.btn-terapkan-filter');
  btnTerapkan.addEventListener('click', () => {
    filterPopup.classList.remove('show');
  });


  // --- LOGIKA TOGGLE PENGATURAN POPUP ---
  const btnSettingsToggle = document.getElementById('btnSettingsToggle');
  const settingsPopup = document.getElementById('settingsPopup');
  const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');

  btnSettingsToggle.addEventListener('click', (e) => {
    e.stopPropagation(); 
    const isShowing = settingsPopup.classList.contains('show');
      if (typeof closeAllPopups === 'function') closeAllPopups();
      if (!isShowing) settingsPopup.classList.add('show');
    
    // Tutup popup filter jika sedang terbuka
    if (filterPopup && filterPopup.classList.contains('show')) {
      filterPopup.classList.remove('show');
    }
  });

  settingsPopup.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah popup tertutup jika area di dalam popup diklik
  });


  // --- KLIK DI LUAR POPUP (GLOBAL) ---
  window.addEventListener('click', () => {
    if (typeof closeAllPopups === 'function') closeAllPopups();
  });

  const btnNotifToggle = document.getElementById('btnNotifToggle');
  const notifPopup = document.getElementById('notifPopup');
  const settingsItemNotif = document.getElementById('settingsItemNotif');

  function closeAllPopups() {
    const settingsPopup = document.getElementById('settingsPopup');
    const filterPopup = document.getElementById('filterPopup');
    if (settingsPopup) settingsPopup.classList.remove('show');
    if (filterPopup) filterPopup.classList.remove('show');
    if (notifPopup) notifPopup.classList.remove('show');
  }

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

  // --- LOGIKA LOGOUT ---
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuth();
    window.location.href = LOGIN_PAGE;
  });

  // Hubungkan tombol Logout di dalam menu Pengaturan ke fungsi yang sama
  settingsLogoutBtn.addEventListener('click', () => {
    clearAuth();
    window.location.href = LOGIN_PAGE;
  });

});