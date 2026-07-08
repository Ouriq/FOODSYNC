/**
 * firebase-preload.js
 * Script NON-MODULE yang dimuat PERTAMA sebelum semua script lain.
 * Mengambil data dari Firebase REST API dan menulis ke localStorage
 * SEBELUM inline scripts sempat menulis dummy data.
 */
(function() {
  'use strict';

  const FIREBASE_URL = 'https://foodsyncerp-default-rtdb.asia-southeast1.firebasedatabase.app/foodsync-erp.json';
  
  const EXCLUDED_KEYS = [
    'user_name', 'user_role', 'user_email', 'auth_token', 'user_photo',
    'foodsync_initial_sync_done', 'foodsync_is_cleared', 'last_wipe',
    'foodsync_session_synced', 'foodsync_last_sync_ts', 'force_wipe',
    '_last_updated'
  ];

  // Sudah preload di sesi ini? Skip.
  if (sessionStorage.getItem('foodsync_preloaded')) {
    console.log('[Preload] Sudah preload di sesi ini. Skip.');
    return;
  }

  // Fetch data dari Firebase REST API
  console.log('[Preload] Mengambil data dari Firebase...');
  
  fetch(FIREBASE_URL)
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function(data) {
      if (!data) {
        console.log('[Preload] Firebase kosong. Upload data lokal...');
        // Firebase kosong — upload semua data lokal ke Firebase
        var uploadData = {};
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (EXCLUDED_KEYS.indexOf(k) !== -1) continue;
          try {
            uploadData[k] = JSON.parse(localStorage.getItem(k));
          } catch(e) {
            uploadData[k] = localStorage.getItem(k);
          }
        }
        uploadData['_last_updated'] = Date.now();
        
        // Upload via REST API PUT
        return fetch(FIREBASE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData)
        }).then(function() {
          console.log('[Preload] Upload selesai.');
          sessionStorage.setItem('foodsync_preloaded', 'true');
        });
      }
      
      // Firebase PUNYA data — tulis ke localStorage
      console.log('[Preload] Firebase punya data. Menulis ke localStorage...');
      var hasChanges = false;
      var keys = Object.keys(data);
      
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        if (EXCLUDED_KEYS.indexOf(key) !== -1) continue;
        
        var val = data[key];
        // Firebase konversi array → object: kembalikan
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          var objKeys = Object.keys(val);
          if (objKeys.length > 0 && objKeys.every(function(k) { return !isNaN(k); })) {
            val = Object.values(val);
          }
        }
        
        var stringified = JSON.stringify(val);
        if (localStorage.getItem(key) !== stringified) {
          localStorage.setItem(key, stringified);
          hasChanges = true;
        }
      }
      
      sessionStorage.setItem('foodsync_preloaded', 'true');
      
      if (hasChanges) {
        console.log('[Preload] Data berubah! Reload halaman...');
        window.location.reload();
      } else {
        console.log('[Preload] Data sudah sinkron.');
      }
    })
    .catch(function(err) {
      console.warn('[Preload] Gagal fetch Firebase:', err);
      // Tetap set flag agar tidak loop
      sessionStorage.setItem('foodsync_preloaded', 'true');
    });
})();
