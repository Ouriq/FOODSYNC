import glob, re, os

files = set(glob.glob('*.html') + glob.glob('**/*.html', recursive=True))
count = 0
preload_tag = '<script src="js/firebase-preload.js?v=1"></script>\n'

for f in sorted(files):
    # Skip force-sync.html and reset.html
    if f in ('force-sync.html',):
        continue
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        
        # Skip if already has preload
        if 'firebase-preload.js' in content:
            continue
        
        # Strategy: insert preload script right after <body> tag
        # This ensures it runs BEFORE any inline scripts
        new_content = content
        
        # Find the <body...> tag and insert preload right after it
        body_match = re.search(r'(<body[^>]*>)', content, re.IGNORECASE)
        if body_match:
            insert_pos = body_match.end()
            new_content = content[:insert_pos] + '\n' + preload_tag + content[insert_pos:]
        else:
            continue
            
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            count += 1
            print(f'Injected preload: {f}')
    except Exception as e:
        print(f'Error {f}: {e}')

print(f'\nTotal files updated: {count}')
