import os
import re

html_path = 'c:/Users/thori/Latihan/foodsyncerp/budgeting.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the static tbody contents with empty bodies so JS can render them
content = re.sub(r'<tbody>.*?</tbody>', '<tbody id="tbody-pending"></tbody>', content, flags=re.DOTALL, count=1)
content = re.sub(r'<tbody id="tbody-riwayat">.*?</tbody>', '<tbody id="tbody-riwayat"></tbody>', content, flags=re.DOTALL)

# Now, we need to rewrite the JS part
js_start_idx = content.find("<script>\n  document.addEventListener('DOMContentLoaded', () => {")
js_end_idx = content.find("</script>", js_start_idx)

new_js = """<script>
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
    const btnAlokasi = document.querySelector('.btn-primary'); 
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

    // DATA STORAGE & RENDERING
    const defaultData = [
      { id: 'REQ-001', date: '12 Jul 2026', divisi: 'Purchasing', keperluan: 'Belanja Bahan Baku (Tepung 500kg)', nominal: 8500000, status: 'pending' },
      { id: 'REQ-002', date: '11 Jul 2026', divisi: 'Sales & Marketing', keperluan: 'Iklan Social Media & Billboard (Q3)', nominal: 25000000, status: 'pending' },
      { id: 'REQ-000', date: '01 Jul 2026', divisi: 'Sales & Marketing', keperluan: 'Iklan Awal Bulan', nominal: 10000000, status: 'approved' }
    ];

    let allocations = JSON.parse(localStorage.getItem('erp_finance_allocations'));
    if (!allocations) {
      allocations = defaultData;
      localStorage.setItem('erp_finance_allocations', JSON.stringify(allocations));
    }

    const tbodyPending = document.getElementById('tbody-pending');
    const tbodyRiwayat = document.getElementById('tbody-riwayat');

    function formatRupiah(num) {
      return num.toLocaleString('id-ID');
    }

    function renderTables() {
      if (!tbodyPending || !tbodyRiwayat) return;
      tbodyPending.innerHTML = '';
      tbodyRiwayat.innerHTML = '';

      allocations.forEach(item => {
        const tr = document.createElement('tr');
        if (item.status === 'pending') {
          tr.innerHTML = `
            <td><b>${item.id}</b></td>
            <td>${item.date}</td>
            <td>${item.divisi}</td>
            <td>${item.keperluan}</td>
            <td>Rp ${formatRupiah(item.nominal)}</td>
            <td><span class="status-badge status-pending" style="background:#FFF7ED; color:#EA580C; border-color:#FFEDD5;">Menunggu Dana</span></td>
            <td>
              <div class="action-btns">
                <button class="btn-action approve" data-id="${item.id}" title="Setujui"><i class='bx bx-check'></i></button>
                <button class="btn-action reject" data-id="${item.id}" title="Tolak"><i class='bx bx-x'></i></button>
              </div>
            </td>
          `;
          tbodyPending.appendChild(tr);
        } else {
          let badge = '';
          if (item.status === 'approved') {
             badge = '<span class="status-badge status-approved" style="background:#ecfdf5; color:#059669;">Disetujui</span>';
          } else {
             badge = '<span class="status-badge status-rejected" style="background:#fef2f2; color:#dc2626;">Ditolak</span>';
          }
          tr.innerHTML = `
            <td><b>${item.id}</b></td>
            <td>${item.date}</td>
            <td>${item.divisi}</td>
            <td>${item.keperluan}</td>
            <td>Rp ${formatRupiah(item.nominal)}</td>
            <td>${badge}</td>
          `;
          tbodyRiwayat.appendChild(tr);
        }
      });
    }

    renderTables();

    // APPROVE & REJECT ACTIONS
    if (tbodyPending) {
      tbodyPending.addEventListener('click', (e) => {
        const btnApprove = e.target.closest('.approve');
        const btnReject = e.target.closest('.reject');
        
        if (btnApprove) {
          const id = btnApprove.getAttribute('data-id');
          if (confirm('Setujui alokasi dana ini?')) {
            const idx = allocations.findIndex(a => a.id === id);
            if(idx !== -1) allocations[idx].status = 'approved';
            localStorage.setItem('erp_finance_allocations', JSON.stringify(allocations));
            renderTables();
            
            // Dispatch storage event manually for other tabs
            window.dispatchEvent(new Event('storage'));
          }
        }
        
        if (btnReject) {
          const id = btnReject.getAttribute('data-id');
          if (confirm('Tolak alokasi dana ini?')) {
            const idx = allocations.findIndex(a => a.id === id);
            if(idx !== -1) allocations[idx].status = 'rejected';
            localStorage.setItem('erp_finance_allocations', JSON.stringify(allocations));
            renderTables();
          }
        }
      });
    }

    // FORM SUBMIT
    const formAlokasi = document.getElementById('form-alokasi');
    if (formAlokasi) {
      formAlokasi.addEventListener('submit', (e) => {
        e.preventDefault();
        const divisi = document.getElementById('input-divisi').value;
        const keperluan = document.getElementById('input-keperluan').value;
        const nominal = parseInt(document.getElementById('input-nominal').value);
        
        const today = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        const newId = 'REQ-' + Math.floor(Math.random() * 900 + 100);

        allocations.push({
          id: newId,
          date: today,
          divisi: divisi,
          keperluan: keperluan,
          nominal: nominal,
          status: 'pending'
        });

        localStorage.setItem('erp_finance_allocations', JSON.stringify(allocations));
        renderTables();
        formAlokasi.reset();
        modal.style.display = 'none';
        
        // Simulasikan notifikasi sukses
        if(typeof showToast === 'function') {
          showToast('Alokasi berhasil ditambahkan (Pending)');
        } else {
          alert('Alokasi berhasil ditambahkan dan berstatus Pending.');
        }
      });
    }
  });
"""

content = content[:js_start_idx] + new_js + content[js_end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("budgeting.html patched with localStorage logic!")
