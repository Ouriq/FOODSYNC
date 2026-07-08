
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

function showToast(message, color = '#22c55e') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = color;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  toast.style.pointerEvents = 'auto';
  setTimeout(() => { 
    toast.style.opacity = '0'; 
    toast.style.transform = 'translateY(-20px)';
    toast.style.pointerEvents = 'none';
  }, 3500);
}

function initApp() {
  if (!isLoggedIn()) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  const userName =
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name') ||
    'Pengguna';
  
  const userNameDisplay = document.getElementById('userNameDisplay');
  if (userNameDisplay) userNameDisplay.textContent = userName;

  const modal = document.getElementById('modalAddData');
  const btnAdd = document.getElementById('btnAddData');
  const btnDraft = document.getElementById('btnDraft');
  const form = document.getElementById('formAddData');
  const tableBody = document.getElementById('tableBody');
  const paginationContainer = document.querySelector('.pagination');

  let customersData = JSON.parse(localStorage.getItem('customers_data')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  function generateDistributorId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(customersData.length + 1).padStart(4, '0');
    const rand = String(Math.floor(Math.random() * 90) + 10);
    return 'ID-' + year + month + '-' + seq + '-' + rand;
  }

  if (btnAdd && modal) {
    btnAdd.addEventListener('click', () => { 
      const inputID = document.getElementById('inputID');
      if (inputID) {
        inputID.value = generateDistributorId();
      }
      modal.classList.add('active');
    });
  }

  window.addEventListener('click', (e) => {
    if (modal && e.target === modal) {
      modal.classList.remove('active');
    }
  });

  if (btnDraft && form && modal) {
    btnDraft.addEventListener('click', () => {
      form.reset();
      modal.classList.remove('active');
    });
  }

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (customersData.length === 0 && !localStorage.getItem('foodsync_is_cleared')) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Belum ada data pelanggan.</td></tr>';
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Sort by createdAt desc
    const sortedData = [...customersData].sort((a, b) => b.createdAt - a.createdAt);
    const salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
    const drafts = salesOrders.filter(so => so.status === 'draft').map(so => so.customer.id);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    paginatedData.forEach((data) => {
      let isExpired = false;
      if (data.tglBerakhir) {
        const endDate = new Date(data.tglBerakhir);
        endDate.setHours(23, 59, 59, 999);
        if (endDate < new Date()) isExpired = true;
      }
      
      let namaHtml = (data.nama || '-');
      if (isExpired) {
        namaHtml += ' <span style="font-size: 11px; background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Expired</span>';
      }
      if (drafts.includes(data.id) || drafts.includes(data.idDist)) {
        namaHtml += ' <span style="font-size: 11px; background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Draft SO</span>';
      }

            const tr = document.createElement('tr');
      tr.setAttribute('data-nama-asli', data.nama || '-');
      tr.innerHTML = '<td><span class="cust-id-link" data-id="' + data.id + '" style="color: #2563eb; font-weight: 600; text-decoration: underline; cursor: pointer;">' + (data.idDist || '-') + '</span></td>' +
                     '<td>' + namaHtml + '</td>' +
                     '<td>' + (data.kategori || '-') + '</td>' +
                     '<td>' + (data.tier || '-') + '</td>' +
                     '<td>' + (data.pic || '-') + '</td>' +
                     '<td>' + (data.telp || '-') + '</td>' +
                     '<td style="text-align:center;"><button class="btn-delete" data-id="' + data.id + '" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;"><i class=\'bx bx-trash\'></i> Hapus</button></td>';

      tr.style.cursor = 'pointer';
      tableBody.appendChild(tr);
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        renderTable();
      });
      paginationContainer.appendChild(btn);
    }
  }

  
  // --- HANDLE DELETE BUTTON ---
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        e.stopPropagation(); // Prevent triggering row click
        const idToDelete = deleteBtn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus pelanggan ini?')) {
          customersData = customersData.filter(c => c.id !== idToDelete);
          localStorage.setItem('customers_data', JSON.stringify(customersData));
          
          // Re-render
          const totalPages = Math.ceil(customersData.length / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
          renderTable();
        }
      }
    });
  }
  // ----------------------------

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const idDist = document.getElementById('inputID') ? document.getElementById('inputID').value : '';
      const nama = document.getElementById('inputNama') ? document.getElementById('inputNama').value : '';
      const kat1 = document.getElementById('inputKategori1') ? document.getElementById('inputKategori1').value : '';
      const kat2 = document.getElementById('inputKategori2') ? document.getElementById('inputKategori2').value : '';
      const kat3 = document.getElementById('inputKategori3') ? document.getElementById('inputKategori3').value : '';
      const kategoriArr = [kat1, kat2, kat3].filter(k => k && k !== '');
      const kategori = kategoriArr.length > 0 ? kategoriArr.join(', ') : '';
      const tier = document.getElementById('inputTier') ? document.getElementById('inputTier').value : '';
      const pic = document.getElementById('inputPIC') ? document.getElementById('inputPIC').value : '';
      const telp = document.getElementById('inputTelp') ? document.getElementById('inputTelp').value : '';
      const inputDeskripsi = document.getElementById('inputDeskripsi');
      const inputMulai = document.getElementById('inputMulai');
      const inputBerakhir = document.getElementById('inputBerakhir');
      const deskripsi = inputDeskripsi ? inputDeskripsi.value : '';
      const tglMulai = inputMulai ? inputMulai.value : '';
      const tglBerakhir = inputBerakhir ? inputBerakhir.value : '';

      const btnSubmit = form.querySelector('button[type="submit"]');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Menyimpan...';
      }

      try {
        const newCustomer = {
          id: 'cust_' + Date.now(),
          idDist,
          nama,
          kategori,
          tier,
          pic,
          telp,
          deskripsi,
          tglMulai,
          tglBerakhir,
          createdAt: Date.now()
        };

        customersData.push(newCustomer);
        localStorage.setItem('customers_data', JSON.stringify(customersData));

        form.reset();
        if (modal) modal.classList.remove('active');
        showToast('Berhasil: Data pelanggan ' + nama + ' telah disimpan!');

        sessionStorage.setItem(
          'selectedCustomer',
          JSON.stringify({ id: idDist, nama, tier, pic, telp, kategori })
        );
        
        currentPage = 1;
        renderTable();

      } catch (error) {
        console.error("Error adding document: ", error);
        showToast('Terjadi kesalahan saat menyimpan data.', '#ef4444');
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Simpan';
        }
      }
    });
  }

    if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        e.stopPropagation();
        window.deleteTargetId = deleteBtn.getAttribute('data-id');
        const modalConfirmDelete = document.getElementById('modalConfirmDelete');
        if (modalConfirmDelete) modalConfirmDelete.classList.add('active');
        return;
      }

      const idLink = e.target.closest('.cust-id-link');
      if (idLink) {
          e.stopPropagation();
          const id = idLink.getAttribute('data-id');
          const customer = customersData.find(c => c.id === id);
          if (customer) {
              const modalDetail = document.getElementById('modalDetailPelanggan');
              if (modalDetail) {
                  document.getElementById('detailId').value = customer.idDist || '-';
                  document.getElementById('detailProduk').value = customer.kategori || '-';
                  document.getElementById('detailNama').value = customer.nama || '-';
                  document.getElementById('detailDeskripsi').value = customer.deskripsi || '-';
                  
                  let dateStr = '-';
                  if (customer.createdAt) {
                      const d = new Date(customer.createdAt);
                      dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                  }
                  document.getElementById('detailTanggal').value = dateStr;
                  
                  modalDetail.classList.add('active');
              }
          }
          return;
      }

      const row = e.target.closest('tr');
      if (!row) return;
      
      // Don't click empty row
      if (row.cells.length < 6) return;

      sessionStorage.setItem(
        'selectedCustomer',
        JSON.stringify({
          id: row.cells[0].textContent.trim(),
          nama: row.getAttribute('data-nama-asli') || row.cells[1].textContent.trim(),
          kategori: row.cells[2].textContent.trim(),
          tier: row.cells[3].textContent.trim(),
          pic: row.cells[4].textContent.trim(),
          telp: row.cells[5].textContent.trim(),
        })
      );
      window.location.href = 'sales.html';
    });
  }

  const modalConfirmDelete = document.getElementById('modalConfirmDelete');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  if (btnCancelDelete && modalConfirmDelete) {
    btnCancelDelete.addEventListener('click', () => {
      modalConfirmDelete.classList.remove('active');
      window.deleteTargetId = null;
    });
  }

  if (btnConfirmDelete && modalConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (!window.deleteTargetId) return;
      
      btnConfirmDelete.disabled = true;
      btnConfirmDelete.textContent = 'Menghapus...';
      
      try {
        customersData = customersData.filter(c => c.id !== window.deleteTargetId);
        localStorage.setItem('customers_data', JSON.stringify(customersData));
        showToast("Pelanggan berhasil dihapus", "#22c55e");
        renderTable();
      } catch(err) {
        showToast("Gagal menghapus pelanggan", "#ef4444");
      } finally {
        modalConfirmDelete.classList.remove('active');
        window.deleteTargetId = null;
        btnConfirmDelete.disabled = false;
        btnConfirmDelete.textContent = 'Ya, Hapus';
      }
    });
  }

    // --- POPUP LOGIC ---
  var btnTutupDetail = document.getElementById('btnTutupDetailPelanggan');
  if (btnTutupDetail) {
      btnTutupDetail.addEventListener('click', function() {
          var modalDetail = document.getElementById('modalDetailPelanggan');
          if (modalDetail) modalDetail.classList.remove('active');
      });
  }
// --- POPUP LOGIC ---
  const btnSettingsToggle = document.getElementById('btnSettingsToggle');
  const settingsPopup = document.getElementById('settingsPopup');
  const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
  
  function closeAllPopups() {
    if (settingsPopup) settingsPopup.classList.remove('show');
    const filterPopup = document.getElementById('filterPopup');
    if (filterPopup) filterPopup.classList.remove('show');
    const notifPopup = document.getElementById('notifPopup');
    if (notifPopup) notifPopup.classList.remove('show');
  }

  if (btnSettingsToggle && settingsPopup) {
    btnSettingsToggle.addEventListener('click', (e) => {
      e.stopPropagation(); 
      const isShowing = settingsPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) settingsPopup.classList.add('show');
    });
  }

  if (settingsPopup) {
    settingsPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  window.addEventListener('click', () => {
    closeAllPopups();
  });

  const btnNotifToggle = document.getElementById('btnNotifToggle');
  const notifPopup = document.getElementById('notifPopup');
  const settingsItemNotif = document.getElementById('settingsItemNotif');

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

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = LOGIN_PAGE;
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = LOGIN_PAGE;
    });
  }

  // Initial render
  renderTable();
}

// Ensure it runs
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

const userPhoto = (sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'));
if (userPhoto) {
  const avatars = document.querySelectorAll('.user-avatar');
  avatars.forEach(av => {
    av.innerHTML = "<img src='" + userPhoto + "' style='width:100%; height:100%; border-radius:50%; object-fit:cover;'>";
  });
}


// Dengarkan perubahan dari firebase-sync
window.addEventListener('storage', (e) => {
    if (e.key === 'customers_data') {
        customersData = JSON.parse(localStorage.getItem('customers_data')) || [];
        renderTable();
    }
});
