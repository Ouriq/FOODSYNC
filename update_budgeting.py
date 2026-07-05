import os
import re

file_path = 'c:/Users/thori/Latihan/foodsyncerp/budgeting.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Modal CSS and HTML
modal_css = '''
    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-content {
      background: white; border-radius: 12px; padding: 24px; width: 450px; max-width: 90%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .modal-title { font-size: 18px; font-weight: 700; color: var(--text-main); }
    .close-modal { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; }
    .form-select { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: white; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { background: white; border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
'''
if '.modal-overlay' not in content:
    content = content.replace('</style>', modal_css + '</style>')

# Replace Tabs HTML
tabs_html = '''
        <div class="tabs">
          <div class="tab active" id="tab-pending">Permintaan Masuk (Pending)</div>
          <div class="tab" id="tab-riwayat">Riwayat Alokasi</div>
        </div>
'''
if 'id="tab-pending"' not in content:
    content = content.replace('<div class="tabs">\n          <div class="tab active">Permintaan Masuk (Pending)</div>\n          <div class="tab">Riwayat Alokasi</div>\n        </div>', tabs_html)

# Add id to tables
if '<table id="table-pending">' not in content:
    content = content.replace('<table>', '<table id="table-pending">', 1)

# Add Riwayat Table
riwayat_table = '''
        <table id="table-riwayat" style="display: none;">
          <thead>
            <tr>
              <th>ID Request</th>
              <th>Tanggal</th>
              <th>Divisi</th>
              <th>Keperluan</th>
              <th>Nominal (Rp)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tbody-riwayat">
            <tr>
              <td><b>REQ-000</b></td>
              <td>01 Jul 2026</td>
              <td>Sales & Marketing</td>
              <td>Iklan Awal Bulan</td>
              <td>Rp 10.000.000</td>
              <td><span class="status-badge status-approved" style="background:#ecfdf5; color:#059669;">Disetujui</span></td>
            </tr>
          </tbody>
        </table>
'''
if 'id="table-riwayat"' not in content:
    content = content.replace('</table>', '</table>\n' + riwayat_table, 1)

# Add Modal HTML
modal_html = '''
  <div id="modal-alokasi" class="modal-overlay" style="display: none;">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Buat Alokasi Baru</h2>
        <button class="close-modal">&times;</button>
      </div>
      <form id="form-alokasi">
        <div class="form-group">
          <label class="form-label">Divisi Tujuan</label>
          <select class="form-select" id="input-divisi" required>
            <option value="Purchasing">Purchasing</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Production">Production</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Keperluan</label>
          <input type="text" class="form-input" id="input-keperluan" placeholder="Contoh: Pembelian operasional" required />
        </div>
        <div class="form-group">
          <label class="form-label">Nominal (Rp)</label>
          <input type="number" class="form-input" id="input-nominal" placeholder="Contoh: 5000000" required />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary close-modal">Batal</button>
          <button type="submit" class="btn-primary">Simpan Alokasi</button>
        </div>
      </form>
    </div>
  </div>
'''
if 'id="modal-alokasi"' not in content:
    content = content.replace('</main>', modal_html + '\n    </main>')

# Replace Javascript logic
new_script = '''
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // TAB LOGIC
    const tabPending = document.getElementById('tab-pending');
    const tabRiwayat = document.getElementById('tab-riwayat');
    const tablePending = document.getElementById('table-pending');
    const tableRiwayat = document.getElementById('table-riwayat');

    if(tabPending && tabRiwayat) {
      tabPending.addEventListener('click', () => {
        tabPending.classList.add('active');
        tabRiwayat.classList.remove('active');
        tablePending.style.display = 'table';
        tableRiwayat.style.display = 'none';
      });
      tabRiwayat.addEventListener('click', () => {
        tabRiwayat.classList.add('active');
        tabPending.classList.remove('active');
        tableRiwayat.style.display = 'table';
        tablePending.style.display = 'none';
      });
    }

    // MODAL LOGIC
    const modal = document.getElementById('modal-alokasi');
    const btnAlokasi = document.querySelector('.btn-primary'); // Buat Alokasi Baru
    const closeBtns = document.querySelectorAll('.close-modal');

    if (btnAlokasi && modal) {
      btnAlokasi.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    });

    // FORM SUBMIT
    const formAlokasi = document.getElementById('form-alokasi');
    if (formAlokasi) {
      formAlokasi.addEventListener('submit', (e) => {
        e.preventDefault();
        const divisi = document.getElementById('input-divisi').value;
        const keperluan = document.getElementById('input-keperluan').value;
        let nominal = document.getElementById('input-nominal').value;
        
        // Format nominal
        nominal = parseInt(nominal).toLocaleString('id-ID');

        const today = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        const newId = 'REQ-' + Math.floor(Math.random() * 900 + 100);

        const tbodyRiwayat = document.getElementById('tbody-riwayat');
        if (tbodyRiwayat) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><b>${newId}</b></td>
              <td>${today}</td>
              <td>${divisi}</td>
              <td>${keperluan}</td>
              <td>Rp ${nominal}</td>
              <td><span class="status-badge status-approved" style="background:#ecfdf5; color:#059669;">Disetujui</span></td>
            `;
            tbodyRiwayat.prepend(tr);
        }
        
        modal.style.display = 'none';
        formAlokasi.reset();
        
        // Auto switch to Riwayat tab to see result
        if (tabRiwayat) tabRiwayat.click();
      });
    }

    // Tombol Setujui
    document.querySelectorAll('.btn-action.approve').forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const badge = row.querySelector('.status-badge');
        badge.className = 'status-badge status-approved';
        badge.textContent = 'Disetujui';
        badge.style.backgroundColor = '#ecfdf5';
        badge.style.color = '#059669';
        this.parentElement.innerHTML = '<span style="color:#059669; font-size:14px; font-weight:600;"><i class="bx bx-check-circle"></i> Selesai</span>';
        
        // Move row to Riwayat after a short delay
        setTimeout(() => {
            const tbodyRiwayat = document.getElementById('tbody-riwayat');
            if (tbodyRiwayat) {
                const newRow = row.cloneNode(true);
                newRow.querySelector('td:last-child').remove(); // remove aksi column
                tbodyRiwayat.prepend(newRow);
                row.remove(); // remove from pending
            }
        }, 1500);
      });
    });

    // Tombol Tolak
    document.querySelectorAll('.btn-action.reject').forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const badge = row.querySelector('.status-badge');
        badge.className = 'status-badge status-pending';
        badge.style.backgroundColor = '#fef2f2';
        badge.style.color = '#ef4444';
        badge.textContent = 'Ditolak';
        this.parentElement.innerHTML = '<span style="color:#ef4444; font-size:14px; font-weight:600;"><i class="bx bx-x-circle"></i> Selesai</span>';
      });
    });
  });
</script>
'''

content = re.sub(r'<script>\s*document\.addEventListener\(\'DOMContentLoaded\'.*?</script>', new_script, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated budgeting.html logic')
