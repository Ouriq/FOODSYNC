import os
import re

files = ["dashboard.html", "pelanggan.html", "sales.html", "promo.html", "kampanye.html"]
for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        def replacer(match):
            return match.group(0).replace('href="#"', 'href="market.html"')
        
        new_content = re.sub(r'<a href="#" class="nav-item"[^>]*>.*?Market Intelligence.*?</a>', replacer, content, flags=re.DOTALL)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
