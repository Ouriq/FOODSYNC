import os, glob

def patch_files(pattern):
    for f in glob.glob(pattern):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Avoid double-patching if already contains the right snippet
        # We look for places where localStorage.getItem('user_name') is called, and replace it
        # Note: some files might already have it, or might be topbar.js which we manually patched.
        if "sessionStorage.getItem('user_name') || localStorage.getItem('user_name')" in content:
            # We still need to replace any remaining localStorage.getItem('user_name') if they exist separately?
            pass
        
        # Simple string replacement for typical patterns
        new_content = content.replace("localStorage.getItem('user_name')", "(sessionStorage.getItem('user_name') || localStorage.getItem('user_name'))")
        
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Patched {f}")

patch_files('*.html')
patch_files('js/*.js')
