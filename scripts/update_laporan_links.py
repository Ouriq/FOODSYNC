import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    pattern = re.compile(r'<a href="#"( class="nav-item[^"]*")>\s*<img src="laporanicon.png"', re.IGNORECASE)
    new_content = pattern.sub(r'<a href="laporan.html"\1>\n          <img src="laporanicon.png"', content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
