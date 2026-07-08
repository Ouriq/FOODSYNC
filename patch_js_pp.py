import os, glob

for f in glob.glob('js/*.js'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We replace localStorage.getItem('user_photo') with (sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'))
    # But only if it's not already patched
    
    if "sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo')" in content:
        continue

    new_content = content.replace("localStorage.getItem('user_photo')", "(sessionStorage.getItem('user_photo') || localStorage.getItem('user_photo'))")
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Patched {f}")
