
    document.addEventListener('DOMContentLoaded', function () {
      const userName = localStorage.getItem('user_name') || 'User';
      const userNameDisplay = document.getElementById('userNameDisplay');
      if (userNameDisplay) userNameDisplay.textContent = userName;

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
          if(status === 'Disetujui') return '<span class="status-pill pill-disetujui">DISETUJUI</span>';
          if(status === 'Menunggu') return '<span class="status-pill pill-tertunda">TERTUNDA</span>';
          if(status === 'Ditolak') return '<span class="status-pill pill-ditolak" style="background:#FEE2E2;color:#DC2626;">DITOLAK</span>';
          return `<span class="status-pill pill-tertunda">${status.toUpperCase()}</span>`;
      }

      function renderTable() {
          tbody.innerHTML = '';
          prData.forEach((pr, index) => {
              const tr = document.createElement('tr');
              let actionHtml = '';
              if(pr.status === 'Menunggu') {
                  actionHtml = `
                    <div style="display:flex; gap: 8px; justify-content: center;">
                      <button onclick="validasiPR(${index}, 'Disetujui')" style="padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;"><i class='bx bx-check'></i> Setujui</button>
                      <button onclick="validasiPR(${index}, 'Ditolak')" style="padding: 6px 12px; background: #DC2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;"><i class='bx bx-x'></i> Tolak</button>
                    </div>
                  `;
              } else {
                  actionHtml = '<span style="color: #9CA3AF; font-size: 12px;">-</span>';
              }

              tr.innerHTML = `
                <td style="text-align: left; padding-left: 24px;">${pr.id}</td>
                <td style="text-align: left;">${pr.name}</td>
                <td>${pr.date}</td>
                <td>${pr.qty} ${pr.unit || 'Item'}</td>
                <td>${formatRupiah(pr.total)}</td>
                <td>${getStatusPill(pr.status)}</td>
                <td style="text-align: center;">${actionHtml}</td>
              `;
              tbody.appendChild(tr);
          });
      }

      window.validasiPR = function(index, newStatus) {
          if(confirm('Apakah Anda yakin ingin memberikan status ' + newStatus + ' pada permintaan ini?')) {
              prData[index].status = newStatus;
              localStorage.setItem('erp_pr_data', JSON.stringify(prData));
              renderTable();
          }
      };

      renderTable();
    });
  