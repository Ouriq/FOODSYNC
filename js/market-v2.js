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

    const userName =
      localStorage.getItem('user_name') ||
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

    /* duplicate removed */
    /* duplicate removed */

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

    
    // SPA Logic for Market Intelligence
    const btnShowAddForm = document.getElementById('btnShowAddForm');
    const btnCancelAdd = document.getElementById('btnCancelAdd');
    const btnSaveData = document.getElementById('btnSaveData');
    const btnSuccessAddMore = document.getElementById('btnSuccessAddMore');
    const btnSuccessViewAll = document.getElementById('btnSuccessViewAll');
    const btnSuccessNextPage = document.getElementById('btnSuccessNextPage');
    
    const marketDashboardView = document.getElementById('marketDashboardView');
    const marketAddFormView = document.getElementById('marketAddFormView');
    const marketSuccessView = document.getElementById('marketSuccessView');

    const showView = (viewToShow) => {
      if (marketDashboardView) marketDashboardView.style.display = 'none';
      if (marketAddFormView) marketAddFormView.style.display = 'none';
      if (marketSuccessView) marketSuccessView.style.display = 'none';
      if (viewToShow) {
          viewToShow.style.display = 'block';
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
              mainContent.scrollTop = 0;
          } else {
              window.scrollTo(0, 0);
          }
      }
    };
    
    // --- DATA PERSISTENCE LOGIC ---
    let marketData = JSON.parse(localStorage.getItem('market_data') || '[]');
    if (marketData.length === 0) {
        // Default data
        marketData = [
            { id: '1', nama: 'Sedaap', varian: 'Ayam Bawang, Soto', harga: '85000', promo: 'Bundling + Cashback 10%', date: '19 Mei 2026', badge: 'badge-green', catatan: 'Bundling promo strategy' },
            { id: '2', nama: 'Sarimi', varian: 'Soto, Ayam Bawang', harga: '98000', promo: 'Free Ongkir min. 2 Karton', date: '17 Mei 2026', badge: 'badge-blue', catatan: 'Free ongkir strategy' },
            { id: '3', nama: 'Supermi', varian: 'Goreng, Kari', harga: '75000', promo: 'Diskon 15% Grosir', date: '15 Mei 2026', badge: 'badge-red', catatan: 'Wholesale discount strategy' }
        ];
        localStorage.setItem('market_data', JSON.stringify(marketData));
    }

    function formatRupiah(number) {
        return 'Rp ' + Number(number).toLocaleString('id-ID');
    }
    
    function updateMarketSummary() {
        if (!marketData || marketData.length === 0) {
            if (document.getElementById('statTotalPesaing')) document.getElementById('statTotalPesaing').textContent = '0';
            if (document.getElementById('statAvgHarga')) document.getElementById('statAvgHarga').textContent = 'Rp 0';
            if (document.getElementById('statMinHarga')) document.getElementById('statMinHarga').textContent = 'Rp 0';
            if (document.getElementById('statMaxHarga')) document.getElementById('statMaxHarga').textContent = 'Rp 0';
            return;
        }

        let totalPesaing = marketData.length;
        let prices = marketData.map(d => parseInt(d.harga) || 0).filter(p => p > 0);
        
        let avg = 0;
        let min = 0;
        let max = 0;

        if (prices.length > 0) {
            let sum = prices.reduce((a, b) => a + b, 0);
            avg = Math.round(sum / prices.length);
            min = Math.min(...prices);
            max = Math.max(...prices);
        }

        if (document.getElementById('statTotalPesaing')) document.getElementById('statTotalPesaing').textContent = totalPesaing;
        if (document.getElementById('statAvgHarga')) document.getElementById('statAvgHarga').textContent = formatRupiah(avg);
        if (document.getElementById('statMinHarga')) document.getElementById('statMinHarga').textContent = formatRupiah(min);
        if (document.getElementById('statMaxHarga')) document.getElementById('statMaxHarga').textContent = formatRupiah(max);
    }

    function renderMarketTable() {
        const tbody = document.querySelector('.market-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        marketData.forEach((item, index) => {
            const badgeClass = item.badge || 'badge-green';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><a href="#" class="btn-show-recommendation" data-id="${item.id}" style="color: #0A3A82; text-decoration: underline; cursor: pointer; font-weight: 600;">${item.nama}</a></td>
                <td>${item.varian}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td><span class="badge ${badgeClass}">${item.promo}</span></td>
                <td>${item.date}</td>
                <td><button class="btn-icon btn-delete-market" data-id="${item.id}" style="color: #ef4444;"><i class='bx bx-trash'></i></button></td>
            `;
            tbody.appendChild(tr);
        });
        
        // Attach recommendation listeners
        document.querySelectorAll('.btn-show-recommendation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = e.currentTarget.getAttribute('data-id');
                const targetData = marketData.find(d => d.id === id);
                if (targetData) {
                    const modal = document.getElementById('modalRekomendasi');
                    if (modal) {
                        document.getElementById('modalRekTitle').textContent = 'Rekomendasi: ' + targetData.nama;
                        document.getElementById('modalRekContent').textContent = targetData.catatan || 'Belum ada rekomendasi tercatat untuk pesaing ini.';
                        modal.classList.add('active');
                    }
                }
            });
        });

        // Close modal logic
        const btnTutupRek = document.getElementById('btnTutupRek');
        if (btnTutupRek) {
            btnTutupRek.addEventListener('click', () => {
                document.getElementById('modalRekomendasi').classList.remove('active');
            });
        }

        // Attach delete listeners
        document.querySelectorAll('.btn-delete-market').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Apakah Anda yakin ingin menghapus data pesaing ini?')) {
                    marketData = marketData.filter(d => d.id !== id);
                    localStorage.setItem('market_data', JSON.stringify(marketData));
                    renderMarketTable();
                }
            });
        });
        
        updateMarketSummary();
    }
    
    // Initial render
    renderMarketTable();

    if (btnShowAddForm) {
      btnShowAddForm.addEventListener('click', () => {
          // Clear inputs
          const inputs = ['inputNamaPesaing', 'inputVarian', 'inputHarga', 'inputPromo', 'inputCatatan'];
          inputs.forEach(id => {
              const el = document.getElementById(id);
              if(el) el.value = '';
          });
          showView(marketAddFormView);
      });
    }
    if (btnCancelAdd) {
      btnCancelAdd.addEventListener('click', () => showView(marketDashboardView));
    }
    if (btnSaveData) {
      btnSaveData.addEventListener('click', () => {
          const nama = document.getElementById('inputNamaPesaing') ? document.getElementById('inputNamaPesaing').value : '';
          const varian = document.getElementById('inputVarian') ? document.getElementById('inputVarian').value : '';
          let harga = document.getElementById('inputHarga') ? document.getElementById('inputHarga').value : '';
          harga = harga.replace(/[^0-9]/g, '');
          const promo = document.getElementById('inputPromo') ? document.getElementById('inputPromo').value : '';
          const catatan = document.getElementById('inputCatatan') ? document.getElementById('inputCatatan').value : '';
          
          if(!nama || !harga) {
              alert('Harap isi Nama Pesaing dan Harga!');
              return;
          }
          
          const d = new Date();
          const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
          const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
          
          const newData = {
              id: 'market_' + Date.now(),
              nama,
              varian,
              harga,
              promo,
              catatan,
              date: dateStr,
              badge: 'badge-blue'
          };
          
          marketData.unshift(newData);
          localStorage.setItem('market_data', JSON.stringify(marketData));
          renderMarketTable();
          
          // Update success view
          if(document.getElementById('successNamaPesaing')) document.getElementById('successNamaPesaing').textContent = nama;
          if(document.getElementById('successVarian')) document.getElementById('successVarian').textContent = varian || '-';
          if(document.getElementById('successHarga')) document.getElementById('successHarga').textContent = formatRupiah(harga);
          if(document.getElementById('successPromo')) document.getElementById('successPromo').textContent = promo || '-';
          if(document.getElementById('successCatatan')) document.getElementById('successCatatan').textContent = catatan || '-';
          
          showView(marketSuccessView);
      });
    }
    if (btnSuccessAddMore) {
      btnSuccessAddMore.addEventListener('click', () => {
          const inputs = ['inputNamaPesaing', 'inputVarian', 'inputHarga', 'inputPromo', 'inputCatatan'];
          inputs.forEach(id => {
              const el = document.getElementById(id);
              if(el) el.value = '';
          });
          showView(marketAddFormView);
      });
    }
    if (btnSuccessViewAll) {
      btnSuccessViewAll.addEventListener('click', () => showView(marketDashboardView));
    }
    if (btnSuccessNextPage) {
      btnSuccessNextPage.addEventListener('click', () => showView(marketDashboardView));
    }

    // --- FILTER SORTING LOGIC ---
    const btnApplyMarketFilter = document.getElementById('btnApplyMarketFilter');
    const sortFilterSelect = document.getElementById('sortFilterSelect');
    /* duplicate removed */
    /* duplicate removed */
    const btnClearMarketFilter = document.getElementById('btnClearMarketFilter');

    // Toggle Filter Popup
    if (btnFilterToggle) {
        btnFilterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterPopup.style.display = filterPopup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Hide popup when clicking outside
    document.addEventListener('click', (e) => {
        if (filterPopup && filterPopup.style.display === 'block' && !filterPopup.contains(e.target) && e.target !== btnFilterToggle) {
            filterPopup.style.display = 'none';
        }
    });

    if (btnApplyMarketFilter && sortFilterSelect) {
        btnApplyMarketFilter.addEventListener('click', () => {
            const sortVal = sortFilterSelect.value;
            
            marketData.sort((a, b) => {
                let idA = parseInt(a.id.replace(/[^0-9]/g, '')) || 0;
                let idB = parseInt(b.id.replace(/[^0-9]/g, '')) || 0;
                if (sortVal === 'terbaru') {
                    return idB - idA;
                } else {
                    return idA - idB;
                }
            });
            
            renderMarketTable();
            btnFilterToggle.innerHTML = `Urut: ${sortVal === 'terbaru' ? 'Terbaru' : 'Terlama'} <i class='bx bx-chevron-down'></i>`;
            filterPopup.style.display = 'none';
            if(typeof showToast === 'function') showToast('Filter diterapkan!', '#059669');
        });
    }

    if (btnClearMarketFilter) {
        btnClearMarketFilter.addEventListener('click', () => {
            filterPopup.style.display = 'none';
        });
    }

});

