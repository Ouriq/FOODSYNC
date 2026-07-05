// js/db.js

// Initial Seed Data for Inventory
const INITIAL_STOCK_DATA = [
  { id: 'FG-001', sku: 'IDN-GRG', name: 'Indomie Goreng', type: 'Barang Jadi', unit: 'dus', stock: 0, price: 85000, img: 'assets/images/gorengicon.png', statusClass: 'pill-green' },
  { id: 'FG-002', sku: 'IDN-STO', name: 'Indomie Kuah Soto', type: 'Barang Jadi', unit: 'dus', stock: 0, price: 82000, img: 'assets/images/sotoicon.png', statusClass: 'pill-green' },
  { id: 'FG-003', sku: 'IDN-KRI', name: 'Indomie Kari', type: 'Barang Jadi', unit: 'dus', stock: 0, price: 85000, img: 'assets/images/gorengicon.png', statusClass: 'pill-green' },
  { id: 'RM-001', sku: 'RM-TPG', name: 'Tepung Terigu Bogasari 10kg', type: 'Bahan Baku', unit: 'sak', stock: 0, price: 0, img: '', statusClass: 'pill-orange' },
  { id: 'PM-001', sku: 'PM-KDS', name: 'Kardus Indomie', type: 'Kemasan', unit: 'pcs', stock: 0, price: 0, img: '', statusClass: 'pill-blue' }
];

function initDB() {
  if (!localStorage.getItem('erp_inventory_stock') && !localStorage.getItem('foodsync_is_cleared')) {
    localStorage.setItem('erp_inventory_stock', JSON.stringify(INITIAL_STOCK_DATA));
  }
}

function getInventoryStock() {
  let data = JSON.parse(localStorage.getItem('erp_inventory_stock') || '[]');
  
  // Auto-merge initial data to ensure missing items (like Indomie Kari) exist
  let hasChanged = false;
  INITIAL_STOCK_DATA.forEach(initialItem => {
      let exists = data.find(item => item.sku === initialItem.sku);
      if (!exists) {
          data.push(initialItem);
          hasChanged = true;
      } else {
          // Rename if it was the old name
          if (exists.name === 'Indomie Goreng 75g' && initialItem.name === 'Indomie Goreng') {
              exists.name = 'Indomie Goreng';
              hasChanged = true;
          }
      }
  });

  if (hasChanged) {
      localStorage.setItem('erp_inventory_stock', JSON.stringify(data));
  }
  
  return data;
}

function updateInventoryStock(sku, newStock) {
  let data = getInventoryStock();
  let item = data.find(i => i.sku.replace(/\s+/g, "") === sku.replace(/\s+/g, ""));
  if (item) {
    item.stock = newStock;
    localStorage.setItem('erp_inventory_stock', JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', {key: 'erp_inventory_stock'}));
  }
}

// Jalankan inisialisasi setiap kali file ini dimuat
initDB();
