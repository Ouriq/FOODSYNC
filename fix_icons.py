import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace css/https:// with https://
    content = content.replace('href="css/https://', 'href="https://')
    
    # Also replace any accidental js/https:// if any
    content = content.replace('src="js/https://', 'src="https://')
    
    # Also check if I accidentally added backslashes in the user-profile earlier:
    # <div class="user-avatar"><i class=\'bx bx-user-circle\'></i></div>
    content = content.replace("class=\\'bx", "class='bx")
    content = content.replace("bx-user-circle\\'", "bx-user-circle'")
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Fixed broken https links and backslashes in HTML files.")
