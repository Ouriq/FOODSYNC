document.addEventListener("DOMContentLoaded", function() {
  var nav = document.getElementById('dynamicSidebarNav');
  if (!nav) return;
  var role = sessionStorage.getItem('user_role') || localStorage.getItem('user_role') || 'sales';
  var menus = {
    sales: [
      { href:'dashboard.html', icon:'assets/images/dasboardicon.png', label:'Dashboard', img:true },
      { href:'pelanggan.html', icon:'assets/images/dataicon.png', label:'Manajemen Data Pelanggan', img:true },
      { href:'sales.html', icon:'assets/images/soicon.png', label:'Sales Order', img:true },
      { href:'kampanye.html', icon:'assets/images/speaker.png', label:'Kampanye Marketing', img:true },
      { href:'market.html', icon:'assets/images/marketicon.png', label:'Market Intelligence', img:true },
      { href:'laporan.html', icon:'assets/images/laporanicon.png', label:'Laporan Penjualan', img:true }
    ],
    inventory: [
      { href:'dashboardivn.html', icon:'bx bx-grid-alt', label:'Dashboard' },
      { href:'datastok.html', icon:'bx bx-data', label:'Data Stok & Monitoring' },
      { href:'reqpembelian.html', icon:'bx bx-cart', label:'Request Pembelian Bahan Baku' },
      { href:'penerimaan.html', icon:'bx bx-download', label:'Penerimaan Bahan Baku' },
      { href:'pengeluaran.html', icon:'bx bx-box', label:'Pengeluaran Produksi' },
      { href:'barangjadi.html', icon:'bx bx-package', label:'Barang Jadi (FG)' },
      { href:'mutasilaporan.html', icon:'bx bx-clipboard', label:'Mutasi & Laporan' }
    ],
    production: [
      { href:'dashboardprod.html', icon:'bx bx-grid-alt', label:'Dashboard' },
      { href:'rencanaproduksi.html', icon:'bx bx-calendar-event', label:'Rencana Produksi' },
      { href:'monitoringproduksi.html', icon:'bx bx-desktop', label:'Monitoring Produksi' },
      { href:'prosesproduksi.html', icon:'bx bx-cog', label:'Proses Produksi' },
      { href:'qualitycheck.html', icon:'bx bx-check-shield', label:'Quality Check' },
      { href:'riwayatproduksi.html', icon:'bx bx-history', label:'Riwayat Produksi' }
    ],
    finance: [
      { href:'dashboardfin.html', icon:'bx bx-grid-alt', label:'Dashboard' },
      { href:'budgeting.html', icon:'bx bx-wallet', label:'Alokasi Anggaran' },
      { href:'laporanlaba.html', icon:'bx bx-line-chart', label:'Laporan Laba' }
    ],
    purchasing: [
      { href:'dashboardpurc.html', icon:'bx bx-grid-alt', label:'Dashboard' },
      { href:'permintaanpembelian.html', icon:'bx bx-file-blank', label:'Permintaan Pembelian' },
      { href:'pesananpembelian.html', icon:'bx bx-cart', label:'Pesanan Pembelian' },
      { href:'fakturpembelian.html', icon:'bx bx-receipt', label:'Faktur Pembelian' },
      { href:'threeway.html', icon:'bx bx-check-double', label:'Three-Way Matching' }
    ],
    hr: [
      { href:'dashboardhr.html', icon:'bx bx-group', label:'Dashboard HR' }
    ],
    superadmin: [
      { href:'dashboard.html', icon:'assets/images/dasboardicon.png', label:'Dashboard', img:true },
      { href:'pelanggan.html', icon:'assets/images/dataicon.png', label:'Manajemen Data Pelanggan', img:true },
      { href:'sales.html', icon:'assets/images/soicon.png', label:'Sales Order', img:true },
      { href:'kampanye.html', icon:'assets/images/speaker.png', label:'Kampanye Marketing', img:true },
      { href:'market.html', icon:'assets/images/marketicon.png', label:'Market Intelligence', img:true },
      { href:'laporan.html', icon:'assets/images/laporanicon.png', label:'Laporan Penjualan', img:true }
    ]
  };
  var items = menus[role] || menus['sales'];
  var html = '';
  items.forEach(function(m) {
    if (m.img) {
      html += '<a href="'+m.href+'" class="nav-item"><img src="'+m.icon+'" alt="" class="nav-icon"> '+m.label+'</a>';
    } else {
      html += '<a href="'+m.href+'" class="nav-item"><i class="'+m.icon+'"></i> '+m.label+'</a>';
    }
  });
  nav.innerHTML = html;
});
