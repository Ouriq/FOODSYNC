import os

file_path = 'c:/Users/thori/Latihan/foodsyncerp/budgeting.html'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    js_snippet = """
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Tombol Buat Alokasi Baru
    const btnAlokasi = document.querySelector('.btn-primary');
    if (btnAlokasi) {
      btnAlokasi.addEventListener('click', () => {
        alert('Fitur Form Alokasi Baru akan segera hadir.');
      });
    }

    // Tombol Setujui
    document.querySelectorAll('.btn-action.approve').forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const badge = row.querySelector('.status-badge');
        badge.className = 'status-badge status-approved';
        badge.textContent = 'Disetujui';
        badge.style.backgroundColor = '#ecfdf5';
        badge.style.color = '#059669';
        this.parentElement.innerHTML = '<span style="color:#059669; font-size:14px; font-weight:600;"><i class="bx bx-check-circle"></i> Selesai</span>';
      });
    });

    // Tombol Tolak
    document.querySelectorAll('.btn-action.reject').forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const badge = row.querySelector('.status-badge');
        badge.className = 'status-badge status-pending';
        badge.style.backgroundColor = '#fef2f2';
        badge.style.color = '#ef4444';
        badge.textContent = 'Ditolak';
        this.parentElement.innerHTML = '<span style="color:#ef4444; font-size:14px; font-weight:600;"><i class="bx bx-x-circle"></i> Selesai</span>';
      });
    });
  });
</script>
"""
    if 'Tombol Buat Alokasi Baru' not in content:
        content = content.replace('</body>', js_snippet + '\n</body>')
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print('Added JS to budgeting.html')
