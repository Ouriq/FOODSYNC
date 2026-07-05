import os

# 1. Update sales.js to ignore spaces in SKU
js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/sales.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace sku matching in syncWithInventory
content = content.replace(
    'const skuText = skuEl.textContent.trim();',
    'const skuText = skuEl.textContent.replace(/\\s+/g, "").trim();'
)
# Note: dbItem matching uses s.sku, we need to strip spaces from it too.
content = content.replace(
    'const dbItem = stocks.find(s => s.sku === skuText);',
    'const dbItem = stocks.find(s => s.sku.replace(/\\s+/g, "") === skuText);'
)

# Replace sku matching in the deduction logic
content = content.replace(
    'const dbItem = currentStocks.find(s => s.sku === p.sku);',
    'const pSku = p.sku.replace(/\\s+/g, ""); const dbItem = currentStocks.find(s => s.sku.replace(/\\s+/g, "") === pSku);'
)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update db.js to ignore spaces in SKU
db_path = 'c:/Users/thori/Latihan/foodsyncerp/js/db.js'
with open(db_path, 'r', encoding='utf-8') as f:
    db_content = f.read()

db_content = db_content.replace(
    'let item = data.find(i => i.sku === sku);',
    'let item = data.find(i => i.sku.replace(/\\s+/g, "") === sku.replace(/\\s+/g, ""));'
)

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(db_content)

print('Patched SKU matching logic to ignore spaces.')
