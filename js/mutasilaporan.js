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
      'Admin Gudang';
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.textContent = userName;
  
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        ['auth_token', 'user_name', 'user_email'].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        window.location.href = LOGIN_PAGE;
      });
    }

    // --- MUTASI LAPORAN BUTTON ACTIONS ---
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
      setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
      setTimeout(() => {
        toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      }, 3000);
    }
    
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
    }

    if (btnResetFilter) {
      btnResetFilter.addEventListener('click', () => {
        document.querySelectorAll('.laporan-filter-card .form-input').forEach(input => {
          if (input.tagName.toLowerCase() === 'select') input.selectedIndex = 0;
          else if (input.type === 'date') { /* retain default if any */ }
          else input.value = '';
        });
        
        showToast('Filter laporan telah di-reset.', '#ef4444');
        
        const tbody = document.getElementById('repTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">Silakan klik "Generate Laporan" untuk memuat data mutasi & stok.</td></tr>';
        }
        document.getElementById('repTotalJenis').textContent = '-';
        document.getElementById('repTotalQty').textContent = '0';
        document.getElementById('repTotalAsset').textContent = 'Rp 0';
        document.getElementById('repValid').textContent = '0%';
        document.getElementById('repTotalTransaksi').textContent = '0 dari 0 Item';
        document.getElementById('repTotalNilaiBawah').textContent = 'Rp 0';
      });
    }

    if (btnGenerateReport) {
      btnGenerateReport.addEventListener('click', () => {
        const tbody = document.getElementById('repTableBody');
        if (!tbody) return;
        
        let inventoryData = JSON.parse(localStorage.getItem('erp_inventory_stock') || '[]');
        
        const selectedKategori = document.getElementById('filterKategori') ? document.getElementById('filterKategori').value : 'Semua Kategori';
        const selectedStatus = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : 'Semua Status';
        
        let filteredData = inventoryData.filter(item => {
            let catMatch = (selectedKategori === 'Semua Kategori' || item.type === selectedKategori);
            
            let itemStatus = 'Aman';
            if (item.stock === 0) itemStatus = 'Habis';
            else if (item.stock < 100) itemStatus = 'Menipis'; // Assume < 100 is Menipis for this UI
            
            let statusMatch = (selectedStatus === 'Semua Status' || itemStatus === selectedStatus);
            
            return catMatch && statusMatch;
        });
        
        tbody.innerHTML = '';
        
        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">Tidak ada data stok untuk filter tersebut.</td></tr>';
            return;
        }
        
        let totalJenis = 0;
        let totalFisik = 0;
        let totalAsset = 0;
        let stokAmanCount = 0;
        
        filteredData.forEach(item => {
            const tr = document.createElement('tr');
            
            let itemPrice = item.price || 0;
            let itemAsset = item.stock * itemPrice;
            
            totalJenis++;
            totalFisik += item.stock;
            totalAsset += itemAsset;
            
            if (item.stock > 0) stokAmanCount++;
            
            tr.innerHTML = `
              <td>${item.sku || item.id || '-'}</td>
              <td>${item.name || 'Produk'}</td>
              <td>${item.stock || 0} ${item.unit || ''}</td>
              <td>${item.type || 'Barang Jadi'}</td>
              <td style="text-align: right;">${formatRupiah(itemPrice)}</td>
            `;
            tbody.appendChild(tr);
        });
        
        let totalAssetStr = formatRupiah(totalAsset);
        let formattedAsset = totalAsset >= 1000000 ? 'Rp ' + (totalAsset / 1000000).toFixed(1) + 'M' : 'Rp ' + totalAssetStr;
        let pAman = totalJenis > 0 ? Math.round((stokAmanCount / totalJenis) * 100) : 0;
        
        document.getElementById('repTotalJenis').textContent = totalJenis;
        document.getElementById('repTotalQty').textContent = formatRupiah(totalFisik);
        document.getElementById('repTotalAsset').textContent = formattedAsset;
        document.getElementById('repValid').textContent = pAman + '%';
        
        document.getElementById('repTotalTransaksi').textContent = totalJenis + ' dari ' + inventoryData.length + ' Item (Global)';
        document.getElementById('repTotalNilaiBawah').textContent = 'Rp ' + totalAssetStr;
        
        const detKategori = document.getElementById('detKategori');
        if(detKategori) detKategori.textContent = selectedKategori;
        const detStatus = document.getElementById('detStatus');
        if(detStatus) detStatus.textContent = selectedStatus;

        showToast('Laporan Inventory berhasil di-generate!', '#22c55e');
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
        
        showToast('Mengunduh Laporan_Inventory_Mutasi.csv...', '#16a34a');
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID/SKU,Nama Item,Quantity (Fisik),Jenis/Kategori,Harga (Rp)\\n";
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            let rowData = [];
            row.querySelectorAll('td').forEach(col => {
                let text = col.textContent.replace(/"/g, '""');
                rowData.push('"' + text + '"');
            });
            csvContent += rowData.join(",") + "\\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Laporan_Inventory_Mutasi.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
    
    const btnSettingsToggle = document.getElementById('btnSettingsToggle');
    const settingsPopup = document.getElementById('settingsPopup');
    if (btnSettingsToggle && settingsPopup) {
      btnSettingsToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const isShowing = settingsPopup.classList.contains('show');
        if (!isShowing) settingsPopup.classList.add('show');
        else settingsPopup.classList.remove('show');
      });
    }
});
