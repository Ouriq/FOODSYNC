
// notifications.js — localStorage version (no Firebase)
// This file is loaded as a module on every page.

document.addEventListener("DOMContentLoaded", function() {
    var notifList = document.querySelector('.notif-list');
    var btnNotifToggle = document.getElementById('btnNotifToggle');
    
    if (!notifList) return;

    function renderNotifications() {
        var notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifs.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
        // Limit to 5 most recent
        notifs = notifs.slice(0, 5);
        
        notifList.innerHTML = '';
        var unreadCount = 0;

        if (notifs.length === 0) {
            notifList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">Tidak ada notifikasi</div>';
            if (btnNotifToggle) {
                var badge = btnNotifToggle.querySelector('.notif-badge');
                if (badge) badge.remove();
            }
            return;
        }

        notifs.forEach(function(data, index) {
            var isRead = data.isRead || false;
            if (!isRead) unreadCount++;

            // Default icon and color
            var iconClass = "bx-info-circle";
            var bgColor = "#E0E7FF";
            var iconColor = "#4F46E5";

            if (data.type === 'sales' || data.type === 'draft') {
                iconClass = "bx-shopping-bag";
            } else if (data.type === 'processed') {
                iconClass = "bx-check-circle";
                bgColor = "#DCFCE7";
                iconColor = "#16A34A";
            } else if (data.type === 'promo') {
                iconClass = "bx-purchase-tag";
                bgColor = "#F3E8FF";
                iconColor = "#9333EA";
            } else if (data.type === 'kampanye') {
                iconClass = "bx-speaker";
                bgColor = "#DCFCE7";
                iconColor = "#16A34A";
            } else if (data.type === 'pelanggan') {
                iconClass = "bx-user-plus";
                bgColor = "#FFEDD5";
                iconColor = "#EA580C";
            }

            // Calculate time ago
            var timeStr = "Baru saja";
            if (data.createdAt) {
                var diffMs = new Date() - new Date(data.createdAt);
                var diffMins = Math.floor(diffMs / 60000);
                if (diffMins > 0 && diffMins < 60) timeStr = diffMins + " menit yang lalu";
                else if (diffMins >= 60 && diffMins < 1440) timeStr = Math.floor(diffMins/60) + " jam yang lalu";
                else if (diffMins >= 1440) timeStr = Math.floor(diffMins/1440) + " hari yang lalu";
            }

            var notifItem = document.createElement('div');
            notifItem.className = 'notif-item';
            notifItem.style.cursor = 'pointer';
            if (isRead) notifItem.style.opacity = '0.7';

            notifItem.innerHTML =
              '<div class="notif-icon" style="background-color: ' + bgColor + '; color: ' + iconColor + ';">' +
                '<i class="bx ' + iconClass + '"></i>' +
              '</div>' +
              '<div class="notif-content">' +
                '<h4>' + (data.title || 'Notifikasi') + '</h4>' +
                '<p>' + (data.message || '') + '</p>' +
                '<span class="notif-time">' + timeStr + '</span>' +
              '</div>' +
              (!isRead ? '<div class="notif-unread-dot"></div>' : '');

            // Mark single as read on click
            notifItem.addEventListener('click', function() {
                if (!isRead) {
                    var allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
                    // Mark this specific one as read
                    if (allNotifs[index]) {
                        allNotifs[index].isRead = true;
                        localStorage.setItem('notifications', JSON.stringify(allNotifs));
                    }
                    var dot = notifItem.querySelector('.notif-unread-dot');
                    if (dot) dot.style.display = 'none';
                }
            });

            notifList.appendChild(notifItem);
        });

        // Update bell icon badge
        if (btnNotifToggle) {
            var badge = btnNotifToggle.querySelector('.notif-badge');
            if (unreadCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'notif-badge';
                    badge.style.position = 'absolute';
                    badge.style.top = '4px';
                    badge.style.right = '4px';
                    badge.style.width = '8px';
                    badge.style.height = '8px';
                    badge.style.backgroundColor = '#ef4444';
                    badge.style.borderRadius = '50%';
                    btnNotifToggle.style.position = 'relative';
                    btnNotifToggle.appendChild(badge);
                }
            } else if (badge) {
                badge.remove();
            }
        }
    }

    // Initial render
    renderNotifications();

    // Make it available globally
    window.renderNotifications = renderNotifications;

    // Mark all as read
    var markAllBtn = document.querySelector('.notif-mark-read');
    if (markAllBtn) {
        // Clone and replace to remove existing event listeners from other scripts
        var newMarkAllBtn = markAllBtn.cloneNode(true);
        markAllBtn.parentNode.replaceChild(newMarkAllBtn, markAllBtn);

        newMarkAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var allNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
            allNotifs.forEach(function(n) { n.isRead = true; });
            localStorage.setItem('notifications', JSON.stringify(allNotifs));
            renderNotifications();
        });
    }
});
