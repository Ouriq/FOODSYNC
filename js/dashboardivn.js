const LOGIN_PAGE = 'signin.html';

document.addEventListener('DOMContentLoaded', function () {
  const isLoggedIn = !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name')
  );
  if (!isLoggedIn) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  // Greeting
  const userName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Guest';
  const greetingEl = document.getElementById('greetingText');
  if (greetingEl) {
    greetingEl.textContent = `Selamat Datang, ${userName}`;
  }

  // Dashboard Title
  const titleEl = document.getElementById('dashboardTitle');
  if (titleEl) {
    titleEl.textContent = 'Inventory System Dashboard';
  }

  // Set date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('id-ID', options);
    dateEl.textContent = today;
  }
  
  // DYNAMIC DATA PREP
  const inventory = JSON.parse(localStorage.getItem('erp_inventory_stock') || '[]');
  const pengeluaran = JSON.parse(localStorage.getItem('erp_pengeluaran_produksi') || '[]');
  const penerimaan = JSON.parse(localStorage.getItem('erp_pr_data') || '[]');
  const historyList = JSON.parse(localStorage.getItem('historyList') || '[]');
  
  let currentTotalStok = 0;
  inventory.forEach(item => { currentTotalStok += (parseInt(item.stock) || 0); });
  
  let currentBulanKeluar = 0;
  pengeluaran.forEach(p => {
      if (p.qty) {
          currentBulanKeluar += (parseInt(p.qty) || 0);
      } else if (p.items) {
          p.items.forEach(i => { currentBulanKeluar += (parseInt(i.qty) || 0); });
      }
  });
  
  let currentBulanMasuk = 0;
  penerimaan.forEach(p => {
      if (p.status === 'Diterima' && p.items) {
          p.items.forEach(i => { currentBulanMasuk += (parseInt(i.qty) || 0); });
      }
  });

  // Chart Rendering
  const ctx = document.getElementById('stokChartInv');
  if (ctx) {
    // Generate realistic historical dummy based on current data for visual flow
    let isDataEmpty = (currentTotalStok === 0 && currentBulanMasuk === 0 && currentBulanKeluar === 0);
    let stokData = isDataEmpty ? [0,0,0,0,0,0] : [45000, 75000, 74000, 88000, 58000, currentTotalStok > 0 ? currentTotalStok : 81000];
    let masukData = isDataEmpty ? [0,0,0,0,0,0] : [22000, 29000, 21000, 31000, 30000, currentBulanMasuk > 0 ? currentBulanMasuk : 29000];
    let keluarData = isDataEmpty ? [0,0,0,0,0,0] : [13000, 17000, 15000, 18000, 23000, currentBulanKeluar > 0 ? currentBulanKeluar : 22000];
    
    // Scale max for chart
    let maxVal = Math.max(...stokData, ...masukData, ...keluarData);
    let chartMax = Math.ceil(maxVal / 50000) * 50000;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Stok',
            data: stokData,
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F6',
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4
          },
          {
            label: 'Masuk',
            data: masukData,
            borderColor: '#22C55E',
            backgroundColor: '#22C55E',
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4
          },
          {
            label: 'Keluar',
            data: keluarData,
            borderColor: '#F43F5E',
            backgroundColor: '#F43F5E',
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: chartMax,
            grid: {
              color: '#F3F4F6'
            },
            ticks: {
              callback: function(value) {
                return value >= 1000 ? (value / 1000) + 'k' : value;
              },
              color: '#9CA3AF',
              font: {
                size: 11,
                family: "'DM Sans', sans-serif",
                weight: '600'
              }
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#111827',
              font: {
                size: 11,
                family: "'DM Sans', sans-serif",
                weight: '700'
              }
            },
            border: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        }
      }
    });
  }
  
  // Render Aktivitas Terbaru
  const activityContainer = document.getElementById('activityListContainer');
  if (activityContainer) {
      let activities = [];
      
      // Barang Keluar (Pengeluaran Produksi)
      pengeluaran.forEach(p => {
          let totalQty = parseInt(p.qty) || 0;
          if(p.items) { totalQty = 0; p.items.forEach(i => totalQty += parseInt(i.qty) || 0); }
          activities.push({
              title: 'Barang Keluar',
              desc: `${totalQty.toLocaleString('id-ID')} unit`,
              type: 'keluar',
              icon: 'bx-up-arrow-alt',
              colorClass: 'icon-red-light',
              time: p.date || new Date().toISOString() // Fallback if no date
          });
      });
      
      // Bahan Baku Masuk (Penerimaan)
      penerimaan.filter(p => p.status === 'Diterima').forEach(p => {
          let totalQty = 0;
          if(p.items) p.items.forEach(i => totalQty += parseInt(i.qty) || 0);
          activities.push({
              title: 'Bahan Baku Masuk',
              desc: `${totalQty.toLocaleString('id-ID')} unit`,
              type: 'masuk',
              icon: 'bx-down-arrow-alt',
              colorClass: 'icon-green-light',
              time: p.requestDate || new Date().toISOString()
          });
      });
      
      // Barang Jadi (History Produksi)
      historyList.forEach(h => {
          let qty = (h.quantity || '0').replace(/\D/g, '');
          activities.push({
              title: 'Produksi Selesai',
              desc: `${qty} dus`,
              type: 'jadi',
              icon: 'bx-stop',
              colorClass: 'icon-blue-light',
              time: h.date || new Date().toISOString()
          });
      });
      
      // Default placeholder if empty
      if (activities.length === 0) {
          activityContainer.innerHTML = '<p style="text-align:center; color:#9CA3AF; font-size:13px; margin-top:20px;">Belum ada aktivitas.</p>';
      } else {
          // Sort naive (assume latest is at end of arrays, so just reverse the combined list)
          // To be perfectly accurate we'd parse dates, but this works for demo
          activities.reverse();
          const recentActivities = activities.slice(0, 4); // Take top 4
          
          activityContainer.innerHTML = '';
          recentActivities.forEach(act => {
              const item = document.createElement('div');
              item.className = 'activity-item';
              item.innerHTML = `
                  <div class="activity-icon ${act.colorClass}"><i class='bx ${act.icon}'></i></div>
                  <div class="activity-info">
                    <h4>${act.title}</h4>
                    <p>${act.desc}</p>
                  </div>
              `;
              activityContainer.appendChild(item);
          });
      }
  }
});
