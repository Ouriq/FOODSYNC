import os

html_path = 'c:/Users/thori/Latihan/foodsyncerp/market.html'
js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/market-v2.js'

# 1. Patch JS (remove duplicate consts)
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace the duplicate declarations in my injected block at the bottom
js_content = js_content.replace("const filterPopup = document.getElementById('filterPopup');", "/* duplicate removed */")
js_content = js_content.replace("const btnFilterToggle = document.getElementById('btnFilterToggle');", "/* duplicate removed */")

# Wait, if they were removed entirely from my block, they might not be defined if they were block-scoped, but they were in the same global DOMContentLoaded block.
# Actually, wait. Let's make sure they are accessible. They were declared with `const` earlier in the block.
# Wait, I can just change `const filterPopup = ` to `// const filterPopup = ` in my injected section.

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print("market-v2.js patched (duplicate consts removed).")

# 2. Patch HTML (move button)
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove from action-footer
btn_html = """<button class="btn-add-primary" id="btnShowAddForm"><i class='bx bx-plus'></i> Tambah Data Pesaing</button>"""
action_footer_html = """<div class="action-footer">
          <button class="btn-add-primary" id="btnShowAddForm"><i class='bx bx-plus'></i> Tambah Data Pesaing</button>
        </div>"""

if action_footer_html in content:
    content = content.replace(action_footer_html, '')
else:
    # try just removing the button
    content = content.replace(btn_html, '')

# Add to filter-wrapper
filter_wrapper_target = """<div class="filter-wrapper">
              <button class="btn-sort" id="btnFilterToggle">Urut: terbaru <i class='bx bx-chevron-down'></i></button>"""
              
new_filter_wrapper = f"""<div class="filter-wrapper" style="display: flex; gap: 12px;">
              <button class="btn-sort" id="btnFilterToggle">Urut: terbaru <i class='bx bx-chevron-down'></i></button>
              {btn_html}"""

content = content.replace(filter_wrapper_target, new_filter_wrapper)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("market.html patched (button moved).")
