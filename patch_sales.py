import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/sales.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Logic to inject
injection = """
        // --- INVENTORY DEDUCTION LOGIC ---
        if (typeof getInventoryStock === 'function' && typeof updateInventoryStock === 'function') {
            const currentStocks = getInventoryStock();
            orderData.products.forEach(p => {
                const dbItem = currentStocks.find(s => s.sku === p.sku);
                if (dbItem) {
                    const newStock = Math.max(0, dbItem.stock - p.quantity);
                    updateInventoryStock(p.sku, newStock);
                }
            });
        }
        // ---------------------------------
"""

target = "localStorage.setItem('sales_orders', JSON.stringify(salesOrders));"
if 'INVENTORY DEDUCTION LOGIC' not in content:
    content = content.replace(target, target + injection)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected stock deduction logic")
else:
    print("Already injected")
