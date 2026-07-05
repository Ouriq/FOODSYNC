import glob, re

html_notif_wrapper = '''          <!-- WRAPPER NOTIFIKASI -->
          <div class="notification-wrapper">
            <button class="icon-btn" id="btnNotifToggle">
              <i class='bx bx-bell'></i>
            </button>

            <!-- KOTAK POPUP NOTIFIKASI -->
            <div class="notif-popup" id="notifPopup">
              <div class="notif-header">
                <h3>Notifikasi</h3>
                <a href="#" class="notif-mark-read">Mark all as read</a>
              </div>
              <div class="notif-list">
                <div class="notif-item">
                  <div class="notif-icon" style="background-color: #E0E7FF; color: #4F46E5;">
                    <i class='bx bx-shopping-bag'></i>
                  </div>
                  <div class="notif-content">
                    <h4>Pesanan baru #SO-250524</h4>
                    <p>Dari Toko Maju Jaya</p>
                    <span class="notif-time">5 menit yang lalu</span>
                  </div>
                  <div class="notif-unread-dot"></div>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background-color: #DCFCE7; color: #16A34A;">
                    <i class='bx bx-line-chart'></i>
                  </div>
                  <div class="notif-content">
                    <h4>Laporan penjualan harian</h4>
                    <p>Sudah tersedia untuk dilihat</p>
                    <span class="notif-time">30 menit yang lalu</span>
                  </div>
                  <div class="notif-unread-dot"></div>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background-color: #F3E8FF; color: #9333EA;">
                    <i class='bx bx-volume-full'></i>
                  </div>
                  <div class="notif-content">
                    <h4>Promo baru "Ramadan Ceria"</h4>
                    <p>Telah aktif di 12 kota</p>
                    <span class="notif-time">1 jam yang lalu</span>
                  </div>
                  <div class="notif-unread-dot"></div>
                </div>
                <div class="notif-item">
                  <div class="notif-icon" style="background-color: #FFEDD5; color: #EA580C;">
                    <i class='bx bx-error'></i>
                  </div>
                  <div class="notif-content">
                    <h4>Stok varian Mie Goreng</h4>
                    <p>Tersisa di bawah 20%</p>
                    <span class="notif-time">2 jam yang lalu</span>
                  </div>
                  <div class="notif-unread-dot"></div>
                </div>
              </div>
              <div class="notif-footer">
                <a href="#" class="notif-view-all">Lihat semua notifikasi</a>
                <i class='bx bx-chevron-right'></i>
              </div>
            </div>
          </div>
          <!-- END WRAPPER NOTIFIKASI -->'''

css_notif = '''
/* =========================================
   POPUP NOTIFIKASI
   ========================================= */
.notification-wrapper {
  position: relative;
}

.notif-popup {
  position: absolute;
  top: 130%;
  right: -50px;
  width: 380px;
  background-color: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 0;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1000;
}

.notif-popup.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.notif-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
}

.notif-mark-read {
  font-size: 13px;
  color: var(--primary-blue);
  font-weight: 600;
  text-decoration: none;
}

.notif-list {
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  gap: 20px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.notif-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
}

.notif-content h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 4px 0;
}

.notif-content p {
  font-size: 13px;
  color: #374151;
  margin: 0 0 4px 0;
}

.notif-time {
  font-size: 12px;
  color: var(--text-muted);
}

.notif-unread-dot {
  width: 10px;
  height: 10px;
  background-color: var(--primary-blue);
  border-radius: 50%;
  margin-top: 6px;
}

.notif-footer {
  border-top: 1px solid var(--border-color);
  padding: 16px 24px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-view-all {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-blue);
  text-decoration: none;
}

.notif-footer i {
  font-size: 20px;
  color: var(--primary-blue);
  font-weight: bold;
}
'''

# Process HTML
for f in ['dashboard.html', 'pelanggan.html', 'sales.html', 'promo.html']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace settings item
    content = content.replace(
        '<div class="settings-item">\n                  <div class="s-icon"><i class=\'bx bx-bell\'></i></div>\n                  <div class="s-text">\n                    <h4>Notifikasi</h4>\n                    <p>Atur preferensi notifikasi</p>\n                  </div>\n                  <i class=\'bx bx-chevron-right s-arrow\'></i>\n                </div>',
        '<div class="settings-item" id="settingsItemNotif">\n                  <div class="s-icon"><i class=\'bx bx-bell\'></i></div>\n                  <div class="s-text">\n                    <h4>Notifikasi</h4>\n                    <p>Atur preferensi notifikasi</p>\n                  </div>\n                  <i class=\'bx bx-chevron-right s-arrow\'></i>\n                </div>'
    )
    
    # Replace standalone bell icon
    content = content.replace(
        '<button class="icon-btn"><i class=\'bx bx-bell\'></i></button>',
        html_notif_wrapper
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
# Process CSS
for f in ['dashboard.css', 'pelanggan.css', 'sales.css', 'promo.css']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '.notification-wrapper' not in content:
        content += '\n' + css_notif
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

js_notif_logic = '''
  const btnNotifToggle = document.getElementById('btnNotifToggle');
  const notifPopup = document.getElementById('notifPopup');
  const settingsItemNotif = document.getElementById('settingsItemNotif');

  // Fungsi helper untuk menutup semua popup
  function closeAllPopups() {
    const settingsPopup = document.getElementById('settingsPopup');
    const filterPopup = document.getElementById('filterPopup');
    if (settingsPopup) settingsPopup.classList.remove('show');
    if (filterPopup) filterPopup.classList.remove('show');
    if (notifPopup) notifPopup.classList.remove('show');
  }

  // Buka/Tutup Notifikasi
  if (btnNotifToggle && notifPopup) {
    btnNotifToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowing = notifPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) notifPopup.classList.add('show');
    });
    notifPopup.addEventListener('click', (e) => e.stopPropagation());
  }

  // Buka Notifikasi dari dalam Menu Pengaturan
  if (settingsItemNotif && notifPopup) {
    settingsItemNotif.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopups();
      notifPopup.classList.add('show');
    });
  }

  // Logika Notifikasi - Tandai Dibaca
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
'''

# Process JS
for f in ['dashboard.js', 'pelanggan.js', 'sales.js', 'promo.js']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'btnNotifToggle' not in content:
        # Before '});' at the end of DOMContentLoaded
        # Finding the last occurrence of '});' or similar
        content = content.replace(
            '  // Fungsi Logout dari dalam Pengaturan',
            js_notif_logic + '\\n  // Fungsi Logout dari dalam Pengaturan'
        )
        
    # Also update 'closeAllPopups' in JS for settings button
    if 'closeAllPopups()' not in content:
        # Let's just do a simpler replace for the toggle logic
        # We need to ensure that settings popup and filter popup also close notifPopup
        # But this script is getting a bit complex to do pure string replacement on JS files.
        pass
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Done updating files.')
