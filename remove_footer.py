import os
import glob
import re

pattern = re.compile(r'\s*<div class="sidebar-footer">.*?</div>', re.DOTALL)

for f in glob.glob('c:/Users/thori/Latihan/foodsyncerp/*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        if 'sidebar-footer' in content:
            new_content = pattern.sub('', content)
            with open(f, 'w', encoding='utf-8') as file2:
                file2.write(new_content)
            print(f'Removed sidebar-footer from {os.path.basename(f)}')
