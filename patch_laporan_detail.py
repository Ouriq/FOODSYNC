import os

html_path = 'c:/Users/thori/Latihan/foodsyncerp/laporanlaba.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CSS update for clickable IDs and Modal
css_additions = """
    .clickable-id {
      color: #2563EB;
      cursor: pointer;
      text-decoration: underline;
    }
    .clickable-id:hover {
      color: #1D4ED8;
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .modal-overlay.active {
      display: flex;
    }
    .modal-box {
      background: #fff;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 { margin: 0; font-size: 18px; color: #111827; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #6B7280; }
    .modal-body { padding: 24px; }
    .modal-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .modal-table th, .modal-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
    .modal-table th { background: #F9FAFB; font-weight: 600; color: #374151; }
    .limit-notice { text-align: center; color: #6B7280; font-size: 13px; margin: 10px 0; font-style: italic; }
    .btn-excel { background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 8px; }
    .btn-excel:hover { background: #059669; }
"""
if "/* MODAL STYLES */" not in content:
    content = content.replace('</style>', css_additions + '\n  </style>')

# 2. HTML Modal Injection
modal_html = """
  <!-- MODAL DETAIL LAPORAN -->
  <div class="modal-overlay" id="modalDetailLaporan">
    <div class="modal-box">
      <div class="modal-header">
        <h2 id="modalDetailTitle">Detail Laporan</h2>
        <button class="btn-close" id="btnCloseModal">&times;</button>
      </div>
      <div class="modal-body">
        <table class="modal-table">
          <thead>
            <tr>
              <th>No. SO</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Total Nilai (Rp)</th>
            </tr>
          </thead>
          <tbody id="tbody-modal"></tbody>
        </table>
        <div id="limitNotice" class="limit-notice" style="display: none;">Data dibatasi 10 baris. Silakan unduh excel untuk melihat seluruh data.</div>
        <div style="text-align: right; margin-top: 16px;">
          <button id="btnDownloadExcel" class="btn-excel" style="display: none;"><i class='bx bx-spreadsheet'></i> Unduh Excel (Muat Semua Data)</button>
        </div>
      </div>
    </div>
  </div>
"""
if 'id="modalDetailLaporan"' not in content:
    content = content.replace('</body>', modal_html + '\n</body>')

# 3. JS Updates: Make ID clickable and add modal logic
replace_td_riwayat = "<td><b>${item.id}</b></td>"
new_td_riwayat = "<td class='clickable-id' data-id='${item.id}' data-source='history'><b>${item.id}</b></td>"
content = content.replace(replace_td_riwayat, new_td_riwayat)

replace_td_draft = "<td><b>${item.id}</b></td>"
new_td_draft = "<td class='clickable-id' data-id='${item.id}' data-source='draft'><b>${item.id}</b></td>"
content = content.replace(replace_td_draft, new_td_draft)

# 4. JS Logic for opening Modal and Excel Download
modal_js_logic = """
    // --- DETAIL MODAL LOGIC ---
    const modalDetail = document.getElementById('modalDetailLaporan');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const tbodyModal = document.getElementById('tbody-modal');
    const limitNotice = document.getElementById('limitNotice');
    const btnDownloadExcel = document.getElementById('btnDownloadExcel');
    let currentModalData = null;

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => { modalDetail.classList.remove('active'); });
    window.addEventListener('click', (e) => { if(e.target === modalDetail) modalDetail.classList.remove('active'); });

    // Handle clicks on table wrapper (Delegation)
    const tableWrapper = document.querySelector('.table-wrapper');
    if (tableWrapper) {
        tableWrapper.addEventListener('click', (e) => {
            const clickable = e.target.closest('.clickable-id');
            if (clickable) {
                const id = clickable.getAttribute('data-id');
                const source = clickable.getAttribute('data-source');
                
                let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
                let history = JSON.parse(localStorage.getItem('erp_finance_income_history') || '[]');
                
                let targetItem = null;
                if (source === 'history') {
                    targetItem = history.find(x => x.id === id);
                } else {
                    targetItem = drafts.find(x => x.id === id);
                }

                if (targetItem) {
                    currentModalData = targetItem;
                    document.getElementById('modalDetailTitle').textContent = 'Detail Laporan: ' + targetItem.id;
                    
                    let orders = targetItem.orders || [];
                    tbodyModal.innerHTML = '';
                    
                    if (orders.length === 0) {
                        tbodyModal.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada detail transaksi (Laporan manual/lama).</td></tr>';
                        limitNotice.style.display = 'none';
                        btnDownloadExcel.style.display = 'none';
                    } else {
                        // Batasi max 10
                        const displayOrders = orders.slice(0, 10);
                        
                        displayOrders.forEach(o => {
                            const tr = document.createElement('tr');
                            const soNumber = o.soNumber || '-';
                            const date = new Date(o.createdAt || Date.now()).toLocaleDateString('id-ID');
                            const cust = o.customer ? o.customer.nama : 'Pelanggan';
                            
                            let total = 0;
                            if (typeof o.grandTotal === 'string') {
                                total = parseInt(o.grandTotal.replace(/[^0-9]/g, '')) || 0;
                            } else {
                                total = o.grandTotal || 0;
                            }
                            
                            tr.innerHTML = `
                                <td>${soNumber}</td>
                                <td>${date}</td>
                                <td>${cust}</td>
                                <td>Rp ${formatRupiah(total)}</td>
                            `;
                            tbodyModal.appendChild(tr);
                        });

                        if (orders.length > 10) {
                            limitNotice.style.display = 'block';
                            btnDownloadExcel.style.display = 'inline-flex';
                        } else {
                            limitNotice.style.display = 'none';
                            // Selalu tampilkan opsi unduh excel walau < 10 (sebagai opsi), tapi requirement user bilang jika melebihi 10 potong dan berikan opsi unduh. 
                            btnDownloadExcel.style.display = 'inline-flex'; 
                        }
                    }
                    modalDetail.classList.add('active');
                }
            }
        });
    }

    if (btnDownloadExcel) {
        btnDownloadExcel.addEventListener('click', () => {
            if (!currentModalData || !currentModalData.orders || currentModalData.orders.length === 0) return;
            
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "No. SO,Tanggal,Pelanggan,Wilayah,Total Nilai (Rp)\\n";
            
            currentModalData.orders.forEach(o => {
                const soNumber = o.soNumber || '-';
                const date = new Date(o.createdAt || Date.now()).toLocaleDateString('id-ID');
                const cust = o.customer ? o.customer.nama : '-';
                const wilayah = o.customer ? (o.customer.wilayah || o.customer.kota || '-') : '-';
                let total = 0;
                if (typeof o.grandTotal === 'string') {
                    total = parseInt(o.grandTotal.replace(/[^0-9]/g, '')) || 0;
                } else {
                    total = o.grandTotal || 0;
                }
                
                // Escape commas by quoting strings
                const safeCust = `"${cust}"`;
                const safeWilayah = `"${wilayah}"`;
                
                csvContent += `${soNumber},${date},${safeCust},${safeWilayah},${total}\\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Detail_Laporan_${currentModalData.id}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
"""

# Insert JS before closing </script> in laporanlaba.html
content = content.replace("  });\n</script>", modal_js_logic + "\n  });\n</script>")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('laporanlaba.html patched with detail modal and excel download.')
