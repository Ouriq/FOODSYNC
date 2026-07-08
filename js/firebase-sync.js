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

const excludedKeys = [
  'user_name', 'user_role', 'user_email', 'auth_token', 'user_photo',
  'foodsync_initial_sync_done', 'foodsync_is_cleared', 'last_wipe',
  'foodsync_session_synced', 'foodsync_last_sync_ts'
];

const originalSetItem = localStorage.setItem;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  isFirebaseInitialized = true;
  console.log('[FoodSync] Firebase OK.');
} catch (error) {
  console.warn('[FoodSync] Firebase GAGAL:', error);
}

// ========================================================================
// OVERRIDE localStorage.setItem — cegat semua penulisan
// ========================================================================
localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments);

  if (!isFirebaseInitialized || !initialSyncComplete || excludedKeys.includes(key)) {
    return;
  }

  // Upload ke Firebase + update timestamp
  try {
    set(ref(db, 'foodsync-erp/' + key), JSON.parse(value));
  } catch (e) {
    set(ref(db, 'foodsync-erp/' + key), value);
  }
  // Update sync timestamp agar device lain tahu data berubah
  set(ref(db, 'foodsync-erp/_last_updated'), Date.now());
};

// ========================================================================
// Helper: konversi Firebase object kembali ke array jika perlu
// ========================================================================
function fixFirebaseArray(val) {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const keys = Object.keys(val);
    if (keys.length > 0 && keys.every(k => !isNaN(k))) {
      return Object.values(val);
    }
  }
  return val;
}

// ========================================================================
// FIREBASE LISTENER
// ========================================================================
if (isFirebaseInitialized) {
  const erpRef = ref(db, 'foodsync-erp');
  
  onValue(erpRef, (snapshot) => {
    const data = snapshot.val();
    
    // --- force_wipe ---
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
    // INITIAL SYNC
    // ================================================================
    if (!initialSyncComplete) {
      initialSyncComplete = true;
      
      if (data && Object.keys(data).filter(k => k !== 'force_wipe' && k !== '_last_updated').length > 0) {
        // ---- Firebase PUNYA data ----
        console.log('[FoodSync] Firebase punya data. Download ke localStorage...');
        
        let hasChanges = false;
        Object.keys(data).forEach(key => {
          if (excludedKeys.includes(key) || key === 'force_wipe' || key === '_last_updated') return;
          
          let val = fixFirebaseArray(data[key]);
          const stringifiedValue = JSON.stringify(val);
          if (localStorage.getItem(key) !== stringifiedValue) {
            originalSetItem.call(localStorage, key, stringifiedValue);
            hasChanges = true;
          }
        });

        // Juga upload key yang ada di lokal tapi BELUM ada di Firebase
        // (misalnya data baru yang ditulis inline scripts)
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (excludedKeys.includes(k) || k === '_last_updated') continue;
          if (data[k] === undefined) {
            // Key ini ada di lokal tapi belum di Firebase → upload
            try {
              set(ref(db, 'foodsync-erp/' + k), JSON.parse(localStorage.getItem(k)));
            } catch(e) {
              set(ref(db, 'foodsync-erp/' + k), localStorage.getItem(k));
            }
          }
        }

        // Reload SATU KALI per sesi jika ada perubahan
        if (hasChanges && !sessionStorage.getItem('foodsync_session_synced')) {
          sessionStorage.setItem('foodsync_session_synced', 'true');
          console.log('[FoodSync] Data berubah dari Firebase. Reload...');
          window.location.reload();
          return;
        }

        // Dispatch storage events
        Object.keys(data).forEach(key => {
          if (excludedKeys.includes(key) || key === 'force_wipe' || key === '_last_updated') return;
          window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            newValue: localStorage.getItem(key)
          }));
        });

      } else {
        // ---- Firebase KOSONG → upload semua data lokal ----
        console.log('[FoodSync] Firebase kosong. Upload semua data lokal...');
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (excludedKeys.includes(k)) continue;
          try {
            set(ref(db, 'foodsync-erp/' + k), JSON.parse(localStorage.getItem(k)));
          } catch(e) {
            set(ref(db, 'foodsync-erp/' + k), localStorage.getItem(k));
          }
        }
        set(ref(db, 'foodsync-erp/_last_updated'), Date.now());
      }
      return;
    }

    // ================================================================
    // SUBSEQUENT UPDATES (realtime)
    // ================================================================
    if (data) {
      Object.keys(data).forEach(key => {
        if (excludedKeys.includes(key) || key === 'force_wipe' || key === '_last_updated') return;
        
        let val = fixFirebaseArray(data[key]);
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
