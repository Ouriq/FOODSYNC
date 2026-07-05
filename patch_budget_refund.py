import os
import re

html_path = 'c:/Users/thori/Latihan/foodsyncerp/budgeting.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add tab
tab_replace = '<div class="tab" id="tab-riwayat">Riwayat Alokasi</div>\n          <div class="tab" id="tab-refund">Sisa Dana (Refund)</div>'
content = content.replace('<div class="tab" id="tab-riwayat">Riwayat Alokasi</div>', tab_replace)

# 2. Add refund table
table_riwayat_end = content.find('</table>', content.find('<table id="table-riwayat"')) + 8
refund_table = """
        <table id="table-refund" style="display: none;">
          <thead>
            <tr>
              <th>Bulan/Tahun</th>
              <th>Tanggal Refund</th>
              <th>Divisi Asal</th>
              <th>Nominal Dikembalikan (Rp)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tbody-refund"></tbody>
        </table>
"""
content = content[:table_riwayat_end] + refund_table + content[table_riwayat_end:]

# 3. Update JavaScript logic
js_tab_logic = """
    const tabPending = document.getElementById('tab-pending');
    const tabRiwayat = document.getElementById('tab-riwayat');
    const tabRefund = document.getElementById('tab-refund');
    const tablePending = document.getElementById('table-pending');
    const tableRiwayat = document.getElementById('table-riwayat');
    const tableRefund = document.getElementById('table-refund');

    if(tabPending && tabRiwayat && tabRefund) {
      function resetTabs() {
        tabPending.classList.remove('active');
        tabRiwayat.classList.remove('active');
        tabRefund.classList.remove('active');
        tablePending.style.display = 'none';
        tableRiwayat.style.display = 'none';
        tableRefund.style.display = 'none';
      }

      tabPending.addEventListener('click', () => {
        resetTabs();
        tabPending.classList.add('active');
        tablePending.style.display = 'table';
      });
      tabRiwayat.addEventListener('click', () => {
        resetTabs();
        tabRiwayat.classList.add('active');
        tableRiwayat.style.display = 'table';
      });
      tabRefund.addEventListener('click', () => {
        resetTabs();
        tabRefund.classList.add('active');
        tableRefund.style.display = 'table';
      });
    }
"""

# Replace old tab logic
old_tab_start = content.find("const tabPending = document.getElementById('tab-pending');")
old_tab_end = content.find("// MODAL LOGIC")
content = content[:old_tab_start] + js_tab_logic + "\n    " + content[old_tab_end:]

# 4. Add rendering logic for refund table
render_logic = """
    const tbodyRefund = document.getElementById('tbody-refund');
    let returns = JSON.parse(localStorage.getItem('erp_finance_returns')) || [];

    function renderRefundTable() {
      if (!tbodyRefund) return;
      tbodyRefund.innerHTML = '';
      
      returns.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${item.month}</b></td>
          <td>${item.date}</td>
          <td>${item.divisi}</td>
          <td style="color: #059669; font-weight: bold;">+ Rp ${formatRupiah(item.nominal)}</td>
          <td><span class="status-badge status-approved" style="background:#ecfdf5; color:#059669;">Diterima Kas</span></td>
        `;
        tbodyRefund.appendChild(tr);
      });
    }

    renderRefundTable();
"""

render_tables_end = content.find("renderTables();") + len("renderTables();")
content = content[:render_tables_end] + "\n" + render_logic + content[render_tables_end:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to budgeting.html")
