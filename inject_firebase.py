import os
import glob

html_files = glob.glob('*.html')
tag = '<script type="module" src="js/firebase-sync.js"></script>\n'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'js/firebase-sync.js' not in content:
        # Cari tag </body>
        if '</body>' in content:
            new_content = content.replace('</body>', tag + '</body>')
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Injected to {file}')
        else:
            print(f'Warning: </body> not found in {file}')
    else:
        print(f'Already injected in {file}')

