import os
import re

html_path = 'c:/Users/thori/Latihan/foodsyncerp/market.html'
js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/market-v2.js'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('id="btnCancelAdd">Reset Filter</button>', 'id="btnCancelAdd">Batal</button>')

# Ensure inputHarga has oninput to remove non-numeric chars (it already does, but just in case)
if 'id="inputHarga"' in content and 'oninput=' not in content.split('id="inputHarga"')[1][:50]:
    content = content.replace('id="inputHarga" class="form-input"', 'id="inputHarga" class="form-input" oninput="this.value = this.value.replace(/[^0-9]/g, \'\')"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Fix parsing in JS
js_content = js_content.replace(
    "const harga = document.getElementById('inputHarga') ? document.getElementById('inputHarga').value : '';",
    "let harga = document.getElementById('inputHarga') ? document.getElementById('inputHarga').value : '';\n          harga = harga.replace(/[^0-9]/g, '');"
)

# Add the filter logic
js_addition = """
    // --- FILTER SORTING LOGIC ---
    const btnApplyMarketFilter = document.getElementById('btnApplyMarketFilter');
    const sortFilterSelect = document.getElementById('sortFilterSelect');
    const filterPopup = document.getElementById('filterPopup');
    const btnFilterToggle = document.getElementById('btnFilterToggle');
    const btnClearMarketFilter = document.getElementById('btnClearMarketFilter');

    // Toggle Filter Popup
    if (btnFilterToggle) {
        btnFilterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterPopup.style.display = filterPopup.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Hide popup when clicking outside
    document.addEventListener('click', (e) => {
        if (filterPopup && filterPopup.style.display === 'block' && !filterPopup.contains(e.target) && e.target !== btnFilterToggle) {
            filterPopup.style.display = 'none';
        }
    });

    if (btnApplyMarketFilter && sortFilterSelect) {
        btnApplyMarketFilter.addEventListener('click', () => {
            const sortVal = sortFilterSelect.value;
            
            marketData.sort((a, b) => {
                let idA = parseInt(a.id.replace(/[^0-9]/g, '')) || 0;
                let idB = parseInt(b.id.replace(/[^0-9]/g, '')) || 0;
                if (sortVal === 'terbaru') {
                    return idB - idA;
                } else {
                    return idA - idB;
                }
            });
            
            renderMarketTable();
            btnFilterToggle.innerHTML = `Urut: ${sortVal === 'terbaru' ? 'Terbaru' : 'Terlama'} <i class='bx bx-chevron-down'></i>`;
            filterPopup.style.display = 'none';
            if(typeof showToast === 'function') showToast('Filter diterapkan!', '#059669');
        });
    }

    if (btnClearMarketFilter) {
        btnClearMarketFilter.addEventListener('click', () => {
            filterPopup.style.display = 'none';
        });
    }
"""

if "btnApplyMarketFilter" not in js_content:
    # Insert logic before closing '});'
    last_brace = js_content.rfind('});')
    if last_brace != -1:
        js_content = js_content[:last_brace] + js_addition + "\n" + js_content[last_brace:]
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("market-v2.js patched with filter logic and harga fix.")
else:
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("market-v2.js patched with harga fix.")
