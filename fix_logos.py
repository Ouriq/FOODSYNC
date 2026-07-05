import os

html_files = [
    'dashboardfin.html', 'budgeting.html', 'laporanlaba.html',
    'dashboardpurc.html', 'permintaanpembelian.html', 'pesananpembelian.html',
    'fakturpembelian.html', 'threeway.html'
]

for f in html_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace logo src
        if 'src="logo.png"' in content:
            content = content.replace('src="logo.png" alt="FoodSync Logo" onerror="this.src=\'https://placehold.co/120x32/0b2e59/ffffff?text=FoodSync\'"', 'src="assets/images/logo.png" alt="FoodSync Logo" style="max-height: 40px;"')
            content = content.replace('src="logo.png"', 'src="assets/images/logo.png"')
            
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f'Updated logo in {f}')
