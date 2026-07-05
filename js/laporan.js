const LOGIN_PAGE = 'signin.html';

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name')
  );
}

// applySelectedCustomer logic removed

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
      window.location.href = LOGIN_PAGE;
      return;
    }

    // 1. Tampilkan Nama User
    const userName =
      localStorage.getItem('user_name') ||
      sessionStorage.getItem('user_name') ||
      'Nilam';
    document.getElementById('userNameDisplay').textContent = userName;

    // Sales logic removed
  
    // 5. Fitur Logout 
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

    // --- LAPORAN BUTTON ACTIONS ---
    const btnResetFilter = document.getElementById('btnResetFilter');
    const btnGenerateReport = document.getElementById('btnGenerateReport');
    const dlPdfBtn = document.getElementById('dlPdfBtn');
    const dlExcelBtn = document.getElementById('dlExcelBtn');
    
    function showToast(message, bgColor) {
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.background = bgColor || '#333';
      toast.style.color = '#fff';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.zIndex = '9999';
      toast.style.fontFamily = 'var(--font-family, sans-serif)';
      toast.style.fontSize = '14px';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      toast.textContent = message;

      document.body.appendChild(toast);

      setTimeout(function() {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      }, 10);

      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(function() {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
    }
    
    function formatDate(ms) {
        const d = new Date(ms);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return String(d.getDate()).padStart(2, '0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    if (btnResetFilter) {
      btnResetFilter.addEventListener('click', () => {
        // Clear forms
        document.querySelectorAll('.laporan-filter-card .form-input').forEach(input => {
          if (input.tagName.toLowerCase() === 'select') input.selectedIndex = 0;
          else if (input.type === 'date') {
            if (input.id === 'inputDateFrom') input.value = '2026-04-01';
            else if (input.id === 'inputDateTo') input.value = '2026-04-30';
          } else input.value = '';
        });
        
        // Remove processed sales_orders
        let salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
        salesOrders = salesOrders.filter(so => so.status !== 'processed');
        localStorage.setItem('sales_orders', JSON.stringify(salesOrders));
        
        showToast('Data Sales Order tervalidasi telah di-reset (dihapus).', '#ef4444');
        
        // Clear table
        const tbody = document.getElementById('repTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 20px;">Data kosong. Silakan generate laporan ulang atau buat Sales Order baru.</td></tr>';
        }
        document.getElementById('repTotalSO').textContent = '-';
        document.getElementById('repTotalNilai').textContent = 'Rp 0';
        document.getElementById('repRataRata').textContent = 'Rp 0';
        document.getElementById('repValid').textContent = '0%';
        document.getElementById('repTotalTransaksi').textContent = '0 dari 0 transaksi';
        document.getElementById('repTotalNilaiBawah').textContent = 'Rp 0';
      });
    }

    if (btnGenerateReport) {
      btnGenerateReport.addEventListener('click', () => {
        const tbody = document.getElementById('repTableBody');
        if (!tbody) return;
        
        let salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
        let processedOrders = salesOrders.filter(so => so.status === 'processed');
        
        const selectedVarian = document.getElementById('filterVarian') ? document.getElementById('filterVarian').value : 'Semua Varian';
        
        if (selectedVarian !== 'Semua Varian') {
            processedOrders = processedOrders.filter(so => {
                return so.products && so.products.some(p => p.quantity > 0 && p.name === selectedVarian);
            });
        }
        
        tbody.innerHTML = '';
        
        if (processedOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 20px;">Tidak ada data laporan untuk filter tersebut.</td></tr>';
            document.getElementById('repTotalSO').textContent = '0';
            document.getElementById('repTotalNilai').textContent = 'Rp 0';
            document.getElementById('repRataRata').textContent = 'Rp 0';
            document.getElementById('repValid').textContent = '0%';
            document.getElementById('repTotalTransaksi').textContent = '0 dari 0 transaksi';
            document.getElementById('repTotalNilaiBawah').textContent = 'Rp 0';
            return;
        }
        
        let totalNilai = 0;
        let totalProfit = 0;
        
        processedOrders.forEach(so => {
            if (so.products) {
                so.products.forEach(p => {
                    if (p.quantity > 0) {
                        if (selectedVarian === 'Semua Varian' || p.name === selectedVarian) {
                            const tr = document.createElement('tr');
                            
                            let itemTotal = p.subtotal || (p.price * p.quantity) || 0;
                            let itemProfit = itemTotal * 0.10; // 10% profit
                            totalNilai += itemTotal;
                            totalProfit += itemProfit;
                            
                            let itemId = p.id || so.soNumber || '-';
                            let itemName = p.name || 'Produk';
                            let itemQty = p.quantity || 0;
                            let itemJenis = p.category || 'Barang Jadi';
                            
                            tr.innerHTML = `
                              <td>${itemId}</td>
                              <td>${itemName}</td>
                              <td>${itemQty}</td>
                              <td>${itemJenis}</td>
                              <td style="text-align: right;">${formatRupiah(itemTotal)}</td>
                              <td style="text-align: right; color: #059669; font-weight: bold;">+${formatRupiah(itemProfit)}</td>
                            `;
                            tbody.appendChild(tr);
                        }
                    }
                });
            }
        });
        
        const count = processedOrders.length;
        const rataRata = count > 0 ? Math.round(totalNilai / count) : 0;
        let totalNilaiStr = formatRupiah(totalNilai);
        
        // Format for millions if needed
        let formattedTotal = totalNilai >= 1000000 ? 'Rp ' + (totalNilai / 1000000).toFixed(1) + 'M' : 'Rp ' + totalNilaiStr;
        let formattedRata = rataRata >= 1000000 ? 'Rp ' + (rataRata / 1000000).toFixed(1) + ' jt' : 'Rp ' + formatRupiah(rataRata);
        
        document.getElementById('repTotalSO').textContent = count;
        document.getElementById('repTotalNilai').textContent = formattedTotal;
        document.getElementById('repRataRata').textContent = formattedRata;
        document.getElementById('repValid').textContent = '100%';
        
        document.getElementById('repTotalTransaksi').textContent = count + ' dari ' + count + ' transaksi';
        document.getElementById('repTotalNilaiBawah').textContent = 'Rp ' + totalNilaiStr;

        const btnSendToFinance = document.getElementById('btnSendToFinance');
        if (btnSendToFinance) {
            btnSendToFinance.style.display = 'inline-block';
            btnSendToFinance.dataset.total = totalNilai;
            btnSendToFinance.dataset.profit = totalProfit;
            btnSendToFinance.dataset.count = count;
            window.currentReportOrders = processedOrders;
        }

        
        showToast('Laporan Penjualan berhasil di-generate!', '#22c55e');
      });
    }

    
    const btnSendToFinance = document.getElementById('btnSendToFinance');
    if (btnSendToFinance) {
      btnSendToFinance.addEventListener('click', () => {
        let total = parseInt(btnSendToFinance.dataset.total) || 0;
        let profit = parseInt(btnSendToFinance.dataset.profit) || 0;
        let count = parseInt(btnSendToFinance.dataset.count) || 0;
        
        if (total <= 0) {
            showToast('Laporan tidak memiliki nilai penjualan!', '#ef4444');
            return;
        }
        
        let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
        const todayStr = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        
        drafts.push({
            id: 'DRAFT-' + Date.now(),
            date: todayStr,
            sumber: 'Sales & Marketing',
            keterangan: 'Laporan Penjualan Otomatis (' + count + ' Transaksi)',
            nominal: total,
            keuntungan: profit,
            orders: window.currentReportOrders || []
        });
        
        localStorage.setItem('erp_finance_income_drafts', JSON.stringify(drafts));
        
        if (typeof window.sendNotification === 'function') {
            window.sendNotification('finance', 'Laporan Penjualan', 'Tim Sales & Marketing telah mengirimkan laporan penjualan baru sejumlah Rp ' + total.toLocaleString('id-ID'));
        }
        
        showToast('Laporan dikirim ke Finance sebagai Draft!', '#059669');
        btnSendToFinance.style.display = 'none'; // Sembunyikan setelah dikirim agar tidak dobel
      });
    }

    if (dlPdfBtn) {
      dlPdfBtn.addEventListener('click', () => {
        showToast('Menyiapkan dokumen PDF...', '#3b82f6');
        setTimeout(() => {
          window.print();
        }, 800);
      });
    }

    if (dlExcelBtn) {
      dlExcelBtn.addEventListener('click', () => {
        const tbody = document.getElementById('repTableBody');
        if (!tbody || tbody.querySelectorAll('tr td[colspan]').length > 0) {
            showToast('Silakan generate laporan terlebih dahulu', '#ef4444');
            return;
        }
        
        showToast('Mengunduh Laporan_Penjualan_Apr2026.csv...', '#16a34a');
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Nama Item,Quantity,Jenis,Harga (Rp),Keuntungan (10%)\n";
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            let rowData = [];
            row.querySelectorAll('td').forEach(col => {
                let text = col.textContent.replace(/"/g, '""');
                rowData.push('"' + text + '"');
            });
            csvContent += rowData.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Laporan_Penjualan_Apr2026.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
      settingsPopup.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

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
  });