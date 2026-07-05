import os
import re

# 1. Update sales.html to include db.js
html_path = 'c:/Users/thori/Latihan/foodsyncerp/sales.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

if '<script src="js/db.js"></script>' not in content:
    content = content.replace('<script src="js/sales.js?v=6"></script>', '<script src="js/db.js"></script>\n  <script src="js/sales.js?v=6"></script>')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected db.js into sales.html")

# 2. Append synchronization logic to js/sales.js
js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/sales.js'
sync_script = """
// --- SYNC WITH INVENTORY DB ---
document.addEventListener('DOMContentLoaded', () => {
    function syncWithInventory() {
        if (typeof getInventoryStock === 'function') {
            const stocks = getInventoryStock();
            const productItems = document.querySelectorAll('.product-item');
            productItems.forEach(item => {
                const skuEl = item.querySelector('.sku');
                if (skuEl) {
                    const skuText = skuEl.textContent.trim();
                    const dbItem = stocks.find(s => s.sku === skuText);
                    if (dbItem) {
                        // Update Stock Status Text
                        const statusEl = item.querySelector('.status-ok') || item.querySelector('.status-warn');
                        if (statusEl) {
                            statusEl.textContent = `Tersedia (Stok: ${dbItem.stock})`;
                            statusEl.className = dbItem.stock < 500 ? 'status-warn' : 'status-ok';
                            if (dbItem.stock < 500) statusEl.style.color = '#EA580C';
                            else statusEl.style.color = '#059669';
                        }
                        // Update Price
                        item.dataset.price = dbItem.price;
                        const priceEl = item.querySelector('.prod-price');
                        if (priceEl) priceEl.textContent = 'Rp ' + dbItem.price.toLocaleString('id-ID');
                        
                        // Update Max Qty
                        const inputQty = item.querySelector('.input-qty');
                        if (inputQty) {
                            inputQty.max = dbItem.stock;
                            if (parseInt(inputQty.value) > dbItem.stock) {
                                inputQty.value = dbItem.stock;
                            }
                        }
                    }
                }
            });
            if (typeof updateAllSubtotals === 'function') {
                updateAllSubtotals();
            }
        }
    }
    
    syncWithInventory();
    
    // Listen for storage events to update real-time
    window.addEventListener('storage', (e) => {
        if (e.key === 'erp_inventory_stock') {
            syncWithInventory();
        }
    });
});
"""

with open(js_path, 'a', encoding='utf-8') as f:
    f.write(sync_script)
print("Injected sync logic into js/sales.js")
