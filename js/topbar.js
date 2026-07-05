
document.addEventListener("DOMContentLoaded", () => {
  // 1. Set Nama dan Role Pengguna dari Login
  const userName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Pengguna';
  const userRole = localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'sales';
  
  const roleTitleMap = {
      'sales': 'Sales & Marketing Manager',
      'hr': 'HR Manager',
      'finance': 'Finance Manager',
      'production': 'Production Staff',
      'inventory': 'Inventory Manager',
      'purchasing': 'Purchasing Manager',
      'super_admin': 'Super Admin'
  };
  const roleTitle = roleTitleMap[userRole] || userRole.toUpperCase();

  const userNameDisplay = document.getElementById('userNameDisplay');
  if (userNameDisplay) userNameDisplay.textContent = userName;
  
  const topbarUserRole = document.getElementById('topbarUserRole');
  if (topbarUserRole) topbarUserRole.textContent = roleTitle;

  // --- LOGIKA TOGGLE PENGATURAN POPUP BARU ---
  const btnProfileToggle = document.getElementById('btnProfileToggle');
  const profilePopup = document.getElementById('profilePopup');
  const popupLogoutBtn = document.getElementById('popupLogoutBtn');
  const btnChatToggle = document.getElementById('btnChatToggle');
  const chatPopup = document.getElementById('chatPopup');
  const btnNotifToggle = document.getElementById('btnNotifToggle');
  const notifPopup = document.getElementById('notifPopup');
  
  // Set nama user, email & role di dropdown popup
  const popupUserName = document.getElementById('popupUserName');
  const popupUserEmail = document.getElementById('popupUserEmail');
  const popupUserBadge = document.getElementById('popupUserBadge');
  
  if (popupUserName) popupUserName.textContent = userName;
  if (popupUserEmail) {
      let email = localStorage.getItem('user_email') || sessionStorage.getItem('user_email');
      popupUserEmail.textContent = email || 'sales@indofood.com';
  }
  if (popupUserBadge) {
      popupUserBadge.textContent = userRole.toUpperCase().replace('_', ' ');
  }

  // Set User Photo
  const savedPhoto = localStorage.getItem('user_photo');
  if (savedPhoto) {
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(av => {
      av.style.backgroundImage = `url('${savedPhoto}')`;
      av.innerHTML = ''; // clear icon
    });
    // Juga update avatar di popup
    const popupAvatarBg = document.getElementById('popupAvatarBg');
    if (popupAvatarBg) {
      popupAvatarBg.style.backgroundImage = `url('${savedPhoto}')`;
      popupAvatarBg.innerHTML = '';
    }
  }

  function closeAllPopups() {
    if (profilePopup) profilePopup.style.display = 'none';
    if (chatPopup) chatPopup.style.display = 'none';
    if (notifPopup) notifPopup.classList.remove('show');
  }

  // Toggle Profile Dropdown
  if (btnProfileToggle && profilePopup) {
    btnProfileToggle.addEventListener('click', (e) => {
      e.stopPropagation(); 
      const isShowing = profilePopup.style.display === 'block';
      closeAllPopups();
      profilePopup.style.display = isShowing ? 'none' : 'block';
    });
    profilePopup.addEventListener('click', (e) => e.stopPropagation());
  }
  
  // Toggle Chat Dropdown
  if (btnChatToggle && chatPopup) {
    btnChatToggle.addEventListener('click', (e) => {
      e.stopPropagation(); 
      const isShowing = chatPopup.style.display === 'block';
      closeAllPopups();
      chatPopup.style.display = isShowing ? 'none' : 'block';
    });
    chatPopup.addEventListener('click', (e) => e.stopPropagation());
  }

  // Toggle Notif Dropdown
  if (btnNotifToggle && notifPopup) {
    btnNotifToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowing = notifPopup.classList.contains('show');
      closeAllPopups();
      if (!isShowing) notifPopup.classList.add('show');
    });
    notifPopup.addEventListener('click', (e) => e.stopPropagation());
  }

  // Klik di luar tutup semua popup
  window.addEventListener('click', closeAllPopups);

  // Fungsi Notif Mark Read
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

  // Fungsi Logout dari dropdown baru
  if (popupLogoutBtn) {
    popupLogoutBtn.addEventListener('click', () => {
      ['auth_token', 'user_name', 'user_email'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.href = 'signin.html';
    });
  }
});


// INJECT CHAT DRAWER HTML
const chatStyle = document.createElement('style');
chatStyle.innerHTML = ` /* CHAT DRAWER CSS */ .chat-drawer-container, .chat-room-container {     position: fixed;     top: 0;     right: -450px;     width: 400px;     height: 100vh;     background: white;     box-shadow: -5px 0 25px rgba(0,0,0,0.1);     z-index: 10000;     transition: right 0.3s ease;     display: flex;     flex-direction: column; } .chat-drawer-container.open, .chat-room-container.open {     right: 0; } .chat-drawer-header {     display: flex;     justify-content: space-between;     align-items: center;     padding: 20px 24px;     border-bottom: 1px solid #F3F4F6; } .chat-drawer-search {     padding: 16px 24px;     position: relative; } .chat-drawer-search i {     position: absolute;     left: 40px;     top: 50%;     transform: translateY(-50%);     color: #9CA3AF; } .chat-drawer-search input {     width: 100%;     padding: 10px 10px 10px 36px;     border: 1px solid #E5E7EB;     border-radius: 20px;     font-size: 13px;     outline: none;     background: #F9FAFB; } .chat-drawer-tabs {     display: flex;     border-bottom: 1px solid #E5E7EB;     padding: 0 16px; } .chat-tab {     flex: 1;     text-align: center;     padding: 12px 0;     font-size: 13px;     font-weight: 600;     color: #6B7280;     cursor: pointer;     border-bottom: 2px solid transparent; } .chat-tab.active {     color: #111827;     border-bottom: 2px solid #111827; } .chat-drawer-body {     flex: 1;     overflow-y: auto;     padding: 20px 24px; } .chat-view {     display: none;     flex-direction: column;     height: 100%; } .chat-view.active {     display: flex; } .section-title {     font-size: 11px;     font-weight: 700;     color: #9CA3AF;     letter-spacing: 1px;     margin-bottom: 16px; } .chat-item {     display: flex;     align-items: center;     gap: 12px;     padding: 12px 0;     cursor: pointer;     border-bottom: 1px solid #F9FAFB; } .chat-item:hover {     background: #F9FAFB; } .chat-avatar {     width: 40px;     height: 40px;     border-radius: 50%;     background: #FDBA74;     color: white;     display: flex;     align-items: center;     justify-content: center;     font-weight: 700;     font-size: 14px; } .chat-info {     flex: 1; } .chat-name {     font-size: 14px;     font-weight: 600;     color: #111827;     margin: 0 0 4px 0; } .chat-time {     font-size: 12px;     color: #9CA3AF;     margin: 0; } .chat-badge {     font-size: 10px;     font-weight: 700;     padding: 4px 8px;     border-radius: 12px;     background: #CCFBF1;     color: #0F766E;     text-transform: uppercase; } .chat-room-messages {     flex: 1;     background: #F9FAFB;     padding: 20px;     overflow-y: auto;     display: flex;     flex-direction: column;     gap: 12px; } .chat-room-input {     padding: 16px;     border-top: 1px solid #F3F4F6;     display: flex;     gap: 12px; } .chat-room-input input {     flex: 1;     border: 1px solid #E5E7EB;     border-radius: 20px;     padding: 10px 16px;     outline: none; } .msg-bubble {     max-width: 80%;     padding: 10px 14px;     border-radius: 12px;     font-size: 13px;     line-height: 1.4; } .msg-bubble.me {     align-self: flex-end;     background: #1D4ED8;     color: white;     border-bottom-right-radius: 4px; } .msg-bubble.other {     align-self: flex-start;     background: white;     border: 1px solid #E5E7EB;     color: #111827;     border-bottom-left-radius: 4px; } .announcement-bubble {     background: #FEF2F2;     border-left: 4px solid #EF4444;     padding: 12px;     margin-bottom: 12px;     border-radius: 4px; } `;
document.head.appendChild(chatStyle);

const chatHtml = `
<div id="erp-chat-drawer" class="chat-drawer-container">
  <div class="chat-drawer-header">
    <div style="display:flex; align-items:center; gap:8px;">
      <i class='bx bx-message-rounded-dots' style="font-size:24px; color:#111827;"></i>
      <h3 style="margin:0; font-size:18px; color:#111827;">Messages</h3>
    </div>
    <button id="closeChatDrawer" style="background:none; border:none; cursor:pointer; font-size:24px; color:#6B7280;">&times;</button>
  </div>
  
  <div class="chat-drawer-search">
    <i class='bx bx-search'></i>
    <input type="text" placeholder="Search name, username, or email..." />
  </div>

  <div class="chat-drawer-tabs">
    <div class="chat-tab active" data-target="dm-view"><i class='bx bx-message'></i> Direct Message</div>
    <div class="chat-tab" data-target="announcement-view"><i class='bx bx-broadcast'></i> Announcement</div>
  </div>

  <div class="chat-drawer-body">
    <!-- DM VIEW -->
    <div id="dm-view" class="chat-view active">
      <p class="section-title">CONVERSATIONS</p>
      <div class="chat-list" id="chatList"></div>
    </div>
    <!-- ANNOUNCEMENT VIEW -->
    <div id="announcement-view" class="chat-view">
      <div id="announcementList" style="flex:1; overflow-y:auto; padding-bottom:16px;"></div>
      <div id="announcementInputContainer" style="display:none; border-top:1px solid #E5E7EB; padding-top:12px; margin-top: auto;">
         <input type="text" id="announcementInput" placeholder="Type announcement..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; box-sizing:border-box;">
         <button id="sendAnnouncementBtn" style="width:100%; margin-top:8px; background:#1D4ED8; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:600;">Broadcast</button>
      </div>
    </div>
  </div>
</div>

<div id="erp-chat-room" class="chat-room-container">
    <div class="chat-drawer-header">
        <button id="backToChatList" style="background:none; border:none; cursor:pointer; font-size:24px; color:#6B7280; margin-right:8px;"><i class='bx bx-arrow-back'></i></button>
        <h3 id="chatRoomTitle" style="margin:0; font-size:16px; color:#111827;">Division Name</h3>
    </div>
    <div id="chatRoomMessages" class="chat-room-messages"></div>
    <div class="chat-room-input">
        <input type="text" id="chatMessageInput" placeholder="Type a message..." />
        <button id="sendChatMessageBtn" style="background:#1D4ED8; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;"><i class='bx bx-send'></i></button>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', chatHtml);

// CHAT LOGIC
const divisions = [
    { id: 'inventory', name: 'Inventory Staff', badge: 'INVENTORY', color: '#FDBA74' },
    { id: 'production', name: 'Production Staff', badge: 'PRODUCTION', color: '#A78BFA' },
    { id: 'sales', name: 'Sales & Marketing', badge: 'SALES', color: '#60A5FA' },
    { id: 'purchasing', name: 'Purchasing Manager', badge: 'PURCHASING', color: '#34D399' },
    { id: 'finance', name: 'Finance Manager', badge: 'FINANCE', color: '#F87171' },
    { id: 'hr', name: 'HR Manager', badge: 'HR', color: '#FBBF24' }
];

let currentUserRole = localStorage.getItem('user_role') || 'sales';
let currentActiveChatId = null;

// OVERRIDE BTN CHAT TOGGLE (From topbar)
const originalBtnChat = document.getElementById('btnChatToggle');
const oldChatPopup = document.getElementById('chatPopup');
if (oldChatPopup) oldChatPopup.remove(); // Hapus popup lama

const chatDrawer = document.getElementById('erp-chat-drawer');
const chatRoom = document.getElementById('erp-chat-room');

if (originalBtnChat) {
    // Ganti event listener lama dengan clone node (hack cepat hapus event listener lama)
    const newBtnChat = originalBtnChat.cloneNode(true);
    originalBtnChat.parentNode.replaceChild(newBtnChat, originalBtnChat);
    
    newBtnChat.addEventListener('click', (e) => {
        e.stopPropagation();
        chatDrawer.classList.add('open');
        renderChatList();
        renderAnnouncements();
    });
}

document.getElementById('closeChatDrawer').addEventListener('click', () => {
    chatDrawer.classList.remove('open');
});

// TAB LOGIC
document.querySelectorAll('.chat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.chat-view').forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-target')).classList.add('active');
    });
});

// RENDER CHAT LIST
function renderChatList() {
    const list = document.getElementById('chatList');
    list.innerHTML = '';
    
    divisions.forEach(div => {
        if (div.id === currentUserRole) return; // Jangan chat diri sendiri (kecuali superadmin)
        
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.innerHTML = `
            <div class="chat-avatar" style="background:${div.color}">${div.badge.substring(0,2)}</div>
            <div class="chat-info">
                <h4 class="chat-name">${div.name}</h4>
                <p class="chat-time">Click to chat</p>
            </div>
            <div class="chat-badge">${div.badge}</div>
        `;
        item.addEventListener('click', () => openChatRoom(div));
        list.appendChild(item);
    });
}

// OPEN CHAT ROOM
function openChatRoom(division) {
    currentActiveChatId = division.id;
    document.getElementById('chatRoomTitle').textContent = division.name;
    chatDrawer.classList.remove('open');
    chatRoom.classList.add('open');
    renderMessages();
}

document.getElementById('backToChatList').addEventListener('click', () => {
    chatRoom.classList.remove('open');
    chatDrawer.classList.add('open');
    currentActiveChatId = null;
});

// MESSAGING LOGIC
function getMessages() {
    return JSON.parse(localStorage.getItem('erp_messages') || '[]');
}
function saveMessages(msgs) {
    localStorage.setItem('erp_messages', JSON.stringify(msgs));
}

function renderMessages() {
    if (!currentActiveChatId) return;
    const msgs = getMessages();
    const container = document.getElementById('chatRoomMessages');
    container.innerHTML = '';
    
    // Filter messages for this conversation
    const convoMsgs = msgs.filter(m => 
        m.type === 'dm' && 
        ((m.from === currentUserRole && m.to === currentActiveChatId) || 
         (m.to === currentUserRole && m.from === currentActiveChatId))
    );
    
    convoMsgs.forEach(m => {
        const isMe = m.from === currentUserRole;
        const div = document.createElement('div');
        div.className = `msg-bubble ${isMe ? 'me' : 'other'}`;
        div.innerHTML = `<b>${isMe ? 'You' : m.from.toUpperCase()}</b><br/>${m.text}<br/><small style="opacity:0.7">${m.time}</small>`;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

document.getElementById('sendChatMessageBtn').addEventListener('click', () => {
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text) return;
    
    const msgs = getMessages();
    msgs.push({
        id: Date.now(),
        type: 'dm',
        from: currentUserRole,
        to: currentActiveChatId,
        text: text,
        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
    });
    saveMessages(msgs);
    input.value = '';
    renderMessages();
});

document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sendChatMessageBtn').click();
    }
});

// ANNOUNCEMENT LOGIC
if (currentUserRole === 'super_admin') {
    document.getElementById('announcementInputContainer').style.display = 'block';
}

function renderAnnouncements() {
    const msgs = getMessages().filter(m => m.type === 'announcement');
    const container = document.getElementById('announcementList');
    container.innerHTML = '';
    
    if (msgs.length === 0) {
        container.innerHTML = '<p style="color:#9CA3AF; font-size:13px; text-align:center; margin-top:20px;">No announcements yet.</p>';
    }
    
    msgs.reverse().forEach(m => {
        const div = document.createElement('div');
        div.className = 'announcement-bubble';
        div.innerHTML = `<b style="color:#B91C1C;">Super Admin</b> <span style="font-size:11px; color:#9CA3AF;">${m.time}</span>
                         <p style="margin:4px 0 0 0; font-size:13px; color:#111827;">${m.text}</p>`;
        container.appendChild(div);
    });
}

document.getElementById('sendAnnouncementBtn').addEventListener('click', () => {
    const input = document.getElementById('announcementInput');
    const text = input.value.trim();
    if (!text) return;
    
    const msgs = getMessages();
    msgs.push({
        id: Date.now(),
        type: 'announcement',
        from: 'super_admin',
        text: text,
        time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})
    });
    saveMessages(msgs);
    input.value = '';
    renderAnnouncements();
});

document.getElementById('announcementInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sendAnnouncementBtn').click();
    }
});

// REALTIME LISTENER
window.addEventListener('storage', (e) => {
    if (e.key === 'erp_messages') {
        renderMessages();
        renderAnnouncements();
    }
});


  // --- BUDGET ROLLOVER LOGIC (MONTHLY RESET) ---
  function checkMonthlyRollover() {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastMonth = localStorage.getItem('erp_last_budget_month');

      if (!lastMonth) {
          // Inisialisasi jika belum pernah dibuka
          localStorage.setItem('erp_last_budget_month', currentMonth);
          return;
      }

      if (lastMonth !== currentMonth) {
          // Terjadi pergantian bulan! Lakukan tutup buku
          
          // 1. Hitung sisa budget Sales & Marketing
          let maxBudget = 0;
          let financeAllocations = JSON.parse(localStorage.getItem('erp_finance_allocations') || '[]');
          
          financeAllocations.forEach(alloc => {
              if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
                  maxBudget += Number(alloc.nominal);
              }
          });

          let usedBudget = 0;
          let campaignsData = JSON.parse(localStorage.getItem('campaigns_data') || '[]');
          campaignsData.forEach(c => {
              if (c.status !== 'Draft') {
                  usedBudget += Number(c.anggaran);
              }
          });

          let sisa = maxBudget - usedBudget;
          if (sisa < 0) sisa = 0;

          // 2. Simpan sisa dana ke erp_finance_returns
          if (sisa > 0) {
              let returns = JSON.parse(localStorage.getItem('erp_finance_returns')) || [];
              const todayStr = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
              returns.push({
                  month: lastMonth,
                  date: todayStr,
                  divisi: 'Sales & Marketing',
                  nominal: sisa
              });
              localStorage.setItem('erp_finance_returns', JSON.stringify(returns));
          }

          // 3. Reset/Expired semua alokasi bulan lalu agar Max Budget jadi 0
          let modified = false;
          financeAllocations.forEach(alloc => {
              if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
                  alloc.status = 'expired';
                  modified = true;
              }
          });
          
          if (modified) {
              localStorage.setItem('erp_finance_allocations', JSON.stringify(financeAllocations));
          }

          // 4. Update penanda bulan
          localStorage.setItem('erp_last_budget_month', currentMonth);
          
          // 5. Beri tahu halaman lain yang terbuka
          window.dispatchEvent(new Event('storage'));
          
          console.log(`Tutup buku untuk bulan ${lastMonth} selesai. Sisa dana Rp ${sisa} dikembalikan ke Finance.`);
      }
  }

  // Panggil pengecekan rollover
  checkMonthlyRollover();
