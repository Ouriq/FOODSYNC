import os
import re

html_files = [
    'dashboardfin.html', 'budgeting.html', 'laporanlaba.html',
    'dashboardpurc.html', 'permintaanpembelian.html', 'pesananpembelian.html',
    'fakturpembelian.html', 'threeway.html'
]

standard_header = """      <header class="topbar">
        <div class="topbar-right" style="margin-left: auto; display: flex; align-items: center; gap: 24px;">
          
          <!-- CHAT MODULE -->
          <div class="chat-wrapper" style="position: relative;">
            <button class="icon-btn" id="btnChatToggle" style="background:none; border:none; cursor:pointer;">
              <i class='bx bx-message-rounded-dots' style="font-size: 20px; color: #374151;"></i>
            </button>
            <div class="chat-popup" id="chatPopup" style="display: none; position: absolute; right: 0; top: 40px; background: white; width: 300px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; z-index: 1000; padding: 16px;">
              <h3 style="font-size: 16px; margin-bottom: 8px; color: #111827;">Pesan Internal</h3>
              <p style="font-size: 13px; color: #6B7280;">Modul komunikasi antar departemen akan hadir di sini.</p>
            </div>
          </div>

          <!-- WRAPPER NOTIFIKASI -->
          <div class="notification-wrapper" style="position: relative;">
            <button class="icon-btn" id="btnNotifToggle" style="background:none; border:none; cursor:pointer;">
              <i class='bx bx-bell' style="font-size: 20px; color: #374151;"></i>
            </button>

            <!-- KOTAK POPUP NOTIFIKASI -->
            <div class="notif-popup" id="notifPopup" style="display: none; position: absolute; right: 0; top: 40px; background: white; width: 320px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; z-index: 1000; overflow: hidden;">
              <div style="padding: 16px; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0; font-size: 16px; color: #111827;">Notifikasi</h3>
                <a href="#" class="notif-mark-read" style="font-size: 12px; color: #3B82F6; text-decoration: none;">Mark all as read</a>
              </div>
              <div style="max-height: 300px; overflow-y: auto;">
                <div class="notif-item" style="padding: 16px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 12px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='white'">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: #E0E7FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class='bx bx-info-circle'></i>
                  </div>
                  <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #111827;">Pembaruan Sistem</h4>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">Sistem ERP telah diperbarui ke versi terbaru.</p>
                    <span style="font-size: 11px; color: #9CA3AF;">Baru saja</span>
                  </div>
                </div>
              </div>
              <div style="padding: 12px; text-align: center; border-top: 1px solid #F3F4F6;">
                <a href="#" style="font-size: 13px; color: #3B82F6; text-decoration: none; font-weight: 500;">Lihat semua notifikasi</a>
              </div>
            </div>
          </div>
          <!-- END WRAPPER NOTIFIKASI -->

          <!-- PROFILE DROPDOWN -->
          <div class="profile-wrapper" style="position: relative;">
            <div class="user-profile" id="btnProfileToggle" style="cursor: pointer; display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
              <div class="user-info" style="text-align: right;">
                <span class="user-name" id="userNameDisplay">Loading...</span>
                <span class="user-role" id="topbarUserRole">Loading...</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #E5E7EB; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center;">
                  <i class='bx bx-user' style="font-size:24px; color: #9CA3AF;"></i>
                </div>
                <i class='bx bx-chevron-down' style="color: #6B7280; font-size: 16px;"></i>
              </div>
            </div>

            <!-- KOTAK POPUP PROFILE -->
            <div class="profile-popup" id="profilePopup" style="display: none; position: absolute; right: 0; top: 55px; background: white; width: 260px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; z-index: 1000; overflow: hidden;">
              <!-- Header Info -->
              <div style="padding: 20px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 16px; align-items: center;">
                <div id="popupAvatarBg" style="width: 48px; height: 48px; border-radius: 50%; background: #E5E7EB; background-size: cover; background-position: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <i class='bx bx-user' style="font-size:24px; color: #9CA3AF;"></i>
                </div>
                <div>
                  <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 2px 0;" id="popupUserName">User</h4>
                  <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0;" id="popupUserEmail">user@foodsync.com</p>
                  <span id="popupUserBadge" style="background: #DBEAFE; color: #1D4ED8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">ROLE</span>
                </div>
              </div>
              
              <!-- Menu Links -->
              <div style="padding: 8px 0;">
                <a href="profil.html" style="display: flex; align-items: center; gap: 12px; padding: 10px 20px; text-decoration: none; color: #374151; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                  <i class='bx bx-user' style="font-size: 18px; color: #9CA3AF;"></i> My Profile
                </a>
                <a href="keamanan.html" style="display: flex; align-items: center; gap: 12px; padding: 10px 20px; text-decoration: none; color: #374151; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                  <i class='bx bx-cog' style="font-size: 18px; color: #9CA3AF;"></i> Account Settings
                </a>
              </div>

              <!-- Logout -->
              <div style="border-top: 1px solid #F3F4F6; padding: 8px 0;">
                <button id="popupLogoutBtn" style="width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 10px 20px; border: none; background: transparent; cursor: pointer; color: #DC2626; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                  <i class='bx bx-log-out' style="font-size: 18px;"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>"""

header_pattern = re.compile(r'\s*<header class="topbar">.*?</header>', re.DOTALL)

for f in html_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the header
        new_content = header_pattern.sub('\\n' + standard_header, content)
        
        # Add script tag if missing before </body>
        if 'js/topbar.js' not in new_content:
            new_content = new_content.replace('</body>', '  <script src="js/topbar.js?v=3"></script>\n</body>')
        else:
            new_content = new_content.replace('js/topbar.js?v=2', 'js/topbar.js?v=3')
            new_content = new_content.replace('js/topbar.js', 'js/topbar.js?v=3')
            
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
