import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in html_files:
    if f == 'index.html': continue

    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace user-profile
    # From <div class="user-profile">
    # To <a href="profil.html" class="user-profile" style="text-decoration: none; color: inherit;">
    # And closing </div> to </a>
    # Note: user-profile could have been already replaced
    if '<div class="user-profile">' in content:
        # We need to find the closing tag for user-profile. 
        # But wait, it's easier to just replace the whole block since it's standard
        old_profile_block = """          <div class="user-profile">
            <div class="user-info">
              <span class="user-name" id="userNameDisplay">Nilam</span>
              <span class="user-role">Sales & Marketing Manager</span>
            </div>
            <div class="user-avatar"><i class='bx bx-user-circle'></i></div>
          </div>"""
        
        new_profile_block = """          <a href="profil.html" class="user-profile" style="text-decoration: none; color: inherit;">
            <div class="user-info">
              <span class="user-name" id="userNameDisplay">Nilam</span>
              <span class="user-role">Sales & Marketing Manager</span>
            </div>
            <div class="user-avatar"><i class='bx bx-user-circle'></i></div>
          </a>"""
        
        if old_profile_block in content:
            content = content.replace(old_profile_block, new_profile_block)
        else:
            # fallback generic replace
            content = re.sub(
                r'<div class="user-profile">([\s\S]*?)<div class="user-info">([\s\S]*?)</div>\s*<div class="user-avatar"><i class=\'bx bx-user-circle\'></i></div>\s*</div>',
                r'<a href="profil.html" class="user-profile" style="text-decoration: none; color: inherit;">\1<div class="user-info">\2</div>\n            <div class="user-avatar"><i class=\'bx bx-user-circle\'></i></div>\n          </a>',
                content
            )

    # Replace settings item
    old_settings_block = """                <div class="settings-item">
                  <div class="s-icon"><i class='bx bx-user'></i></div>
                  <div class="s-text">
                    <h4>Profil Saya</h4>
                    <p>Kelola informasi akun Anda</p>
                  </div>
                  <i class='bx bx-chevron-right s-arrow'></i>
                </div>"""
    
    new_settings_block = """                <a href="profil.html" class="settings-item" style="text-decoration: none; color: inherit; display: flex;">
                  <div class="s-icon"><i class='bx bx-user'></i></div>
                  <div class="s-text">
                    <h4>Profil Saya</h4>
                    <p>Kelola informasi akun Anda</p>
                  </div>
                  <i class='bx bx-chevron-right s-arrow'></i>
                </a>"""

    if old_settings_block in content:
        content = content.replace(old_settings_block, new_settings_block)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Updated links in all HTML files.')
