import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// TODO: GANTI DENGAN FIREBASE CONFIG ANDA
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app, db;
let isFirebaseInitialized = false;

// Kunci yang JANGAN disinkronkan ke Firebase (biarkan tetap lokal per perangkat)
const excludedKeys = ['user_name', 'user_role', 'user_email', 'auth_token', 'user_photo'];

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
      Object.keys(data).forEach(key => {
        if (!excludedKeys.includes(key)) {
          const stringifiedValue = JSON.stringify(data[key]);
          // Cek apakah berbeda sebelum disave agar tidak terjadi infinite loop
          if (localStorage.getItem(key) !== stringifiedValue) {
            localStorage.setItem(key, stringifiedValue);
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
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
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

