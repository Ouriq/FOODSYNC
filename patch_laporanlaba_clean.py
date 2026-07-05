import os
import re

html_path = 'c:/Users/thori/Latihan/foodsyncerp/laporanlaba.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean up the duplicate script blocks
# Let's find all script blocks and rewrite the javascript part completely.
# We will locate the start of the first script block and the end of the last one.
start_script = content.find('<script src="js/topbar.js?v=3"></script>')
if start_script != -1:
    end_script = content.find('<!-- MODAL DETAIL LAPORAN -->')
    if end_script == -1:
        end_script = content.rfind('</body>')
    
    # We will replace everything from start_script to end_script with a clean, unified script.
    
    clean_js = """
  <script src="js/topbar.js?v=3"></script>

  <script>
    function formatRupiah(num) {
        return parseInt(num).toLocaleString('id-ID');
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Tombol Export PDF
        const btnExport = document.querySelector('.btn-outline');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                alert('File PDF sedang diunduh...');
            });
        }

        const tabRiwayat = document.getElementById('tab-riwayat-laba');
        const tabDraft = document.getElementById('tab-draft-laba');
        const tableRiwayat = document.getElementById('table-riwayat');
        const tableDraft = document.getElementById('table-draft');
        const title = document.getElementById('table-title');
        
        if (tabRiwayat && tabDraft) {
            tabRiwayat.addEventListener('click', () => {
                tabRiwayat.classList.add('active');
                tabDraft.classList.remove('active');
                tableRiwayat.style.display = 'table';
                tableDraft.style.display = 'none';
                title.textContent = 'Riwayat Pemasukan Resmi';
            });
            tabDraft.addEventListener('click', () => {
                tabDraft.classList.add('active');
                tabRiwayat.classList.remove('active');
                tableDraft.style.display = 'table';
                tableRiwayat.style.display = 'none';
                title.textContent = 'Menunggu Persetujuan Finance';
            });
        }

        const defaultHistory = [
            { id: 'INC-089', date: '10 Jul 2026', sumber: 'Sales & Marketing', keterangan: 'Penjualan Ritel Cabang Jakarta', nominal: 45000000 },
            { id: 'INC-088', date: '05 Jul 2026', sumber: 'Sales & Marketing', keterangan: 'Distribusi B2B ke Supermarket', nominal: 30400000 },
            { id: 'INC-087', date: '01 Jul 2026', sumber: 'Sales & Marketing', keterangan: 'Pemesanan Katering Event', nominal: 15000000 }
        ];

        let historyData = JSON.parse(localStorage.getItem('erp_finance_income_history'));
        if (!historyData) {
            historyData = defaultHistory;
            localStorage.setItem('erp_finance_income_history', JSON.stringify(historyData));
        }

        function renderTables() {
            const tbodyRiwayat = document.getElementById('tbody-riwayat');
            const tbodyDraft = document.getElementById('tbody-draft');
            
            let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
            let history = JSON.parse(localStorage.getItem('erp_finance_income_history') || '[]');

            if (tbodyRiwayat) {
                tbodyRiwayat.innerHTML = '';
                history.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                      <td class="clickable-id" data-id="${item.id}" data-source="history"><b>${item.id}</b></td>
                      <td>${item.date}</td>
                      <td>${item.sumber}</td>
                      <td>${item.keterangan}</td>
                      <td class="amount" style="color: #059669; font-weight: bold;">+ Rp ${formatRupiah(item.nominal)}</td>
                      <td>
                          <div style="display:flex; align-items:center; gap:8px;">
                              <span class="status-badge status-completed" style="background:#ecfdf5; color:#059669; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Tercatat</span>
                              <button class="btn-action delete-history" data-id="${item.id}" title="Hapus Laporan" style="border:none; background:transparent; color:#EF4444; cursor:pointer;"><i class='bx bx-trash'></i></button>
                          </div>
                      </td>
                    `;
                    tbodyRiwayat.appendChild(tr);
                });
            }

            if (tbodyDraft) {
                tbodyDraft.innerHTML = '';
                if (drafts.length === 0) {
                    tbodyDraft.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#6b7280;">Tidak ada draft laporan masuk.</td></tr>';
                } else {
                    drafts.forEach(item => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                          <td class="clickable-id" data-id="${item.id}" data-source="draft"><b>${item.id}</b></td>
                          <td>${item.date}</td>
                          <td>${item.sumber}</td>
                          <td>${item.keterangan}</td>
                          <td class="amount" style="color: #d97706; font-weight: bold;">Rp ${formatRupiah(item.nominal)}</td>
                          <td style="text-align: right;">
                              <div class="action-btns">
                                <button class="btn-action approve" data-id="${item.id}" title="Terima & Masukkan Laba"><i class='bx bx-check'></i></button>
                                <button class="btn-action reject" data-id="${item.id}" title="Tolak"><i class='bx bx-x'></i></button>
                              </div>
                          </td>
                        `;
                        tbodyDraft.appendChild(tr);
                    });
                }
            }
        }

        renderTables();
        window.addEventListener('storage', (e) => {
            if (e.key === 'erp_finance_income_drafts') renderTables();
        });

        // Event Delegation for Table Wrapper
        const tableWrapper = document.querySelector('.table-wrapper');
        const modalDetail = document.getElementById('modalDetailLaporan');
        const btnCloseModal = document.getElementById('btnCloseModal');
        const tbodyModal = document.getElementById('tbody-modal');
        const limitNotice = document.getElementById('limitNotice');
        const btnDownloadExcel = document.getElementById('btnDownloadExcel');
        let currentModalData = null;

        if (btnCloseModal) btnCloseModal.addEventListener('click', () => { modalDetail.classList.remove('active'); });
        window.addEventListener('click', (e) => { if(e.target === modalDetail) modalDetail.classList.remove('active'); });

        if (tableWrapper) {
            tableWrapper.addEventListener('click', (e) => {
                let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
                let history = JSON.parse(localStorage.getItem('erp_finance_income_history') || '[]');
                
                // 1. APPROVE / REJECT DRAFT
                const btnApprove = e.target.closest('.approve');
                const btnReject = e.target.closest('.reject');
                
                if (btnApprove) {
                    const id = btnApprove.getAttribute('data-id');
                    const idx = drafts.findIndex(d => d.id === id);
                    if (idx !== -1) {
                        if (confirm('Terima laporan ini dan catat sebagai Pemasukan Resmi?')) {
                            let item = drafts[idx];
                            drafts.splice(idx, 1);
                            const newId = 'INC-' + Math.floor(Math.random() * 900 + 100);
                            item.id = newId;
                            item.date = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
                            history.unshift(item);
                            
                            localStorage.setItem('erp_finance_income_drafts', JSON.stringify(drafts));
                            localStorage.setItem('erp_finance_income_history', JSON.stringify(history));
                            renderTables();
                            if(typeof showToast === 'function') showToast('Laporan berhasil diterima dan dicatat!', '#059669');
                        }
                    }
                    return;
                }
                
                if (btnReject) {
                    const id = btnReject.getAttribute('data-id');
                    const idx = drafts.findIndex(d => d.id === id);
                    if (idx !== -1) {
                        if (confirm('Tolak laporan ini?')) {
                            drafts.splice(idx, 1);
                            localStorage.setItem('erp_finance_income_drafts', JSON.stringify(drafts));
                            renderTables();
                        }
                    }
                    return;
                }

                // 2. DELETE HISTORY
                const btnDelete = e.target.closest('.delete-history');
                if (btnDelete) {
                    const id = btnDelete.getAttribute('data-id');
                    const idx = history.findIndex(d => d.id === id);
                    if (idx !== -1) {
                        if (confirm('Hapus laporan pemasukan resmi ini dari riwayat? Data tidak bisa dikembalikan.')) {
                            history.splice(idx, 1);
                            localStorage.setItem('erp_finance_income_history', JSON.stringify(history));
                            renderTables();
                        }
                    }
                    return;
                }

                // 3. OPEN MODAL DETAIL
                const clickable = e.target.closest('.clickable-id');
                if (clickable) {
                    const id = clickable.getAttribute('data-id');
                    const source = clickable.getAttribute('data-source');
                    
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
    });
  </script>
"""
    
    content = content[:start_script] + clean_js + "\n" + content[end_script:]
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("laporanlaba.html successfully cleaned and updated.")
else:
    print("Could not find script start marker.")
