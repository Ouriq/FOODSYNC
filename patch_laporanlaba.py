import os

html_path = 'c:/Users/thori/Latihan/foodsyncerp/laporanlaba.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject Tab Styles
css_tabs = """
    .tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding: 0 24px;
    }
    .tab {
      padding: 12px 16px;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-muted);
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab.active {
      color: var(--secondary-color);
      border-bottom-color: var(--secondary-color);
    }
    .tab:hover:not(.active) {
      color: var(--text-main);
    }
    .action-btns {
      display: flex; gap: 8px; align-items: center; justify-content: flex-end;
    }
    .btn-action {
      background: none; border: 1px solid #E5E7EB; border-radius: 6px;
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: 0.2s; color: #4B5563;
    }
    .btn-action.approve:hover { background: #ECFDF5; color: #059669; border-color: #059669; }
    .btn-action.reject:hover { background: #FEF2F2; color: #DC2626; border-color: #DC2626; }
"""
if ".tabs {" not in content:
    content = content.replace('</style>', css_tabs + '\n  </style>')

# 2. Modify the Table Wrapper
old_table_wrapper = content[content.find('<div class="table-wrapper">'):content.find('</main>')]

new_table_wrapper = """<div class="table-wrapper">
        <div class="tabs">
          <div class="tab active" id="tab-riwayat-laba">Riwayat Pemasukan</div>
          <div class="tab" id="tab-draft-laba">Draft Laporan Masuk</div>
        </div>

        <div class="table-header-box" style="padding: 0 24px 16px 24px; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="table-title">Riwayat Pemasukan Resmi</h3>
          <div class="search-box">
            <i class='bx bx-search' style="color: #6b7280;"></i>
            <input type="text" placeholder="Cari ID Laporan / Divisi...">
          </div>
        </div>
        
        <table id="table-riwayat">
          <thead>
            <tr>
              <th>ID Laporan</th>
              <th>Tanggal Terima</th>
              <th>Sumber</th>
              <th>Keterangan</th>
              <th>Pendapatan (Rp)</th>
              <th>Status Buku</th>
            </tr>
          </thead>
          <tbody id="tbody-riwayat"></tbody>
        </table>

        <table id="table-draft" style="display: none;">
          <thead>
            <tr>
              <th>ID Draft</th>
              <th>Tanggal Dikirim</th>
              <th>Sumber</th>
              <th>Keterangan</th>
              <th>Nilai Laporan (Rp)</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody id="tbody-draft"></tbody>
        </table>
      </div>
"""
content = content.replace(old_table_wrapper, new_table_wrapper + "\n\n    ")

# 3. Add Javascript Logic
js_logic = """
<script>
  document.addEventListener('DOMContentLoaded', () => {
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

    function formatRupiah(num) {
      return parseInt(num).toLocaleString('id-ID');
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
                  <td><b>${item.id}</b></td>
                  <td>${item.date}</td>
                  <td>${item.sumber}</td>
                  <td>${item.keterangan}</td>
                  <td class="amount" style="color: #059669; font-weight: bold;">+ Rp ${formatRupiah(item.nominal)}</td>
                  <td><span class="status-badge status-completed" style="background:#ecfdf5; color:#059669; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:bold;">Tercatat</span></td>
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
                      <td><b>${item.id}</b></td>
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

    const tbodyDraft = document.getElementById('tbody-draft');
    if (tbodyDraft) {
        tbodyDraft.addEventListener('click', (e) => {
            const btnApprove = e.target.closest('.approve');
            const btnReject = e.target.closest('.reject');
            let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
            let history = JSON.parse(localStorage.getItem('erp_finance_income_history') || '[]');
            
            if (btnApprove) {
                const id = btnApprove.getAttribute('data-id');
                const idx = drafts.findIndex(d => d.id === id);
                if (idx !== -1) {
                    if (confirm('Terima laporan ini dan catat sebagai Pemasukan Resmi?')) {
                        let item = drafts[idx];
                        drafts.splice(idx, 1);
                        // Generate new INC-XXX ID
                        const newId = 'INC-' + Math.floor(Math.random() * 900 + 100);
                        item.id = newId;
                        item.date = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
                        
                        // Add to history at the top
                        history.unshift(item);
                        
                        localStorage.setItem('erp_finance_income_drafts', JSON.stringify(drafts));
                        localStorage.setItem('erp_finance_income_history', JSON.stringify(history));
                        renderTables();
                        if(typeof showToast === 'function') showToast('Laporan berhasil diterima dan dicatat!', '#059669');
                    }
                }
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
            }
        });
    }

  });
</script>
"""

content = content.replace('<script>', js_logic + '\n<script>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("laporanlaba.html patched.")
