import os, glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace("var photo = localStorage.getItem('user_photo');", "var photo = sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo');")
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Patched {f}")
