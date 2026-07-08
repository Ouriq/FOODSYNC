import glob

for f in glob.glob('*.html') + glob.glob('js/*.js'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        if "window.addEventListener('storage'" not in content and 'window.addEventListener("storage"' not in content:
            if 'localStorage.getItem' in content:
                print(f'{f} accesses local storage but DOES NOT listen to storage events!')
