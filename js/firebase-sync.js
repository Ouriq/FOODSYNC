import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// TODO: GANTI DENGAN FIREBASE CONFIG ANDA
const firebaseConfig = {
  apiKey: "AIzaSyAR5NiwcKKHA7nOOW6BFuZLBSXyPztU380",
  authDomain: "foodsyncerp.firebaseapp.com",
  databaseURL: "https://foodsyncerp-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "foodsyncerp",
  storageBucket: "foodsyncerp.firebasestorage.app",
  messagingSenderId: "956117976103",
  appId: "1:956117976103:web:08811896b3b34ac1d0ba02",
};

let app, db;
let isFirebaseInitialized = false;

// Kunci yang JANGAN disinkronkan ke Firebase (biarkan tetap lokal per perangkat)
const excludedKeys = ['user_name', 'user_role', 'user_email', 'auth_token', 'user_photo'];

// CEGAT (OVERRIDE) SETITEM DI AWAL AGAR AMAN
const originalSetItem = localStorage.setItem;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  isFirebaseInitialized = true;
  console.log('Firebase Realtime Database berhasil diinisialisasi.');
} catch (error) {
  console.warn('Firebase belum dikonfigurasi dengan benar. Berjalan dengan localStorage saja.', error);
}

// 1. DENGARKAN PERUBAHAN DARI FIREBASE DAN SIMPAN KE LOCALSTORAGE
if (isFirebaseInitialized) {
  const erpRef = ref(db, 'foodsync-erp');
  onValue(erpRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (data.force_wipe && localStorage.getItem('last_wipe') !== String(data.force_wipe)) {
          localStorage.clear();
          originalSetItem.call(localStorage, 'last_wipe', String(data.force_wipe));
          window.location.reload();
          return;
      }

      Object.keys(data).forEach(key => {
        if (!excludedKeys.includes(key) && key !== 'force_wipe') {
          let val = data[key];
          // Firebase sering mengubah array menjadi object jika ada indeks yang kosong.
          // Kita kembalikan menjadi array agar .filter() dkk tidak error.
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const keys = Object.keys(val);
            if (keys.length > 0 && keys.every(k => !isNaN(k))) {
              val = Object.values(val);
            }
          }
          const stringifiedValue = JSON.stringify(val);
          // Cek apakah berbeda sebelum disave agar tidak terjadi infinite loop
          if (localStorage.getItem(key) !== stringifiedValue) {
            originalSetItem.call(localStorage, key, stringifiedValue);
            // Trigger storage event agar UI update realtime
            window.dispatchEvent(new StorageEvent('storage', {
              key: key,
              newValue: stringifiedValue
            }));
          }
        }
      });
    }
  });
}

// 2. CEGAT (OVERRIDE) SETITEM AGAR OTOMATIS TERKIRIM KE FIREBASE
localStorage.setItem = function (key, value) {
  // Selalu jalankan fungsi aslinya untuk menyimpan ke browser lokal
  originalSetItem.apply(this, arguments);

  // Jika Firebase aktif dan key bukan pengecualian, kirim ke cloud!
  if (isFirebaseInitialized && !excludedKeys.includes(key)) {
    try {
      // Data di localStorage berbentuk string JSON, kita parse dulu agar rapi di Firebase
      const parsedValue = JSON.parse(value);
      set(ref(db, 'foodsync-erp/' + key), parsedValue);
    } catch (e) {
      // Jika bukan JSON, simpan sebagai string biasa
      set(ref(db, 'foodsync-erp/' + key), value);
    }
  }
};

