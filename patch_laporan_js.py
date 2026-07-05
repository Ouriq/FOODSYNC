import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/laporan.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Store totalNilai and show btnSendToFinance
target_str = "document.getElementById('repTotalNilaiBawah').textContent = 'Rp ' + totalNilaiStr;"
insert_str = """
        const btnSendToFinance = document.getElementById('btnSendToFinance');
        if (btnSendToFinance) {
            btnSendToFinance.style.display = 'inline-block';
            btnSendToFinance.dataset.total = totalNilai;
            btnSendToFinance.dataset.count = count;
        }
"""
content = content.replace(target_str, target_str + "\n" + insert_str)

# 2. Add event listener for btnSendToFinance
listener_str = """
    const btnSendToFinance = document.getElementById('btnSendToFinance');
    if (btnSendToFinance) {
      btnSendToFinance.addEventListener('click', () => {
        let total = parseInt(btnSendToFinance.dataset.total) || 0;
        let count = parseInt(btnSendToFinance.dataset.count) || 0;
        
        if (total <= 0) {
            showToast('Laporan tidak memiliki nilai penjualan!', '#ef4444');
            return;
        }
        
        let drafts = JSON.parse(localStorage.getItem('erp_finance_income_drafts') || '[]');
        const todayStr = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
        
        drafts.push({
            id: 'DRAFT-' + Date.now(),
            date: todayStr,
            sumber: 'Sales & Marketing',
            keterangan: 'Laporan Penjualan Otomatis (' + count + ' Transaksi)',
            nominal: total
        });
        
        localStorage.setItem('erp_finance_income_drafts', JSON.stringify(drafts));
        
        showToast('Laporan dikirim ke Finance sebagai Draft!', '#059669');
        btnSendToFinance.style.display = 'none'; // Sembunyikan setelah dikirim agar tidak dobel
      });
    }
"""

# Insert listener before DOMContentLoaded closing if possible, or just before dlPdfBtn
insert_listener_target = "if (dlPdfBtn) {"
if insert_listener_target in content:
    content = content.replace(insert_listener_target, listener_str + "\n    " + insert_listener_target)
else:
    content += "\n" + listener_str

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("laporan.js patched with send to finance logic.")
