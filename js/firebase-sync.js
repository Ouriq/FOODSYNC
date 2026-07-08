import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

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
let initialSyncComplete = false;

// Kunci yang JANGAN disinkronkan ke Firebase (tetap lokal per perangkat/tab)
const excludedKeys = [
  'user_name', 'user_role', 'user_email', 'auth_token', 'user_photo',
  'foodsync_initial_sync_done', 'foodsync_is_cleared', 'last_wipe',
  'foodsync_session_synced'
];

// Simpan referensi asli SEBELUM override
const originalSetItem = localStorage.setItem;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  isFirebaseInitialized = true;
  console.log('[FoodSync] Firebase berhasil diinisialisasi.');
} catch (error) {
  console.warn('[FoodSync] Firebase gagal:', error);
}

// ========================================================================
// OVERRIDE localStorage.setItem
// Semua penulisan oleh script lain akan dicegat di sini.
// Upload ke Firebase HANYA setelah initial sync selesai.
// ========================================================================
localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments);

  if (!isFirebaseInitialized || !initialSyncComplete || excludedKeys.includes(key)) {
    return;
  }

  try {
    set(ref(db, 'foodsync-erp/' + key), JSON.parse(value));
  } catch (e) {
    set(ref(db, 'foodsync-erp/' + key), value);
  }
};

// ========================================================================
// Helper: Upload SEMUA data localStorage ke Firebase
// Dipanggil setelah initial sync agar data yang ditulis oleh inline scripts
// (yang berjalan SEBELUM module ini) tetap terunggah ke Firebase.
// ========================================================================
function uploadAllLocalToFirebase(firebaseData) {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (excludedKeys.includes(k)) continue;

    const localVal = localStorage.getItem(k);
    
    // Cek apakah key ini sudah ada di Firebase dengan nilai yang sama
    if (firebaseData && firebaseData[k] !== undefined) {
      const fbVal = JSON.stringify(firebaseData[k]);
      if (fbVal === localVal) continue; // Sudah sama, skip
    }

    // Upload ke Firebase
    try {
      set(ref(db, 'foodsync-erp/' + k), JSON.parse(localVal));
    } catch (e) {
      set(ref(db, 'foodsync-erp/' + k), localVal);
    }
  }
  console.log('[FoodSync] Upload data lokal ke Firebase selesai.');
}

// ========================================================================
// DENGARKAN FIREBASE → SYNC KE LOCALSTORAGE
// ========================================================================
if (isFirebaseInitialized) {
  const erpRef = ref(db, 'foodsync-erp');
  
  onValue(erpRef, (snapshot) => {
    const data = snapshot.val();
    
    // --- Handle force_wipe ---
    if (data && data.force_wipe && localStorage.getItem('last_wipe') !== String(data.force_wipe)) {
      Object.keys(data).forEach(key => {
        if (key !== 'force_wipe') set(ref(db, 'foodsync-erp/' + key), null);
      });
      localStorage.clear();
      originalSetItem.call(localStorage, 'last_wipe', String(data.force_wipe));
      originalSetItem.call(localStorage, 'foodsync_is_cleared', 'true');
      window.location.reload();
      return;
    }

    // ================================================================
    // INITIAL SYNC (callback pertama dari Firebase)
    // ================================================================
    if (!initialSyncComplete) {
      initialSyncComplete = true;
      console.log('[FoodSync] Initial sync callback. Firebase data:', data ? 'ADA' : 'KOSONG');

      if (data) {
        // --- DOWNLOAD: Firebase → localStorage ---
        let hasChanges = false;
        Object.keys(data).forEach(key => {
          if (excludedKeys.includes(key) || key === 'force_wipe') return;
          
          let val = data[key];
          // Firebase konversi array → object: kembalikan
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const keys = Object.keys(val);
            if (keys.length > 0 && keys.every(k => !isNaN(k))) {
              val = Object.values(val);
            }
          }
          const stringifiedValue = JSON.stringify(val);
          if (localStorage.getItem(key) !== stringifiedValue) {
            originalSetItem.call(localStorage, key, stringifiedValue);
            hasChanges = true;
          }
        });

        // --- UPLOAD: localStorage → Firebase ---
        // Ini penting! Inline scripts mungkin sudah menulis data baru
        // ke localStorage SEBELUM module ini berjalan. Data itu perlu
        // diunggah ke Firebase agar tersinkronisasi.
        uploadAllLocalToFirebase(data);

        // Reload SATU KALI per sesi agar semua script membaca data benar
        if (hasChanges && !sessionStorage.getItem('foodsync_session_synced')) {
          sessionStorage.setItem('foodsync_session_synced', 'true');
          console.log('[FoodSync] Data berubah. Reload halaman...');
          window.location.reload();
          return;
        }

        // Dispatch storage events agar UI update
        Object.keys(data).forEach(key => {
          if (excludedKeys.includes(key) || key === 'force_wipe') return;
          window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            newValue: localStorage.getItem(key)
          }));
        });

      } else {
        // Firebase KOSONG → upload semua data lokal
        console.log('[FoodSync] Firebase kosong. Upload semua data lokal...');
        uploadAllLocalToFirebase(null);
      }
      return;
    }

    // ================================================================
    // SUBSEQUENT UPDATES (realtime sync setelah initial)
    // ================================================================
    if (data) {
      Object.keys(data).forEach(key => {
        if (excludedKeys.includes(key) || key === 'force_wipe') return;
        
        let val = data[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const keys = Object.keys(val);
          if (keys.length > 0 && keys.every(k => !isNaN(k))) {
            val = Object.values(val);
          }
        }
        const stringifiedValue = JSON.stringify(val);
        if (localStorage.getItem(key) !== stringifiedValue) {
          originalSetItem.call(localStorage, key, stringifiedValue);
          window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            newValue: stringifiedValue
          }));
        }
      });
    }
  });
}
