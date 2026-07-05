import os
import re

file_path = 'c:/Users/thori/Latihan/foodsyncerp/budgeting.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

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
        
        nominal = parseInt(nominal).toLocaleString('id-ID');

        const today = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        const newId = 'REQ-' + Math.floor(Math.random() * 900 + 100);

        const tbodyPending = document.querySelector('#table-pending tbody');
        if (tbodyPending) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><b>${newId}</b></td>
              <td>${today}</td>
              <td>${divisi}</td>
              <td>${keperluan}</td>
              <td>Rp ${nominal}</td>
              <td><span class="status-badge status-pending" style="background:#FFF7ED; color:#EA580C; border-color:#FFEDD5;">Menunggu Dana</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn-action approve" title="Setujui"><i class='bx bx-check'></i></button>
                  <button class="btn-action reject" title="Tolak"><i class='bx bx-x'></i></button>
                </div>
              </td>
            `;
            tbodyPending.prepend(tr);
        }
        
        modal.style.display = 'none';
        formAlokasi.reset();
        
        if (tabPending) tabPending.click();
      });
    }

    // EVENT DELEGATION UNTUK TOMBOL AKSI (Support dinamis)
    const tablePendingBody = document.querySelector('#table-pending tbody');
    if (tablePendingBody) {
        tablePendingBody.addEventListener('click', function(e) {
            const approveBtn = e.target.closest('.btn-action.approve');
            const rejectBtn = e.target.closest('.btn-action.reject');

            if (approveBtn) {
                const row = approveBtn.closest('tr');
                const badge = row.querySelector('.status-badge');
                badge.className = 'status-badge status-approved';
                badge.textContent = 'Disetujui';
                badge.style.backgroundColor = '#ecfdf5';
                badge.style.color = '#059669';
                badge.style.borderColor = '#059669';
                approveBtn.parentElement.innerHTML = '<span style="color:#059669; font-size:14px; font-weight:600;"><i class="bx bx-check-circle"></i> Selesai</span>';
                
                setTimeout(() => {
                    const tbodyRiwayat = document.getElementById('tbody-riwayat');
                    if (tbodyRiwayat) {
                        const newRow = row.cloneNode(true);
                        newRow.querySelector('td:last-child').remove();
                        tbodyRiwayat.prepend(newRow);
                        row.remove(); 
                    }
                }, 1500);
            } else if (rejectBtn) {
                const row = rejectBtn.closest('tr');
                const badge = row.querySelector('.status-badge');
                badge.className = 'status-badge status-pending';
                badge.style.backgroundColor = '#fef2f2';
                badge.style.color = '#ef4444';
                badge.style.borderColor = '#fca5a5';
                badge.textContent = 'Ditolak';
                rejectBtn.parentElement.innerHTML = '<span style="color:#ef4444; font-size:14px; font-weight:600;"><i class="bx bx-x-circle"></i> Selesai</span>';
            }
        });
    }

  });
</script>
'''

content = re.sub(r'<script>\s*document\.addEventListener\(\'DOMContentLoaded\'.*?</script>', new_script, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated js in budgeting.html')
