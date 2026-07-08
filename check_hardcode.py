import re
import os
import glob

# IDs that have hardcoded Rp values that we found
ids_to_check = {
    'totalIncomeDisplay': 'dashboard.html / dashboard.js',
    'valPendapatan': 'dashboardfin.html',
    'valPengeluaran': 'dashboardfin.html',
    'valLabaBersih': 'dashboardfin.html',
    'valPurcBudget': 'dashboardpurc.html',
    'valPurcReal': 'dashboardpurc.html',
    'valPurcSisa': 'dashboardpurc.html',
    'valPurcPending': 'dashboardpurc.html',
    'valTotalTagihan': 'fakturpembelian.html',
    'valBelumDibayar': 'fakturpembelian.html',
    'valLunas': 'fakturpembelian.html',
    'valSisaBudget': 'fakturpembelian.html',
    'valTotalAlokasi': 'fakturpembelian.html',
    'usedBudgetDisplay': 'kampanye.html',
    'repTotalNilai': 'laporan.html',
    'repRataRata': 'laporan.html',
    'repTotalNilaiBawah': 'laporan.html / mutasilaporan.html',
    'statAvgHarga': 'market.html',
    'statMinHarga': 'market.html',
    'statMaxHarga': 'market.html',
    'repTotalQty': 'mutasilaporan.html',
    'repTotalAsset': 'mutasilaporan.html',
    'valSubtotal': 'sales.html',
    'valPpn': 'sales.html',
    'valGrandTotal': 'sales.html',
}

js_files = glob.glob('js/*.js') + glob.glob('*.html')

for check_id in ids_to_check.keys():
    found = False
    for js_file in js_files:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if check_id in content and 'getElementById' in content or 'querySelector' in content:
                found = True
                break
    if not found:
        print(f'MISSING JS UPDATE: {check_id} in {ids_to_check[check_id]}')

print("Check finished.")
