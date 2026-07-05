import re
import os

file_path = 'c:/Users/thori/Latihan/foodsyncerp/datastok.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the tbody
tbody_pattern = re.compile(r'<tbody>.*?</tbody>', re.DOTALL)
new_tbody = '<tbody id="inventory-tbody"></tbody>'
content = tbody_pattern.sub(new_tbody, content, count=1)

# Include db.js and the rendering script
script_injection = '''
  <script src="js/db.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      function renderInventory() {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;
        const data = getInventoryStock();
        tbody.innerHTML = '';
        data.forEach(item => {
          let stockStatus = item.stock < 500 ? '<span class="pill pill-red">Kritis</span>' : '<span class="pill pill-green">Aman</span>';
          let tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td><span class="pill ${item.statusClass}">${item.type}</span></td>
            <td>${item.unit}</td>
            <td class="text-green">${item.stock.toLocaleString('id-ID')}</td>
            <td>${stockStatus}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      renderInventory();
      
      // Auto refresh if DB updates
      window.addEventListener('storage', (e) => {
        if (e.key === 'erp_inventory_stock') {
          renderInventory();
        }
      });
    });
  </script>
'''

if 'js/db.js' not in content:
    content = content.replace('</body>', script_injection + '\n</body>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated datastok.html')
