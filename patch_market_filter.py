import os
import re

html_path = 'c:/Users/thori/Latihan/foodsyncerp/market.html'
js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/market.js'

# 1. Patch market.html
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the filter popup content to only have the Urutkan Berdasarkan group
start_filter = content.find('<div class="filter-popup" id="filterPopup">')
end_filter = content.find('</div>\n            </div>', start_filter)

if start_filter != -1 and end_filter != -1:
    new_filter_popup = """<div class="filter-popup" id="filterPopup">
                <h3 class="filter-title">Atur Filter</h3>

                <div class="filter-group">
                  <div class="filter-header">
                    <h4>Urutkan Berdasarkan</h4>
                    <i class='bx bx-chevron-up'></i>
                  </div>
                  <div class="filter-select-wrapper">
                    <select class="filter-select-box" id="sortFilterSelect">
                      <option value="terbaru">Terbaru</option>
                      <option value="terlama">Terlama</option>
                    </select>
                  </div>
                </div>

                <div class="filter-actions">
                  <button class="btn-apply-filter" id="btnApplyMarketFilter">Terapkan Filter</button>
                  <button class="btn-clear-filter" id="btnClearMarketFilter">Batal</button>
                </div>
              </div>"""
    
    # We replace from start_filter to the closing div of filter-popup (before table container)
    # The end_filter should be `</div>\n            </div>` which closes filter-wrapper.
    content = content[:start_filter] + new_filter_popup + content[end_filter:]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("market.html patched with simplified filter.")


# 2. Patch market.js
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

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
            const sortVal = sortFilterSelect.value; // 'terbaru' or 'terlama'
            
            // Urutkan marketData berdasarkan urutan
            // Note: Data default mungkin tidak punya timestamp pasti, jadi kita balik array-nya
            // Terbaru = urutan index dibalik (karena item baru biasanya di-push ke bawah, atau punya ID lebih besar)
            // Terlama = urutan index awal
            
            // Asumsi: data awal adalah 'terlama' ke 'terbaru' (item terakhir = paling baru)
            marketData.sort((a, b) => {
                // Gunakan ID atau jika tidak ada, biarkan. 
                // Karena ID biasanya unik misal MKT-1234, kita parse angkanya
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
    js_content = js_content.replace('});\n\nfunction formatRupiah', js_addition + '\n});\n\nfunction formatRupiah')
    
    # If the replace fails, let's just append before the last '});'
    last_brace = js_content.rfind('});')
    if last_brace != -1:
        js_content = js_content[:last_brace] + js_addition + "\n" + js_content[last_brace:]
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("market.js patched with filter logic.")
