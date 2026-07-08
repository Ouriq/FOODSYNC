import glob, re, os

files = set(glob.glob('*.html') + glob.glob('**/*.html', recursive=True))
count = 0
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        # Replace all firebase-sync.js references with cache-busted version
        new_content = re.sub(
            r'src="js/firebase-sync\.js[^"]*"',
            'src="js/firebase-sync.js?v=10"',
            content
        )
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            count += 1
            print(f'Updated: {f}')
    except Exception as e:
        print(f'Error {f}: {e}')
print(f'\nTotal files updated: {count}')
