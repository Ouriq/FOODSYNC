const LOGIN_PAGE = 'signin.html';

function clearAuth() {
  ['auth_token', 'user_name', 'user_email'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) ||
    sessionStorage.getItem('user_name')
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  // Logic has been moved to topbar.js, but we still need userName for greeting
  const userName = (sessionStorage.getItem('user_name') || localStorage.getItem('user_name')) || sessionStorage.getItem('user_name') || 'Pengguna';
  document.getElementById('greetingText').textContent = `Selamat Datang, ${userName}`;

  // 2. Format Tanggal Hari Ini
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('id-ID', dateOptions);
  document.getElementById('currentDate').textContent = today;

  // Fungsi untuk render ulang chart dan data saat localStorage berubah
  function renderDashboardData() {
    // --- FETCH DYNAMIC DATA DARI LOCALSTORAGE ---
    let salesOrders = JSON.parse(localStorage.getItem('sales_orders') || '[]');
    let processedOrders = salesOrders.filter(so => so.status === 'processed');

  let totalIncome = 0;
  let totalKarton = 0;

  // Data untuk Chart (Bulan 0=Jan sampai 6=Jul)
  let sotoData = [0, 0, 0, 0, 0, 0, 0];
  let gorengData = [0, 0, 0, 0, 0, 0, 0];
  let kariData = [0, 0, 0, 0, 0, 0, 0];
  
  // Data untuk Varian Terlaris
  let qtySoto = 0, qtyGoreng = 0, qtyKari = 0;

  processedOrders.forEach(so => {
    // 1. Total Income
    let orderTotal = 0;
    if (typeof so.grandTotal === 'string') {
        orderTotal = parseInt(so.grandTotal.replace(/[^0-9]/g, '')) || 0;
    } else {
        orderTotal = so.grandTotal || 0;
    }
    totalIncome += orderTotal;

    // 2. Data Bulan (Hanya Jan-Mei)
    let d = new Date(so.createdAt);
    let month = d.getMonth(); // 0-11

    if (so.products) {
      so.products.forEach(p => {
        let q = p.quantity || 0;
        let sub = p.subtotal || 0;
        
        totalKarton += q;

        let name = (p.name || '').toLowerCase();
        if (name.includes('soto')) {
            qtySoto += q;
            if (month >= 0 && month <= 6) sotoData[month] += sub;
        } else if (name.includes('goreng')) {
            qtyGoreng += q;
            if (month >= 0 && month <= 6) gorengData[month] += sub;
        } else if (name.includes('kari')) {
            qtyKari += q;
            if (month >= 0 && month <= 6) kariData[month] += sub;
        }
      });
    }
  });

  // Konversi subtotal (Rupiah) ke Juta untuk Chart agar sesuai axis y
  sotoData = sotoData.map(v => v / 1000000);
  gorengData = gorengData.map(v => v / 1000000);
  kariData = kariData.map(v => v / 1000000);

  // Update Tampilan DOM
  const formatRupiah = (num) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
  document.getElementById('totalIncomeDisplay').textContent = formatRupiah(totalIncome);
  document.getElementById('totalKartonDisplay').textContent = new Intl.NumberFormat('id-ID').format(totalKarton);

  // Hitung persentase bubble
  let totalTop = qtySoto + qtyGoreng + qtyKari;
  let pctSoto = totalTop > 0 ? Math.round((qtySoto / totalTop) * 100) : 0;
  let pctGoreng = totalTop > 0 ? Math.round((qtyGoreng / totalTop) * 100) : 0;
  let pctKari = totalTop > 0 ? Math.round((qtyKari / totalTop) * 100) : 0;

  let bGoreng = document.getElementById('bubbleGoreng');
  let bSoto = document.getElementById('bubbleSoto');
  let bKari = document.getElementById('bubbleKari');
  
  if (bGoreng) bGoreng.querySelector('span').textContent = pctGoreng + '%';
  if (bSoto) bSoto.querySelector('span').textContent = pctSoto + '%';
  if (bKari) bKari.querySelector('span').textContent = pctKari + '%';

  // 3. Konfigurasi Bar Chart (Chart.js)
  const ctx = document.getElementById('revenueChart').getContext('2d');
  
  // Hitung nilai maks untuk scale y axis (tambah buffer 20%)
  let allChartData = [...sotoData, ...gorengData, ...kariData];
  let maxChartVal = allChartData.length > 0 ? Math.max(...allChartData) : 90;
  maxChartVal = maxChartVal < 10 ? 10 : Math.ceil(maxChartVal * 1.2 / 10) * 10;

  if (window.revenueChart) {
    window.revenueChart.destroy();
  }

  window.revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Mie Soto',
          data: sotoData,
          backgroundColor: '#10B981', // Hijau
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: 'Mie Goreng',
          data: gorengData,
          backgroundColor: '#003F8A', // Biru
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: 'Mie Kari Ayam',
          data: kariData,
          backgroundColor: '#FF4500', // Orange/Merah
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'start',
          labels: { usePointStyle: true, boxWidth: 8, font: { family: "'DM Sans', sans-serif", weight: '600' } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxChartVal,
          ticks: {
            callback: function(value) {
              if (value === 0) return '0';
              return value + 'jt'; // Format 40jt, 70jt, 90jt
            },
            font: { family: "'DM Sans', sans-serif", weight: '600' }
          },
          grid: { borderDash: [4, 4], color: '#E5E7EB' },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "'DM Sans', sans-serif", weight: '600' } },
          border: { display: false }
        }
      }
    }
  });
  } // End of renderDashboardData

  // Panggil pertama kali saat halaman dimuat
  renderDashboardData();

  // Dengarkan perubahan dari tab lain atau dari firebase-sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'sales_orders') {
      renderDashboardData();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuth();
    window.location.href = LOGIN_PAGE;
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuth();
    window.location.href = LOGIN_PAGE;
  });
});