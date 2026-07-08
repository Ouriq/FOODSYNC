

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

function formatRupiah(number) {
    if (isNaN(number)) return "0";
    return new Intl.NumberFormat('id-ID').format(number);
}

function formatShortRupiah(number) {
    if (number >= 1000000000) {
        return 'Rp ' + Number((number / 1000000000).toFixed(2)) + ' M';
    } else if (number >= 1000000) {
        return 'Rp ' + Number((number / 1000000).toFixed(2)) + ' Jt';
    }
    return 'Rp ' + formatRupiah(number);
}

let campaignsData = [];
let maxBudget = 2500000000; // default 2.5 M

document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  const userName =
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name') ||
    'Pengguna';
  document.getElementById('userNameDisplay').textContent = userName;

  const userPhoto = (sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'));
  if (userPhoto) {
    var avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(function(av) {
      av.innerHTML = "<img src='" + userPhoto + "' style='width:100%; height:100%; border-radius:50%; object-fit:cover;'>";
    });
  }

  // --- LOAD MAX BUDGET FROM localStorage (Finance Allocations) ---
  maxBudget = 0;
  var financeAllocations = JSON.parse(localStorage.getItem('erp_finance_allocations') || '[]');
  financeAllocations.forEach(function(alloc) {
      // Hanya alokasi untuk divisi "Sales & Marketing" yang berstatus "approved"
      if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
          maxBudget += Number(alloc.nominal);
      }
  });
  
  // Jika belum ada alokasi sama sekali, beri nilai default agar tidak 0 / error (opsional, sesuaikan bisnis logik)
  if (maxBudget === 0) {
      maxBudget = 0; // Mengikuti budget finance yang sebenarnya (0 jika belum ada dana turun)
  }

  // --- Listener untuk storage event (agar sinkron saat finance ubah alokasi) ---
  window.addEventListener('storage', function(e) {
      if (e.key === 'erp_finance_allocations' || e.key === 'campaigns_data') {
          // Recalculate max budget
          var newMaxBudget = 0;
          var updatedAllocations = JSON.parse(localStorage.getItem('erp_finance_allocations') || '[]');
          updatedAllocations.forEach(function(alloc) {
              if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
                  newMaxBudget += Number(alloc.nominal);
              }
          });
          maxBudget = newMaxBudget;
          
          if (e.key === 'campaigns_data') {
             loadCampaigns();
          }
          
          updateStats();
      }
  });

  // --- LOAD CAMPAIGNS FROM localStorage ---
  function loadCampaigns() {
      campaignsData = JSON.parse(localStorage.getItem('campaigns_data') || '[]');
      campaignsData.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }

  function saveCampaigns() {
      localStorage.setItem('campaigns_data', JSON.stringify(campaignsData));
  }

  // Initial load
  loadCampaigns();

  // --- RENDER TABLE ---
  function renderTable() {
    var tableBody = document.getElementById('kampanyeTableBody');
    tableBody.innerHTML = '';

    // Apply filters
    var searchVal = '';
    var searchEl = document.getElementById('filterSearch');
    if (searchEl) searchVal = searchEl.value.toLowerCase();
    
    var checkedMedia = Array.from(document.querySelectorAll('.filter-media:checked')).map(function(cb) { return cb.value; });
    var checkedStatusEl = document.querySelector('input[name="statusFilter"]:checked');
    var checkedStatus = checkedStatusEl ? checkedStatusEl.value : 'Semua';

    var filtered = campaignsData.filter(function(c) {
        var match = true;
        if (searchVal && c.nama.toLowerCase().indexOf(searchVal) === -1) match = false;
        if (checkedMedia.length > 0 && checkedMedia.indexOf(c.media) === -1) match = false;
        if (checkedStatus !== 'Semua' && c.status !== checkedStatus) match = false;
        return match;
    });

    filtered.forEach(function(c) {
      var iconClass = 'bx-tv';
      var bgClass = 'bg-gray';
      if (c.media === 'Tiktok') {
        iconClass = 'bxl-tiktok';
        bgClass = 'bg-dark';
      } else if (c.media === 'Instagram Reels') {
        iconClass = 'bxl-instagram';
        bgClass = 'bg-dark';
      } else if (c.media === 'YouTube Ads') {
        iconClass = 'bxl-youtube';
        bgClass = 'bg-dark';
      } else if (c.media === 'Billboard') {
        iconClass = 'bx-buildings';
        bgClass = 'bg-gray';
      }

      var formattedAnggaran = 'Rp. ' + formatRupiah(c.anggaran);
      
      var statusClass = 'aktif';
      if (c.status === 'Draft') statusClass = 'draft';
      if (c.status === 'Selesai') statusClass = 'selesai';

      // Calculate progress
      var progressText = '1 hari';
      var progressWidth = '5%';
      if (c.tanggalMulai && c.tanggalAkhir) {
          var start = new Date(c.tanggalMulai);
          var end = new Date(c.tanggalAkhir);
          var now = new Date();
          var totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          var elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
          if (elapsedDays < 0) elapsedDays = 0;
          if (elapsedDays > totalDays) elapsedDays = totalDays;
          var pct = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;
          if (pct > 100) pct = 100;
          progressText = elapsedDays + ' hari';
          progressWidth = pct + '%';
      }

      var draftBtn = '';
      if (c.status === 'Draft') {
          draftBtn = '<button class="btn-activate-draft" data-id="' + c.id + '" style="margin: 8px auto 0 auto; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; padding: 4px 12px; background-color: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: fit-content;"><i class=\'bx bx-play\'></i> Jalankan</button>';
      }

      var tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function(e) {
          if (e.target.closest('.btn-activate-draft')) return; // Ignore click on the button itself

                    // Populate and show detail modal
          var modalDetail = document.getElementById('modalDetailKampanye');
          if (modalDetail) {
              document.getElementById('detailNamaInput').value = c.nama || '';
              document.getElementById('detailSubNamaInput').value = c.subNama || '';
              document.getElementById('detailMediaInput').value = c.media || '';
              document.getElementById('detailAnggaranInput').value = formattedAnggaran || '';
              document.getElementById('detailDeskripsiInput').value = c.deskripsi || '';
              document.getElementById('detailMulaiInput').value = c.tanggalMulai || '';
              document.getElementById('detailAkhirInput').value = c.tanggalAkhir || '';
              
              var sisaHariText = '-';
              if (c.tanggalAkhir) {
                  var today = new Date();
                  today.setHours(0,0,0,0);
                  var end = new Date(c.tanggalAkhir);
                  var diffTime = end - today;
                  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) sisaHariText = 'Berakhir';
                  else if (diffDays === 0) sisaHariText = 'Hari ini terakhir';
                  else sisaHariText = diffDays + ' hari lagi';
              }
              document.getElementById('detailSisaHariBadge').textContent = 'Sisa Waktu: ' + sisaHariText;
              
              var btnHapus = document.getElementById('btnHapusKampanye');
              if (btnHapus) {
                  var newBtnHapus = btnHapus.cloneNode(true);
                  btnHapus.parentNode.replaceChild(newBtnHapus, btnHapus);
                  newBtnHapus.addEventListener('click', function() {
                      if (confirm('Apakah Anda yakin ingin menghapus kampanye "' + c.nama + '"?')) {
                          campaignsData = campaignsData.filter(function(camp) { return camp.id !== c.id; });
                          saveCampaigns();
                          renderTable();
                          updateStats();
                          modalDetail.classList.remove('active');
                      }
                  });
              }
              
              var btnTutup = document.getElementById('btnTutupDetail');
              if (btnTutup) {
                  var newBtnTutup = btnTutup.cloneNode(true);
                  btnTutup.parentNode.replaceChild(newBtnTutup, btnTutup);
                  newBtnTutup.addEventListener('click', function() {
                      modalDetail.classList.remove('active');
                  });
              }

              modalDetail.classList.add('active');
          }
      });
      tr.innerHTML = 
        '<td>' +
          '<div class="kampanye-name-cell">' +
            '<div class="media-icon ' + bgClass + '"><i class="bx ' + iconClass + '"></i></div>' +
            '<div>' +
              '<p class="k-title">' + c.nama + '</p>' +
              '<p class="k-subtitle">' + (c.subNama || '') + '</p>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="font-bold">' + c.media + '</td>' +
        '<td class="font-bold">' + formattedAnggaran + '</td>' +
        '<td>' +
          '<span class="status-pill ' + statusClass + '">' + c.status + '</span>' +
          draftBtn +
        '</td>' +
        '<td>' +
          '<div class="mini-progress">' +
            '<span class="font-bold">' + progressText + '</span>' +
            '<div class="mini-bar-bg"><div class="mini-bar-fill bg-green" style="width: ' + progressWidth + ';"></div></div>' +
          '</div>' +
        '</td>';
      tableBody.appendChild(tr);
    });

    // Attach event listeners for activate draft buttons
    document.querySelectorAll('.btn-activate-draft').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var docId = e.currentTarget.getAttribute('data-id');
            // Find and update in campaignsData
            for (var i = 0; i < campaignsData.length; i++) {
                if (campaignsData[i].id === docId) {
                    campaignsData[i].status = 'Aktif';
                    break;
                }
            }
            saveCampaigns();
            renderTable();
            updateStats();
        });
    });
  }

  function updateStats() {
      var aktif = 0, draft = 0, selesai = 0;
      var totalAnggaran = 0;
      
      campaignsData.forEach(function(c) {
          if (c.status === 'Aktif') aktif++;
          if (c.status === 'Draft') draft++;
          if (c.status === 'Selesai') selesai++;
          
          if (c.status !== 'Draft') totalAnggaran += Number(c.anggaran);
      });

      var cards = document.querySelectorAll('.stat-card h3');
      if (cards.length >= 3) {
          cards[0].textContent = aktif;
          cards[1].textContent = draft;
          cards[2].textContent = selesai;
      }
      
      // Update Budget UI
      var usedBudgetDisplay = document.getElementById('usedBudgetDisplay');
      var maxBudgetDisplay = document.getElementById('maxBudgetDisplay');
      var budgetProgressBar = document.getElementById('budgetProgressBar');
      var budgetProgressPercent = document.getElementById('budgetProgressPercent');
      var budgetRemainingDisplay = document.getElementById('budgetRemainingDisplay');

      if (usedBudgetDisplay) {
          usedBudgetDisplay.textContent = formatShortRupiah(totalAnggaran);
          maxBudgetDisplay.textContent = '/ ' + formatShortRupiah(maxBudget);
          
          var percent = 0;
          if (maxBudget > 0) percent = (totalAnggaran / maxBudget) * 100;
          if (percent > 100) percent = 100;
          
          budgetProgressBar.style.width = percent + '%';
          budgetProgressPercent.textContent = Math.round(percent) + '%';
          
          var sisa = maxBudget - totalAnggaran;
          if (sisa < 0) sisa = 0;
          budgetRemainingDisplay.textContent = 'Sisa ' + formatShortRupiah(sisa);
          
          if (percent >= 90) {
              budgetProgressBar.style.backgroundColor = '#ef4444';
          } else {
              budgetProgressBar.style.backgroundColor = '#4F46E5';
          }
      }
  }

  // Initial render
  renderTable();
  updateStats();

  // --- FILTERS ---
  var filterSearch = document.getElementById('filterSearch');
  if (filterSearch) filterSearch.addEventListener('input', renderTable);
  
  var btnTerapkanFilter = document.getElementById('btnTerapkanFilter');
  if (btnTerapkanFilter) {
      btnTerapkanFilter.addEventListener('click', function() {
          renderTable();
          var fp = document.getElementById('filterPopup');
          if (fp) fp.classList.remove('show');
      });
  }

  var btnHapusFilter = document.getElementById('btnHapusFilter');
  if (btnHapusFilter) {
      btnHapusFilter.addEventListener('click', function() {
          document.querySelectorAll('.filter-media').forEach(function(cb) { cb.checked = false; });
          var semuaRadio = document.querySelector('input[name="statusFilter"][value="Semua"]');
          if (semuaRadio) semuaRadio.checked = true;
          if (filterSearch) filterSearch.value = '';
          
          renderTable();
          var fp = document.getElementById('filterPopup');
          if (fp) fp.classList.remove('show');
      });
  }

  // Also handle CSS-class based filter buttons
  var btnTerapkanCSS = document.querySelector('.btn-terapkan-filter');
  if (btnTerapkanCSS && btnTerapkanCSS !== btnTerapkanFilter) {
      btnTerapkanCSS.addEventListener('click', function() {
          renderTable();
          var fp = document.getElementById('filterPopup');
          if (fp) fp.classList.remove('show');
      });
  }
  var btnHapusCSS = document.querySelector('.btn-hapus-filter');
  if (btnHapusCSS && btnHapusCSS !== btnHapusFilter) {
      btnHapusCSS.addEventListener('click', function() {
          var fp = document.getElementById('filterPopup');
          if (fp) fp.classList.remove('show');
      });
  }

  // --- LOGIKA FORM TAMBAH KAMPANYE ---
  var modal = document.getElementById('modalKampanye');
  var btnTambah = document.getElementById('btnTambahKampanye');
  var btnDraft = document.getElementById('btnDraft');
  var form = document.getElementById('formKampanye');

  if (btnTambah) {
      btnTambah.addEventListener('click', function() {
          if (modal) modal.classList.add('active');
      });
  }

  if (btnDraft) {
      btnDraft.addEventListener('click', function() {
          saveCampaignForm('Draft');
      });
  }

  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      if (form) form.reset();
    }
    var modalDetail = document.getElementById('modalDetailKampanye');
    if (e.target === modalDetail) {
      modalDetail.classList.remove('active');
    }
  });

  if (form) {
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          saveCampaignForm('Aktif');
      });
  }
  
  
  // --- INPUT ANGGARAN VALIDATION ---
  var inputAnggaran = document.getElementById('inputAnggaran');
  if (inputAnggaran) {
      inputAnggaran.addEventListener('input', function(e) {
          // 1. Hanya izinkan angka
          let rawValue = this.value.replace(/[^0-9]/g, '');
          
          if (!rawValue) {
              this.value = '';
              return;
          }

          // 2. Hitung sisa budget saat ini
          let usedBudget = 0;
          campaignsData.forEach(function(c) {
              if (c.status !== 'Draft') {
                  usedBudget += Number(c.anggaran);
              }
          });
          
          let sisaBudget = maxBudget - usedBudget;
          if (sisaBudget < 0) sisaBudget = 0;

          // 3. Batasi nilai maksimum ke sisa budget
          let parsedValue = parseInt(rawValue, 10);
          if (parsedValue > sisaBudget) {
              parsedValue = sisaBudget;
              if (typeof showToast === 'function') {
                  showToast('Anggaran melebihi sisa budget yang tersedia!');
              } else {
                  // alert('Anggaran melebihi sisa budget!');
              }
          }

          // Kembalikan value sebagai string angka
          this.value = parsedValue.toString();
      });
  }

  function saveCampaignForm(status) {
    var nama = document.getElementById('inputNama').value;
    var subNama = document.getElementById('inputSubNama').value;
    var media = document.getElementById('inputMedia').value;
    var anggaran = document.getElementById('inputAnggaran').value;
    var desc = document.getElementById('inputDeskripsi') ? document.getElementById('inputDeskripsi').value : '';
    var mulai = document.getElementById('inputMulai') ? document.getElementById('inputMulai').value : '';
    var akhir = document.getElementById('inputAkhir') ? document.getElementById('inputAkhir').value : '';

    if (!nama || !media || !anggaran) {
        if (status === 'Aktif') alert("Mohon lengkapi data wajib.");
        return;
    }

    anggaran = parseInt(anggaran.replace(/[^0-9]/g, '')) || 0;

    var newCampaign = {
        id: 'camp-' + Date.now(),
        nama: nama,
        subNama: subNama,
        media: media,
        anggaran: anggaran,
        deskripsi: desc,
        tanggalMulai: mulai,
        tanggalAkhir: akhir,
        status: status,
        createdAt: Date.now()
    };

    campaignsData.unshift(newCampaign);
    saveCampaigns();
    renderTable();
    updateStats();

    // Save notification
    var notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifs.push({
        title: status === 'Aktif' ? "Kampanye Baru Diaktifkan" : "Draft Kampanye Disimpan",
        message: 'Kampanye "' + nama + '" ' + (status === 'Aktif' ? 'berhasil diaktifkan' : 'disimpan sebagai draft') + '.',
        type: "kampanye",
        isRead: false,
        createdAt: Date.now()
    });
    localStorage.setItem('notifications', JSON.stringify(notifs));
    
    if (form) form.reset();
    if (modal) modal.classList.remove('active');
    if (status === 'Aktif') alert('Kampanye "' + nama + '" berhasil diaktifkan!');
    else alert('Kampanye "' + nama + '" disimpan sebagai Draft.');
  }

  // Edit Budget
  var btnEditBudget = document.getElementById('btnEditBudget');
  if (btnEditBudget) {
      btnEditBudget.addEventListener('click', function() {
          var raw = prompt("Masukkan total anggaran kampanye perusahaan (hanya angka, misal 2500000000 untuk 2.5 Miliar):", maxBudget);
          if (raw !== null) {
              var num = parseInt(raw.replace(/[^0-9]/g, ''));
              if (!isNaN(num) && num > 0) {
                  maxBudget = num;
                  localStorage.setItem('campaign_max_budget', num);
                  updateStats();
                  alert("Anggaran berhasil diperbarui!");
              } else {
                  alert("Input tidak valid. Harap masukkan angka yang valid.");
              }
          }
      });
  }

  // Logout
  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      clearAuth();
      window.location.href = LOGIN_PAGE;
    });
  }

  // --- POPUP LOGIC ---
  var btnSettingsToggle = document.getElementById('btnSettingsToggle');
  var settingsPopup = document.getElementById('settingsPopup');
  var settingsLogoutBtn = document.getElementById('settingsLogoutBtn');

  var btnFilterToggle = document.getElementById('btnFilterToggle');
  var filterPopup = document.getElementById('filterPopup');

  var btnNotifToggle = document.getElementById('btnNotifToggle');
  var notifPopup = document.getElementById('notifPopup');
  var settingsItemNotif = document.getElementById('settingsItemNotif');

  function closeAllPopups() {
    if (settingsPopup) settingsPopup.classList.remove('show');
    if (filterPopup) filterPopup.classList.remove('show');
    if (notifPopup) notifPopup.classList.remove('show');
  }

  if (btnSettingsToggle && settingsPopup) {
    btnSettingsToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isShowing = settingsPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) settingsPopup.classList.add('show');
    });
    settingsPopup.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  if (btnFilterToggle && filterPopup) {
    btnFilterToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isShowing = filterPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) filterPopup.classList.add('show');
    });
    filterPopup.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  if (btnNotifToggle && notifPopup) {
    btnNotifToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isShowing = notifPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) notifPopup.classList.add('show');
    });
    notifPopup.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  if (settingsItemNotif && notifPopup) {
    settingsItemNotif.addEventListener('click', function(e) {
      e.stopPropagation();
      closeAllPopups();
      notifPopup.classList.add('show');
    });
  }

  var markAllBtn = document.querySelector('.notif-mark-read');
  var notifItems = document.querySelectorAll('.notif-item');

  if (markAllBtn) {
    markAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      notifItems.forEach(function(item) {
        var dot = item.querySelector('.notif-unread-dot');
        if (dot) dot.style.display = 'none';
      });
    });
  }

  notifItems.forEach(function(item) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      var dot = item.querySelector('.notif-unread-dot');
      if (dot) dot.style.display = 'none';
    });
  });

  window.addEventListener('click', function() {
    closeAllPopups();
  });

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', function() {
      clearAuth();
      window.location.href = LOGIN_PAGE;
    });
  }

  var filterHeaders = document.querySelectorAll('.f-header');
  filterHeaders.forEach(function(header) {
    header.addEventListener('click', function() {
      header.classList.toggle('collapsed');
      var body = header.nextElementSibling;
      if (body && body.classList.contains('f-body')) {
        body.classList.toggle('collapsed');
      }
    });
  });
});
