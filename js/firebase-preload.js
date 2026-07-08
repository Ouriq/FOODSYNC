/**
 * firebase-preload.js (NON-MODULE)
 * Dimuat PERTAMA sebelum semua script lain.
 * Fetch data dari Firebase REST API → tulis ke localStorage.
 */
(function() {
  'use strict';

  var FIREBASE_URL = 'https://foodsyncerp-default-rtdb.asia-southeast1.firebasedatabase.app/foodsync-erp.json';
  
  var EXCLUDED_KEYS = [
    'user_name', 'user_role', 'user_email', 'auth_token', 'user_photo',
    'foodsync_initial_sync_done', 'foodsync_is_cleared', 'last_wipe',
    'foodsync_session_synced', 'foodsync_last_sync_ts', 'force_wipe',
    '_last_updated', 'foodsync_preloaded'
  ];

  function isValidFirebaseKey(key) {
    return !/[.$#\[\]\/:]/.test(key) && key.indexOf('firebase') !== 0;
  }

  // Sudah preload di sesi ini? Skip.
  if (sessionStorage.getItem('foodsync_preloaded')) {
    return;
  }

  console.log('[Preload] Mengambil data dari Firebase...');
  
  fetch(FIREBASE_URL)
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function(data) {
      if (!data) {
        console.log('[Preload] Firebase kosong.');
        sessionStorage.setItem('foodsync_preloaded', 'true');
        return;
      }
      
      console.log('[Preload] Data diterima. Menulis ke localStorage...');
      var hasChanges = false;
      var keys = Object.keys(data);
      
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        if (EXCLUDED_KEYS.indexOf(key) !== -1) continue;
        
        var val = data[key];
        // Firebase array fix
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
        console.log('[Preload] Data berubah! Reload...');
        window.location.reload();
      } else {
        console.log('[Preload] Data sudah sinkron.');
      }
    })
    .catch(function(err) {
      console.warn('[Preload] Error:', err);
      sessionStorage.setItem('foodsync_preloaded', 'true');
    });
})();
