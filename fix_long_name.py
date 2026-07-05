import os

css_files = []
# Root css files
for f in os.listdir('.'):
    if f.endswith('.css'):
        css_files.append(f)
        
# css/ directory files
if os.path.exists('css'):
    for f in os.listdir('css'):
        if f.endswith('.css'):
            css_files.append(os.path.join('css', f))

css_snippet = """

/* Fix for long names overflowing */
.user-info {
  max-width: 180px;
}
.user-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.user-role {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
"""

for f in css_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '/* Fix for long names overflowing */' not in content:
        with open(f, 'a', encoding='utf-8') as file:
            file.write(css_snippet)

print("Applied long name fix to all CSS files.")
