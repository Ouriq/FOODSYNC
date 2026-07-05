
    document.addEventListener('DOMContentLoaded', function () {
      const isLoggedIn = !!(
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token') ||
        localStorage.getItem('user_name') ||
        sessionStorage.getItem('user_name')
      );
      if (!isLoggedIn) {
        window.location.href = 'signin.html';
        return;
      }
      
      // Function format rupiah
      function formatRupiah(angka){
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
      }

      // Initialize Data
      let prData = JSON.parse(localStorage.getItem('erp_pr_data'));
      if (!prData) {
          prData = [
              { id: 'PR-240520-023', date: '20 Mei 2024', name: 'Minyak', qty: 8, unit: 'Item', total: 125450000, status: 'Disetujui' },
              { id: 'PR-240520-022', date: '19 Mei 2024', name: 'Tepung Terigu', qty: 5, unit: 'Item', total: 87200000, status: 'Menunggu' },
              { id: 'PR-240520-020', date: '17 Mei 2024', name: 'Gula Pasir', qty: 4, unit: 'Item', total: 32750000, status: 'Ditolak' }
          ];
          localStorage.setItem('erp_pr_data', JSON.stringify(prData));
      }

      const tbody = document.querySelector('.data-table tbody');
      
      function getStatusPill(status) {
          if(status === 'Disetujui') return '<span class="pill pill-green">Disetujui</span>';
          if(status === 'Menunggu') return '<span class="pill pill-yellow">Menunggu</span>';
          if(status === 'Ditolak') return '<span class="pill pill-red">Ditolak</span>';
          return `<span class="pill pill-yellow">${status}</span>`;
      }

      function renderTable() {
          tbody.innerHTML = '';
          prData.forEach(pr => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                  <td>${pr.id}</td>
                  <td>${pr.date}</td>
                  <td>${pr.name}</td>
                  <td>${pr.qty}</td>
                  <td>${pr.unit || 'Item'}</td>
                  <td>${formatRupiah(pr.total)}</td>
                  <td>${getStatusPill(pr.status)}</td>
              `;
              tbody.appendChild(tr);
          });
          filterTable();
      }

      renderTable();

      // Modal logic
      const modalPR = document.getElementById('modalPR');
      const btnBuatPR = document.getElementById('btnBuatPR');
      const closeModalPR = document.getElementById('closeModalPR');
      const prNoInput = document.getElementById('prNoInput');
      
      let prCounter = prData.length > 0 ? parseInt(prData[0].id.split('-')[2]) + 1 : 24; 

      function generatePRNo() {
          const d = new Date();
          const yy = d.getFullYear().toString().slice(-2);
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const seq = String(prCounter).padStart(3, '0');
          return `PR-${yy}${mm}${dd}-${seq}`;
      }

      if (btnBuatPR && modalPR) {
          btnBuatPR.addEventListener('click', () => {
              prNoInput.value = generatePRNo();
              const d = new Date();
              const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              document.getElementById('prTanggalInput').value = dateStr;
              modalPR.style.display = 'flex';
          });
      }

      if (closeModalPR && modalPR) {
          closeModalPR.addEventListener('click', () => {
              modalPR.style.display = 'none';
          });
      }

      // Submit PR
      const btnSubmitPR = document.getElementById('btnSubmitPR');

      if (btnSubmitPR) {
          btnSubmitPR.addEventListener('click', () => {
              const noPr = prNoInput.value;
              const nama = document.getElementById('prNamaInput').value;
              const item = document.getElementById('prItemInput').value;
              const satuan = document.getElementById('prSatuanInput').value;
              const harga = document.getElementById('prHargaInput').value;
              
              if(!nama || !item || !harga) {
                  alert("Mohon lengkapi data!");
                  return;
              }

              const d = new Date();
              const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              
              const newPR = {
                  id: noPr,
                  date: dateStr,
                  name: nama,
                  qty: parseInt(item),
                  unit: satuan,
                  total: parseFloat(harga),
                  status: 'Menunggu'
              };

              prData.unshift(newPR);
              localStorage.setItem('erp_pr_data', JSON.stringify(prData));
              
              renderTable();
              
              document.getElementById('prNamaInput').value = '';
              document.getElementById('prItemInput').value = '';
              document.getElementById('prHargaInput').value = '';
              document.getElementById('prSatuanInput').value = 'Item';
              prCounter++;
              modalPR.style.display = 'none';
          });
      }

      // Filter Logic
      const statusFilter = document.getElementById('statusFilter');

      function filterTable() {
        const statusVal = statusFilter ? statusFilter.value.toLowerCase() : '';
        const tableRows = document.querySelectorAll('.data-table tbody tr');

        tableRows.forEach(row => {
          const status = row.cells[6]?.textContent.toLowerCase() || '';
          const matchStatus = statusVal === '' || status.includes(statusVal);

          if (matchStatus) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }

      if (statusFilter) statusFilter.addEventListener('change', filterTable);

      // Refresh Logic
      const btnRefreshPR = document.getElementById('btnRefreshPR');
      if(btnRefreshPR) {
          btnRefreshPR.addEventListener('click', () => {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
              document.getElementById('lastUpdated').textContent = `Terakhir diperbarui: ${dateStr} ${timeStr}`;
              
              // reload data
              prData = JSON.parse(localStorage.getItem('erp_pr_data')) || [];
              renderTable();

              const icon = document.querySelector('#btnRefreshPR i');
              if (icon) {
                icon.style.transition = 'transform 0.5s ease';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                  icon.style.transition = 'none';
                  icon.style.transform = 'rotate(0deg)';
                }, 500);
              }
          });
      }
    });

    function clearAuth() {
      ['auth_token', 'user_name', 'user_email', 'user_role', 'user_photo', 'isLoggedIn'].forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }
  