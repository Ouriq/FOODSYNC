import os

with open('js/firebase-sync.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''      });
        }
      });
    }''', '''      });
    }''')

with open('js/firebase-sync.js', 'w', encoding='utf-8') as f:
    f.write(content)
