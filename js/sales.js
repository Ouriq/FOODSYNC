


const LOGIN_PAGE = 'signin.html';

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name')
  );
}

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

function applySelectedCustomer() {
  const raw = sessionStorage.getItem('selectedCustomer');
  const banner = document.querySelector('.customer-banner');
  
  if (!raw) {
    if (banner) {
      banner.querySelector('.avatar-circle').textContent = '?';
      banner.querySelector('.customer-details h4').textContent = 'Pilih Pelanggan Terlebih Dahulu';
      banner.querySelector('.customer-details p').textContent = 'Silakan ke menu Manajemen Pelanggan untuk memilih distributor/pelanggan.';
      const tierBadge = banner.querySelector('.tier-badge');
      if (tierBadge) tierBadge.style.display = 'none';
    }
    // Set all default quantities to 0 if no customer is selected
    document.querySelectorAll('.input-qty').forEach(input => {
      input.value = 0;
    });
    setTimeout(() => { if (typeof updateOrderSummary === 'function') updateOrderSummary(); }, 100);
    return;
  }

  try {
    const customer = JSON.parse(raw);
    if (!banner) return;

    const initials = (customer.nama || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function(w) { return w[0]; })
      .join('')
      .toUpperCase() || '\u2014';

    banner.querySelector('.avatar-circle').textContent = initials;
    banner.querySelector('.customer-details h4').textContent = customer.nama || '\u2014';
    banner.querySelector('.customer-details p').innerHTML =
      'ID: ' + (customer.id || '\u2014') + ' <span class="divider-dot">\u2022</span> ' + (customer.pic || '\u2014') + ' (' + (customer.telp || '\u2014') + ')';
    banner.querySelector('.tier-badge').textContent =
      (customer.tier || '?') + ' Tier';

    // Load Draft if exists
    let salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
    let draftSO = salesOrders.find(so => so.status === 'draft' && (so.customer.id === customer.id || so.customer.id === customer.idDist));
    if (draftSO) {
        document.querySelectorAll('.product-item').forEach(item => {
            const prodName = item.querySelector('h4').textContent.trim();
            const draftProd = draftSO.products.find(p => p.name === prodName);
            if (draftProd) {
                item.querySelector('.input-qty').value = draftProd.quantity;
            }
        });
        showToast("Draft pesanan sebelumnya berhasil dimuat!", "#3b82f6");
    }

    // Filter products based on customer kategori
    const allowedCategories = (customer.kategori || '').split(',').map(function(s) { return s.trim().toLowerCase(); });
    const productItems = document.querySelectorAll('.product-item');
    
    productItems.forEach(function(item) {
      const prodName = item.querySelector('h4').textContent.trim().toLowerCase();
      
      let normalizedName = prodName;
      if (prodName.includes('kuah soto')) {
        normalizedName = 'indomie soto';
      }
      
      if (allowedCategories.length === 0 || allowedCategories[0] === '' || allowedCategories.includes(normalizedName) || allowedCategories.includes(prodName)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

  } catch (err) {
    /* abaikan data rusak */
  }
}

document.addEventListener("DOMContentLoaded", function() {
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

  applySelectedCustomer();

  // 2. Fungsi Format Uang (IDR)
  const formatRupiah = function(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka).replace('Rp', 'Rp ');
  };

  // 3. Logika Kalkulator Sales Order
  window.updateOrderSummary = function() {
    let subtotal = 0;
    let totalItems = 0;
    let discountRate = 0;
    let tierText = "Reguler (0%)";
    const rawCust = sessionStorage.getItem('selectedCustomer');
    if (rawCust) {
      try {
        const cust = JSON.parse(rawCust);
        const t = (cust.tier || '').toLowerCase();
        if (t === 'silver') { discountRate = 0.025; tierText = 'Silver Member (2.5%)'; }
        else if (t === 'gold') { discountRate = 0.036; tierText = 'Gold Member (3.6%)'; }
        else if (t === 'platinum') { discountRate = 0.05; tierText = 'Platinum Member (5%)'; }
      } catch (e) {}
    }
    const ppnRate = 0.11;

    document.querySelectorAll('.product-item').forEach(function(item) {
      if (item.style.display === 'none') return;
      
      const price = parseInt(item.getAttribute('data-price')) || 0;
      const qtyInput = item.querySelector('.input-qty');
      const qty = parseInt(qtyInput.value) || 0;
      
      const itemSubtotal = price * qty;
      item.querySelector('.prod-subtotal').textContent = formatRupiah(itemSubtotal);
      
      subtotal += itemSubtotal;
      if (qty > 0) totalItems += 1;
    });

    const discountAmount = subtotal * discountRate;
    const ppnAmount = (subtotal - discountAmount) * ppnRate;
    const grandTotal = subtotal - discountAmount + ppnAmount;

    document.getElementById('labelItemCount').textContent = 'Subtotal (' + totalItems + ' Item)';
    document.getElementById('valSubtotal').textContent = formatRupiah(subtotal);
    document.getElementById('valDiscount').textContent = '-' + formatRupiah(discountAmount);
    const discDesc = document.querySelector('.disc-desc');
    if (discDesc) discDesc.textContent = tierText;
    document.getElementById('valPpn').textContent = formatRupiah(ppnAmount);
    
    const grandTotalFormatted = formatRupiah(grandTotal).replace('Rp', 'RP');
    document.getElementById('valGrandTotal').textContent = grandTotalFormatted;
  };

  // 4. Event Listener untuk Tombol + dan -
  document.querySelectorAll('.qty-stepper').forEach(function(stepper) {
    const btnMin = stepper.querySelector('.btn-min');
    const btnPlus = stepper.querySelector('.btn-plus');
    const input = stepper.querySelector('.input-qty');

    btnMin.addEventListener('click', function() {
      let currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateOrderSummary();
      }
    });

    btnPlus.addEventListener('click', function() {
      let currentValue = parseInt(input.value);
      input.value = currentValue + 1;
      updateOrderSummary();
    });
  });

  updateOrderSummary();

  // 5. Fitur Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      ['auth_token', 'user_name', 'user_email'].forEach(function(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      sessionStorage.removeItem('selectedCustomer');
      window.location.href = LOGIN_PAGE;
    });
  }

  // --- POPUP LOGIC ---
  const btnSettingsToggle = document.getElementById('btnSettingsToggle');
  const settingsPopup = document.getElementById('settingsPopup');
  const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
  const btnNotifToggle = document.getElementById('btnNotifToggle');
  const notifPopup = document.getElementById('notifPopup');
  const settingsItemNotif = document.getElementById('settingsItemNotif');

  function closeAllPopups() {
    if (settingsPopup) settingsPopup.classList.remove('show');
    if (notifPopup) notifPopup.classList.remove('show');
    const filterPopup = document.getElementById('filterPopup');
    if (filterPopup) filterPopup.classList.remove('show');
  }

  if (btnSettingsToggle && settingsPopup) {
    btnSettingsToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isShowing = settingsPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) settingsPopup.classList.add('show');
    });
  }

  if (settingsPopup) {
    settingsPopup.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  window.addEventListener('click', function() {
    closeAllPopups();
  });

  if (btnNotifToggle && notifPopup) {
    btnNotifToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isShowing = notifPopup.classList.contains('show');
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

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', function() {
      ['auth_token', 'user_name', 'user_email'].forEach(function(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      sessionStorage.removeItem('selectedCustomer');
      window.location.href = LOGIN_PAGE;
    });
  }

  // User photo
  const userPhoto = localStorage.getItem('user_photo');
  if (userPhoto) {
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(function(av) {
      av.innerHTML = "<img src='" + userPhoto + "' style='width:100%; height:100%; border-radius:50%; object-fit:cover;'>";
    });
  }

  // ==========================================
  // BACKEND INTEGRATION LOGIC
  // ==========================================

  function getOrderData() {
    const raw = sessionStorage.getItem('selectedCustomer');
    let customer = {};
    try { if (raw) customer = JSON.parse(raw); } catch (e) {}
    
    const products = [];
    document.querySelectorAll('.product-item').forEach(function(item) {
      if (item.style.display === 'none') return;
      const qty = parseInt(item.querySelector('.input-qty').value) || 0;
      if (qty > 0) {
        products.push({
          name: item.querySelector('h4').textContent.trim(),
          sku: item.querySelector('.sku').textContent.trim(),
          price: parseInt(item.getAttribute('data-price')) || 0,
          quantity: qty,
          subtotal: (parseInt(item.getAttribute('data-price')) || 0) * qty
        });
      }
    });
    
    return {
      customer: customer,
      products: products,
      subtotal: document.getElementById('valSubtotal').textContent.trim(),
      discount: document.getElementById('valDiscount').textContent.trim(),
      ppn: document.getElementById('valPpn').textContent.trim(),
      grandTotal: document.getElementById('valGrandTotal').textContent.trim()
    };
  }

  
  // Update subtotal when typing in input
  document.querySelectorAll('.input-qty').forEach(function(input) {
    input.addEventListener('input', function() {
      let val = parseInt(this.value) || 0;
      const max = parseInt(this.getAttribute('max')) || Infinity;
      if (val > max) {
        val = max;
        this.value = max;
        showToast("Maksimal stok yang tersedia: " + max, "#f59e0b");
      }
      if (val < 0) {
        val = 0;
        this.value = 0;
      }
      updateSubtotal(this);
    });
  });

  // Button Proses & Validasi SO
  const btnProsesSO = document.getElementById('btnProsesSO');
  if (btnProsesSO) {
    btnProsesSO.addEventListener('click', async function() {
      const orderData = getOrderData();
      if (orderData.products.length === 0) {
        showToast("Mohon pilih minimal 1 produk", "#ef4444");
        return;
      }
      
      btnProsesSO.disabled = true;
      btnProsesSO.textContent = "Memproses...";
      
      try {
        // Cek apakah perusahaan ini sudah pernah melakukan pemesanan sebelumnya
        let salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
        
        let custId = orderData.customer?.id || orderData.customer?.idDist || orderData.customer?.nama;
        let hasOrdered = salesOrders.some(so => {
            let soId = so.customer?.id || so.customer?.idDist || so.customer?.nama;
            return so.status === 'processed' && soId === custId && !!custId;
        });


        if (hasOrdered) {
            showToast("Perusahaan ini sudah pernah membuat pesanan! 1 Perusahaan maksimal 1 Pesanan.", "#ef4444");
            btnProsesSO.disabled = false;
            btnProsesSO.textContent = "Proses & Validasi SO";
            return;
        }

        const now = new Date();
        const soNumber = 'SO-' + now.getFullYear().toString().slice(2) + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + String(Math.floor(Math.random()*900)+100);

        // Remove any draft for this customer since it's now processed
        salesOrders = salesOrders.filter(so => !(so.status === 'draft' && so.customer?.id === orderData.customer?.id));
        salesOrders.push({
          soNumber: soNumber,
          customer: orderData.customer,
          products: orderData.products,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          ppn: orderData.ppn,
          grandTotal: orderData.grandTotal,
          status: 'processed',
          createdAt: Date.now()
        });
        localStorage.setItem('sales_orders', JSON.stringify(salesOrders));
        // --- INVENTORY DEDUCTION LOGIC ---
        if (typeof getInventoryStock === 'function' && typeof updateInventoryStock === 'function') {
            const currentStocks = getInventoryStock();
            orderData.products.forEach(p => {
                const pSku = p.sku.replace(/\s+/g, ""); const dbItem = currentStocks.find(s => s.sku.replace(/\s+/g, "") === pSku);
                if (dbItem) {
                    const newStock = Math.max(0, dbItem.stock - p.quantity);
                    updateInventoryStock(p.sku, newStock);
                }
            });
        }
        // ---------------------------------

        
        // Also create a notification for processed SO
        const custName = orderData.customer.nama || "Pelanggan";
        let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.push({
          title: "Sales Order Divalidasi",
          message: "Pesanan untuk " + custName + " telah diproses & divalidasi.",
          type: "processed",
          isRead: false,
          createdAt: Date.now()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        if(window.renderNotifications) window.renderNotifications();
        
        showToast("Sales Order berhasil divalidasi!", "#22c55e");

        // Clear cart
        document.querySelectorAll('.input-qty').forEach(function(input) {
            input.value = 0;
        });
        updateOrderSummary();

      } catch (err) {
        console.error("Error saving SO:", err);
        showToast("Gagal memproses Sales Order", "#ef4444");
      } finally {
        btnProsesSO.disabled = false;
        btnProsesSO.textContent = "Proses & Validasi SO";
      }
    });
  }

  // Button Simpan Draft
  const btnDraftSO = document.getElementById('btnDraftSO');
  if (btnDraftSO) {
    btnDraftSO.addEventListener('click', async function() {
      const orderData = getOrderData();
      
      btnDraftSO.disabled = true;
      btnDraftSO.textContent = "Menyimpan...";
      
      try {
        const now = new Date();
        const soNumber = 'SO-' + now.getFullYear().toString().slice(2) + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + String(Math.floor(Math.random()*900)+100);

        let salesOrdersDraft = JSON.parse(localStorage.getItem('sales_orders') || '[]');
        
        let hasOrdered = salesOrdersDraft.some(so => so.status === 'processed' && so.customer?.id && so.customer?.id === orderData.customer?.id);
        if (hasOrdered) {
            showToast("Perusahaan ini sudah diproses dan divalidasi! Tidak bisa di-draft lagi.", "#ef4444");
            btnDraftSO.disabled = false;
            btnDraftSO.textContent = "Simpan Draft";
            return;
        }

        // Remove existing draft for this customer if any
        salesOrdersDraft = salesOrdersDraft.filter(so => !(so.status === 'draft' && so.customer?.id === orderData.customer?.id));
        salesOrdersDraft.push({
          soNumber: soNumber,
          customer: orderData.customer,
          products: orderData.products,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          ppn: orderData.ppn,
          grandTotal: orderData.grandTotal,
          status: 'draft',
          createdAt: Date.now()
        });
        localStorage.setItem('sales_orders', JSON.stringify(salesOrdersDraft));
        
        // Generate notification
        const custName = orderData.customer.nama || "Pelanggan";
        let notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifs.push({
          title: "Draft Pesanan Disimpan",
          message: "Draft pesanan untuk " + custName + " berhasil disimpan.",
          type: "draft",
          isRead: false,
          createdAt: Date.now()
        });
        localStorage.setItem('notifications', JSON.stringify(notifs));
        if(window.renderNotifications) window.renderNotifications();
        
        showToast("Draft berhasil disimpan", "#3b82f6");
      } catch (err) {
        console.error("Error saving draft:", err);
        showToast("Gagal menyimpan draft", "#ef4444");
      } finally {
        btnDraftSO.disabled = false;
        btnDraftSO.textContent = "Simpan Draft";
      }
    });
  }

  // Button PDF — Generate Invoice/Receipt Style
  const btnDownloadPDF = document.getElementById('btnDownloadPDF');
  if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener('click', function() {
      const orderData = getOrderData();
      if (orderData.products.length === 0) {
        showToast("Tidak ada produk untuk dicetak", "#ef4444");
        return;
      }
      
      const cust = orderData.customer;
      const custName = cust.nama || 'Unknown';
      const now = new Date();
      const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const soNumber = 'SO-' + now.getFullYear().toString().slice(2) + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + String(Math.floor(Math.random()*900)+100);

      // Build product rows
      let productRows = '';
      let no = 1;
      orderData.products.forEach(function(p) {
        productRows += '<tr>' +
          '<td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center; color:#374151;">' + no + '</td>' +
          '<td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;"><strong style="color:#111827;">' + p.name + '</strong><br><span style="font-size:11px; color:#6b7280;">' + p.sku + '</span></td>' +
          '<td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right; color:#374151;">' + formatRupiah(p.price) + '</td>' +
          '<td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center; color:#374151;">' + p.quantity + '</td>' +
          '<td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right; font-weight:600; color:#111827;">' + formatRupiah(p.subtotal) + '</td>' +
          '</tr>';
        no++;
      });
      
      const invoiceHTML = '' +
        '<div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 0; color: #1f2937;">' +
        
        // Header
        '<div style="background: linear-gradient(135deg, #0A3A82, #1e5bb5); padding: 28px 32px; border-radius: 0; color: white;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<div>' +
              '<h1 style="margin:0; font-size:26px; font-weight:800; letter-spacing:0.5px;">FoodSync</h1>' +
              '<p style="margin:4px 0 0; font-size:12px; opacity:0.85;">PT FoodSync Indonesia</p>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<h2 style="margin:0; font-size:20px; font-weight:700; letter-spacing:1px;">INVOICE</h2>' +
              '<p style="margin:4px 0 0; font-size:12px; opacity:0.85;">Sales Order</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
        // Info Bar
        '<div style="background:#f0f4ff; padding:16px 32px; display:flex; justify-content:space-between; border-bottom:2px solid #0A3A82;">' +
          '<div>' +
            '<span style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">No. Invoice</span><br>' +
            '<strong style="font-size:14px; color:#0A3A82;">' + soNumber + '</strong>' +
          '</div>' +
          '<div style="text-align:center;">' +
            '<span style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">Tanggal</span><br>' +
            '<strong style="font-size:14px; color:#0A3A82;">' + tanggal + '</strong>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<span style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">Jam</span><br>' +
            '<strong style="font-size:14px; color:#0A3A82;">' + jam + '</strong>' +
          '</div>' +
        '</div>' +
        
        // Customer Info
        '<div style="padding:20px 32px; display:flex; justify-content:space-between; border-bottom:1px solid #e5e7eb;">' +
          '<div>' +
            '<span style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">Ditagihkan Kepada</span>' +
            '<h3 style="margin:6px 0 2px; font-size:16px; color:#111827;">' + custName + '</h3>' +
            '<p style="margin:0; font-size:13px; color:#6b7280;">ID: ' + (cust.id || '-') + '</p>' +
            '<p style="margin:0; font-size:13px; color:#6b7280;">PIC: ' + (cust.pic || '-') + ' (' + (cust.telp || '-') + ')</p>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<span style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">Tier Pelanggan</span>' +
            '<div style="margin-top:6px; display:inline-block; background:#0A3A82; color:white; padding:4px 14px; border-radius:20px; font-size:13px; font-weight:600;">' + (cust.tier || '-') + ' Tier</div>' +
          '</div>' +
        '</div>' +
        
        // Product Table
        '<div style="padding:20px 32px;">' +
          '<table style="width:100%; border-collapse:collapse; font-size:13px;">' +
            '<thead>' +
              '<tr style="background:#0A3A82; color:white;">' +
                '<th style="padding:10px 12px; text-align:center; font-weight:600; border-radius:6px 0 0 0; width:40px;">No</th>' +
                '<th style="padding:10px 12px; text-align:left; font-weight:600;">Produk</th>' +
                '<th style="padding:10px 12px; text-align:right; font-weight:600;">Harga/Karton</th>' +
                '<th style="padding:10px 12px; text-align:center; font-weight:600; width:60px;">Qty</th>' +
                '<th style="padding:10px 12px; text-align:right; font-weight:600; border-radius:0 6px 0 0;">Subtotal</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + productRows + '</tbody>' +
          '</table>' +
        '</div>' +
        
        // Summary
        '<div style="padding:0 32px 20px;">' +
          '<div style="margin-left:auto; width:280px; border-top:2px solid #e5e7eb; padding-top:12px;">' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; color:#374151;"><span>Subtotal</span><span>' + orderData.subtotal + '</span></div>' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; color:#16a34a;"><span>Diskon Tier (5%)</span><span>' + orderData.discount + '</span></div>' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px; color:#374151;"><span>PPN (11%)</span><span>' + orderData.ppn + '</span></div>' +
            '<div style="display:flex; justify-content:space-between; padding:12px 0; border-top:2px solid #0A3A82; font-size:16px; font-weight:800; color:#0A3A82;"><span>TOTAL</span><span>' + orderData.grandTotal + '</span></div>' +
          '</div>' +
        '</div>' +
        
        // Footer
        '<div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">' +
          '<p style="margin:0; font-size:11px; color:#9ca3af;">Terima kasih atas pesanan Anda. Dokumen ini digenerate secara otomatis oleh sistem FoodSync ERP.</p>' +
          '<p style="margin:4px 0 0; font-size:11px; color:#9ca3af;">PT FoodSync Indonesia &bull; Jl. Industri Raya No. 88 &bull; Jakarta Timur 13920 &bull; (021) 1234-5678</p>' +
        '</div>' +
        
      '</div>';
      
      const container = document.createElement('div');
      container.innerHTML = invoiceHTML;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      const opt = {
        margin:       0,
        filename:     'Invoice_' + soNumber + '_' + custName.replace(/\s+/g, '_') + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, width: 680 },
        jsPDF:        { unit: 'px', format: [680, 960], orientation: 'portrait' }
      };
      
      showToast("Membuat Invoice PDF...", "#3b82f6");
      html2pdf().set(opt).from(container.firstChild).save().then(function() {
        document.body.removeChild(container);
        showToast("Invoice PDF berhasil diunduh!", "#22c55e");
      });
    });
  }

  // Real-time Notifications from Firestore
  const notifList = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge');
  
  if (notifList) {
    window.renderNotifications = function() {
      let notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifs.sort((a, b) => b.createdAt - a.createdAt);
      
      notifList.innerHTML = '';
      let unreadCount = 0;
      
      if (notifs.length === 0) {
        notifList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">Tidak ada notifikasi</div>';
        if (notifBadge) notifBadge.style.display = 'none';
        return;
      }
      
      notifs.forEach(function(data) {
        if (!data.isRead) unreadCount++;
        
        // Format time
        let timeString = "Baru saja";
        if (data.createdAt) {
          const date = new Date(data.createdAt);
          timeString = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }
        
        // Determine icon and color based on type
        let icon = "bx-info-circle";
        let bgColor = "#E0E7FF";
        let fgColor = "#4F46E5";
        
        if (data.type === 'draft') {
          icon = "bx-file-blank";
          bgColor = "#FEF3C7";
          fgColor = "#D97706";
        } else if (data.type === 'processed') {
          icon = "bx-check-circle";
          bgColor = "#DCFCE7";
          fgColor = "#16A34A";
        }
        
        const notifDiv = document.createElement('div');
        notifDiv.className = 'notif-item';
        notifDiv.style.cursor = 'pointer';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'notif-icon';
        iconDiv.style.backgroundColor = bgColor;
        iconDiv.style.color = fgColor;
        iconDiv.innerHTML = "<i class='bx " + icon + "'></i>";
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'notif-content';
        
        const h4 = document.createElement('h4');
        h4.textContent = data.title || 'Notifikasi';
        
        const p = document.createElement('p');
        p.textContent = data.message || '';
        
        const span = document.createElement('span');
        span.className = 'notif-time';
        span.textContent = timeString;
        
        contentDiv.appendChild(h4);
        contentDiv.appendChild(p);
        contentDiv.appendChild(span);
        
        notifDiv.appendChild(iconDiv);
        notifDiv.appendChild(contentDiv);
        
        if (!data.isRead) {
          const dot = document.createElement('div');
          dot.className = 'notif-unread-dot';
          notifDiv.appendChild(dot);
        }
        
        notifDiv.addEventListener('click', function() {
          const dot = notifDiv.querySelector('.notif-unread-dot');
          if (dot) dot.style.display = 'none';
        });
        
        notifList.appendChild(notifDiv);
      });
      
      if (notifBadge) {
        notifBadge.style.display = unreadCount > 0 ? 'block' : 'none';
      }
    }
    if(window.renderNotifications) window.renderNotifications();
  }

  const markAllBtn = document.querySelector('.notif-mark-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.notif-unread-dot').forEach(function(dot) { dot.style.display = 'none'; });
      if (notifBadge) notifBadge.style.display = 'none';
      showToast("Semua notifikasi ditandai dibaca", "#3b82f6");
    });
  }

});

// --- SYNC WITH INVENTORY DB ---
document.addEventListener('DOMContentLoaded', () => {
    function formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(angka).replace('Rp', 'Rp ');
    }

    function renderProductsFromInventory() {
        if (typeof getInventoryStock === 'function') {
            const stocks = getInventoryStock();
            const productList = document.getElementById('productList');
            if (!productList) return;
            
            productList.innerHTML = '';
            const barangJadi = stocks.filter(s => s.type === 'Barang Jadi');
            
            barangJadi.forEach(dbItem => {
                const stock = dbItem.stock || 0;
                const price = dbItem.price || 0;
                const isWarn = stock < 500;
                const statusClass = isWarn ? 'status-warn' : 'status-ok';
                const statusColor = isWarn ? '#EA580C' : '#059669';
                
                // Set default icon if none provided
                let imgSrc = dbItem.img;
                if (!imgSrc) {
                    if (dbItem.name.toLowerCase().includes('goreng')) imgSrc = 'assets/images/gorengicon.png';
                    else if (dbItem.name.toLowerCase().includes('soto')) imgSrc = 'assets/images/sotoicon.png';
                    else imgSrc = 'assets/images/gorengicon.png';
                }

                const itemDiv = document.createElement('div');
                itemDiv.className = 'product-item';
                itemDiv.setAttribute('data-price', price);
                itemDiv.innerHTML = `
                  <div class="col-produk prod-info">
                    <div class="prod-img-wrapper">
                      <img src="${imgSrc}" alt="${dbItem.name}" class="prod-img-raw" onerror="this.src='assets/images/gorengicon.png'">
                    </div>
                    <div>
                      <h4>${dbItem.name}</h4>
                      <p class="sku">${dbItem.sku}</p>
                      <p class="${statusClass}" style="color: ${statusColor}">Tersedia (Stok: ${stock})</p>
                    </div>
                  </div>
                  <div class="col-harga prod-price">
                    <div style="display:flex; align-items:center;">
                      <span style="margin-right:4px;">Rp</span>
                      <input type="number" class="input-price" value="${price}" style="width: 80px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; font-weight: bold; color: #111827; background: #fff;">
                    </div>
                  </div>
                  <div class="col-qty">
                    <div class="qty-stepper">
                      <button class="btn-min"><i class='bx bx-minus'></i></button>
                      <input type="number" class="input-qty" value="0" min="0" max="${stock}">
                      <button class="btn-plus"><i class='bx bx-plus'></i></button>
                    </div>
                  </div>
                  <div class="col-sub prod-subtotal">Rp 0</div>
                `;
                productList.appendChild(itemDiv);
                
                // Bind stepper events for this item
                const stepper = itemDiv.querySelector('.qty-stepper');
                const btnMin = stepper.querySelector('.btn-min');
                const btnPlus = stepper.querySelector('.btn-plus');
                const input = stepper.querySelector('.input-qty');
                
                btnMin.addEventListener('click', function() {
                  let currentValue = parseInt(input.value) || 0;
                  if (currentValue > 0) {
                    input.value = currentValue - 1;
                    if (typeof updateOrderSummary === 'function') updateOrderSummary();
                  }
                });

                btnPlus.addEventListener('click', function() {
                  let currentValue = parseInt(input.value) || 0;
                  if (currentValue < stock) {
                      input.value = currentValue + 1;
                      if (typeof updateOrderSummary === 'function') updateOrderSummary();
                  } else {
                      if(typeof showToast === 'function') showToast("Maksimal stok: " + stock, "#f59e0b");
                  }
                });
                
                input.addEventListener('input', function() {
                  let val = parseInt(this.value) || 0;
                  if (val > stock) {
                    val = stock;
                    this.value = stock;
                    if(typeof showToast === 'function') showToast("Maksimal stok: " + stock, "#f59e0b");
                  }
                  if (val < 0) {
                    val = 0;
                    this.value = 0;
                  }
                  if (typeof updateOrderSummary === 'function') updateOrderSummary();
                });
                
                const priceInput = itemDiv.querySelector('.input-price');
                if (priceInput) {
                    priceInput.addEventListener('input', function() {
                        let newPrice = parseInt(this.value) || 0;
                        itemDiv.setAttribute('data-price', newPrice);
                        if (typeof updateOrderSummary === 'function') updateOrderSummary();
                    });
                    
                    priceInput.addEventListener('change', function() {
                        let newPrice = parseInt(this.value) || 0;
                        let currentStocks = getInventoryStock();
                        let stockItem = currentStocks.find(s => s.sku === dbItem.sku);
                        if (stockItem) {
                            stockItem.price = newPrice;
                            localStorage.setItem('erp_inventory_stock', JSON.stringify(currentStocks));
                        }
                    });
                }
            });
            
            // Re-apply customer filter logic since elements are new
            if (typeof applySelectedCustomer === 'function') applySelectedCustomer();
        }
    }
    
    renderProductsFromInventory();
    
    // Listen for storage events to update real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'erp_inventory_stock') {
            renderProductsFromInventory();
        }
    });
});
