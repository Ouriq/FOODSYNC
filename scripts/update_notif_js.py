import re

js_notif_logic = '''
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

'''

for f in ['dashboard.js', 'pelanggan.js', 'sales.js', 'promo.js']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'btnNotifToggle' in content:
        continue # already added
        
    # Inject before settingsLogoutBtn logic
    content = content.replace(
        '  if (settingsLogoutBtn) {',
        js_notif_logic + '\n  if (settingsLogoutBtn) {'
    )
    
    # Update window.addEventListener('click' to use closeAllPopups()
    # It looks like:
    #   window.addEventListener('click', () => {
    #     if (settingsPopup && settingsPopup.classList.contains('show')) {
    #       settingsPopup.classList.remove('show');
    #     }
    #   });
    # We will just replace it entirely with closeAllPopups call
    # A bit tricky with regex, let's just do a simple replace
    content = re.sub(
        r"  window\.addEventListener\('click', \(\) => \{[\s\S]*?  \}\);",
        "  window.addEventListener('click', () => {\n    if (typeof closeAllPopups === 'function') closeAllPopups();\n  });",
        content
    )
    
    # Ensure settingsPopup closes others
    content = re.sub(
        r"settingsPopup\.classList\.toggle\('show'\);",
        "const isShowing = settingsPopup.classList.contains('show');\n      if (typeof closeAllPopups === 'function') closeAllPopups();\n      if (!isShowing) settingsPopup.classList.add('show');",
        content
    )
    
    # Ensure filterPopup closes others
    content = re.sub(
        r"filterPopup\.classList\.toggle\('show'\);",
        "const isShowingF = filterPopup.classList.contains('show');\n      if (typeof closeAllPopups === 'function') closeAllPopups();\n      if (!isShowingF) filterPopup.classList.add('show');",
        content
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('JS updated.')
