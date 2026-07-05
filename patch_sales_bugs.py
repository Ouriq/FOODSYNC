import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/sales.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix hasOrdered logic
old_hasOrdered = "let hasOrdered = salesOrders.some(so => so.status === 'processed' && so.customer?.id && so.customer?.id === orderData.customer?.id);"
new_hasOrdered = """
        let custId = orderData.customer?.id || orderData.customer?.idDist || orderData.customer?.nama;
        let hasOrdered = salesOrders.some(so => {
            let soId = so.customer?.id || so.customer?.idDist || so.customer?.nama;
            return so.status === 'processed' && soId === custId && !!custId;
        });
"""
content = content.replace(old_hasOrdered, new_hasOrdered)

# 2. Add 'input' event listener to .input-qty so typed values update subtotal
input_logic = """
  // Update subtotal when typing in input
  document.querySelectorAll('.input-qty').forEach(function(input) {
    input.addEventListener('input', function() {
      let val = parseInt(this.value) || 0;
      const max = parseInt(this.getAttribute('max')) || Infinity;
      if (val > max) {
        val = max;
        this.value = max;
        showToast("Maksimal stok yang tersedia: " + max, "#f59e0b");
      }
      if (val < 0) {
        val = 0;
        this.value = 0;
      }
      updateSubtotal(this);
    });
  });
"""

# Inject input_logic near the bottom of DOMContentLoaded, e.g., before `// Button Proses & Validasi SO`
if "input.addEventListener('input'" not in content:
    content = content.replace("// Button Proses & Validasi SO", input_logic + "\n  // Button Proses & Validasi SO")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched js/sales.js")
