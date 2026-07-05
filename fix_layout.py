import os
import re

css_files = [f for f in os.listdir('.') if f.endswith('.css')]

for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if we already added it
    if 'min-width: 1366px;' not in content:
        # Let's add it to body
        content = re.sub(
            r'body\s*{([^}]+)}',
            r'body {\1\n  min-width: 1366px;\n  overflow-x: auto;\n}',
            content
        )
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Added min-width and overflow-x to body in all CSS files.")
