import os

js_path = 'js/pelanggan.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a storage event listener at the end of the file
if "window.addEventListener('storage'" not in content:
    content += """

// Dengarkan perubahan dari firebase-sync
window.addEventListener('storage', (e) => {
    if (e.key === 'customers_data') {
        customersData = JSON.parse(localStorage.getItem('customers_data')) || [];
        renderTable();
    }
});
"""
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched js/pelanggan.js")
else:
    print("Already patched")
