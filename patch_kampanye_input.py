import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/kampanye.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Input validation logic
validation_logic = """
  // --- INPUT ANGGARAN VALIDATION ---
  var inputAnggaran = document.getElementById('inputAnggaran');
  if (inputAnggaran) {
      inputAnggaran.addEventListener('input', function(e) {
          // 1. Hanya izinkan angka
          let rawValue = this.value.replace(/[^0-9]/g, '');
          
          if (!rawValue) {
              this.value = '';
              return;
          }

          // 2. Hitung sisa budget saat ini
          let usedBudget = 0;
          campaignsData.forEach(function(c) {
              if (c.status !== 'Draft') {
                  usedBudget += Number(c.anggaran);
              }
          });
          
          let sisaBudget = maxBudget - usedBudget;
          if (sisaBudget < 0) sisaBudget = 0;

          // 3. Batasi nilai maksimum ke sisa budget
          let parsedValue = parseInt(rawValue, 10);
          if (parsedValue > sisaBudget) {
              parsedValue = sisaBudget;
              if (typeof showToast === 'function') {
                  showToast('Anggaran melebihi sisa budget yang tersedia!');
              } else {
                  // alert('Anggaran melebihi sisa budget!');
              }
          }

          // Kembalikan value sebagai string angka
          this.value = parsedValue.toString();
      });
  }
"""

if "INPUT ANGGARAN VALIDATION" not in content:
    # Insert before the saveCampaignForm definition
    insert_pos = content.find("function saveCampaignForm(status)")
    if insert_pos != -1:
        content = content[:insert_pos] + validation_logic + "\n  " + content[insert_pos:]
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("kampanye.js patched with input validation logic.")
    else:
        print("Could not find insert position.")
else:
    print("Validation logic already present.")
