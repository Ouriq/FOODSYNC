import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in html_files:
    if f == 'index.html': continue

    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # We need to remove Preferensi Dashboard and Notifikasi
    content = re.sub(
        r'<div class="settings-item">\s*<div class="s-icon"><i class=\'bx bx-grid-alt\'><\/i><\/div>\s*<div class="s-text">\s*<h4>Preferensi Dashboard<\/h4>\s*<p>Atur tampilan dashboard Anda<\/p>\s*<\/div>\s*<i class=\'bx bx-chevron-right s-arrow\'><\/i>\s*<\/div>',
        '',
        content
    )

    content = re.sub(
        r'<div class="settings-item" id="settingsItemNotif">\s*<div class="s-icon"><i class=\'bx bx-bell\'><\/i><\/div>\s*<div class="s-text">\s*<h4>Notifikasi<\/h4>\s*<p>Atur preferensi notifikasi<\/p>\s*<\/div>\s*<i class=\'bx bx-chevron-right s-arrow\'><\/i>\s*<\/div>',
        '',
        content
    )

    # And replace Keamanan
    old_k = """                <div class="settings-item">
                  <div class="s-icon"><i class='bx bx-lock-alt'></i></div>
                  <div class="s-text">
                    <h4>Keamanan</h4>
                    <p>Ubah password & keamanan akun</p>
                  </div>
                  <i class='bx bx-chevron-right s-arrow'></i>
                </div>"""
                
    new_k = """                <a href="keamanan.html" class="settings-item" style="text-decoration: none; color: inherit; display: flex;">
                  <div class="s-icon"><i class='bx bx-lock-alt'></i></div>
                  <div class="s-text">
                    <h4>Keamanan</h4>
                    <p>Ubah password & keamanan akun</p>
                  </div>
                  <i class='bx bx-chevron-right s-arrow'></i>
                </a>"""

    content = content.replace(old_k, new_k)

    # Just in case there are slight whitespace variations, a regex fallback for Keamanan
    content = re.sub(
        r'<div class="settings-item">\s*<div class="s-icon"><i class=\'bx bx-lock-alt\'><\/i><\/div>\s*<div class="s-text">\s*<h4>Keamanan<\/h4>\s*<p>Ubah password & keamanan akun<\/p>\s*<\/div>\s*<i class=\'bx bx-chevron-right s-arrow\'><\/i>\s*<\/div>',
        r'<a href="keamanan.html" class="settings-item" style="text-decoration: none; color: inherit; display: flex;">\n                  <div class="s-icon"><i class=\'bx bx-lock-alt\'></i></div>\n                  <div class="s-text">\n                    <h4>Keamanan</h4>\n                    <p>Ubah password & keamanan akun</p>\n                  </div>\n                  <i class=\'bx bx-chevron-right s-arrow\'></i>\n                </a>',
        content
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Settings menu updated in all HTML files.")
