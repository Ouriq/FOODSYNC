import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/topbar.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

rollover_logic = """
  // --- BUDGET ROLLOVER LOGIC (MONTHLY RESET) ---
  function checkMonthlyRollover() {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastMonth = localStorage.getItem('erp_last_budget_month');

      if (!lastMonth) {
          // Inisialisasi jika belum pernah dibuka
          localStorage.setItem('erp_last_budget_month', currentMonth);
          return;
      }

      if (lastMonth !== currentMonth) {
          // Terjadi pergantian bulan! Lakukan tutup buku
          
          // 1. Hitung sisa budget Sales & Marketing
          let maxBudget = 0;
          let financeAllocations = JSON.parse(localStorage.getItem('erp_finance_allocations') || '[]');
          
          financeAllocations.forEach(alloc => {
              if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
                  maxBudget += Number(alloc.nominal);
              }
          });

          let usedBudget = 0;
          let campaignsData = JSON.parse(localStorage.getItem('campaigns_data') || '[]');
          campaignsData.forEach(c => {
              if (c.status !== 'Draft') {
                  usedBudget += Number(c.anggaran);
              }
          });

          let sisa = maxBudget - usedBudget;
          if (sisa < 0) sisa = 0;

          // 2. Simpan sisa dana ke erp_finance_returns
          if (sisa > 0) {
              let returns = JSON.parse(localStorage.getItem('erp_finance_returns')) || [];
              const todayStr = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
              returns.push({
                  month: lastMonth,
                  date: todayStr,
                  divisi: 'Sales & Marketing',
                  nominal: sisa
              });
              localStorage.setItem('erp_finance_returns', JSON.stringify(returns));
          }

          // 3. Reset/Expired semua alokasi bulan lalu agar Max Budget jadi 0
          let modified = false;
          financeAllocations.forEach(alloc => {
              if (alloc.divisi === 'Sales & Marketing' && alloc.status === 'approved') {
                  alloc.status = 'expired';
                  modified = true;
              }
          });
          
          if (modified) {
              localStorage.setItem('erp_finance_allocations', JSON.stringify(financeAllocations));
          }

          // 4. Update penanda bulan
          localStorage.setItem('erp_last_budget_month', currentMonth);
          
          // 5. Beri tahu halaman lain yang terbuka
          window.dispatchEvent(new Event('storage'));
          
          console.log(`Tutup buku untuk bulan ${lastMonth} selesai. Sisa dana Rp ${sisa} dikembalikan ke Finance.`);
      }
  }

  // Panggil pengecekan rollover
  checkMonthlyRollover();
"""

if "checkMonthlyRollover" not in content:
    content += "\n" + rollover_logic
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Topbar.js patched with rollover logic.")
else:
    print("Rollover logic already present.")
