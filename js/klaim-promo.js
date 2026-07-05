


function showToast(message, bgColor) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = bgColor || '#333';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'Outfit, sans-serif';
  toast.style.fontSize = '14px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s ease';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('formKlaimPromo');
  const inputKode = document.getElementById('inputKode');
  const btnCek = document.getElementById('btnCek');
  
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const errorText = document.getElementById('errorText');
  const successState = document.getElementById('successState');
  
  const resDiskon = document.getElementById('resDiskon');
  const resNama = document.getElementById('resNama');
  const resDeskripsi = document.getElementById('resDeskripsi');
  const resAkhir = document.getElementById('resAkhir');
  const resProduk = document.getElementById('resProduk');
  const btnGunakan = document.getElementById('btnGunakan');

  let activePromo = null;

  function hideAllStates() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    successState.style.display = 'none';
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const kode = inputKode.value.trim().toUpperCase();
    if (!kode) return;

    hideAllStates();
    loadingState.style.display = 'block';
    btnCek.disabled = true;

    try {
      const q = query(collection(db, "promos"), where("kode", "==", kode));
      const querySnapshot = await getDocs(q);

      loadingState.style.display = 'none';

      if (querySnapshot.empty) {
        errorText.textContent = "Kode promo tidak ditemukan. Silakan periksa kembali.";
        errorState.style.display = 'block';
        return;
      }

      // We found the promo
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      // Check date validity
      const today = new Date();
      today.setHours(0,0,0,0);
      let isValidDate = true;
      let expiredMsg = "";

      if (data.tglAkhir) {
        const akhirDate = new Date(data.tglAkhir);
        akhirDate.setHours(0,0,0,0);
        if (today > akhirDate) {
          isValidDate = false;
          expiredMsg = "Kode promo sudah kadaluarsa sejak " + akhirDate.toLocaleDateString('id-ID');
        }
      }

      if (data.tglMulai) {
        const mulaiDate = new Date(data.tglMulai);
        mulaiDate.setHours(0,0,0,0);
        if (today < mulaiDate) {
          isValidDate = false;
          expiredMsg = "Kode promo baru bisa digunakan mulai " + mulaiDate.toLocaleDateString('id-ID');
        }
      }

      // Check quota
      let isValidQuota = true;
      if (data.kuota > 0 && (data.digunakan || 0) >= data.kuota) {
        isValidQuota = false;
      }

      if (!isValidDate) {
        errorText.textContent = expiredMsg;
        errorState.style.display = 'block';
        return;
      }

      if (!isValidQuota) {
        errorText.textContent = "Mohon maaf, kuota penggunaan kode promo ini sudah habis.";
        errorState.style.display = 'block';
        return;
      }

      // All valid! Show success state
      activePromo = data;
      activePromo.id = docSnap.id;

      resDiskon.textContent = (data.diskon || 0) + '%';
      resNama.textContent = data.nama || 'Promo Spesial';
      resDeskripsi.textContent = data.deskripsi || 'Nikmati potongan harga spesial untuk Anda';
      
      if (data.tglAkhir) {
        const dateObj = new Date(data.tglAkhir);
        resAkhir.textContent = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } else {
        resAkhir.textContent = 'Tanpa Batas';
      }

      resProduk.textContent = data.produk || 'Semua Produk';

      successState.style.display = 'block';

    } catch (err) {
      console.error(err);
      loadingState.style.display = 'none';
      errorText.textContent = "Terjadi kesalahan jaringan. Silakan coba lagi.";
      errorState.style.display = 'block';
    } finally {
      btnCek.disabled = false;
    }
  });

  btnGunakan.addEventListener('click', async function() {
    if (activePromo) {
      showToast("Menerapkan promo " + activePromo.kode + "...", "#3b82f6");
      btnGunakan.disabled = true;
      btnGunakan.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sedang diproses...";
      
      try {
        const promoRef = doc(db, "promos", activePromo.id);
        const currentDigunakan = activePromo.digunakan || 0;
        
        await updateDoc(promoRef, {
          digunakan: currentDigunakan + 1
        });

        sessionStorage.setItem('appliedPromo', JSON.stringify(activePromo));
        
        btnGunakan.innerHTML = "<i class='bx bx-check-circle'></i> Promo Berhasil Digunakan!";
        btnGunakan.style.background = "#059669";
        
        showToast("Promo berhasil diklaim!", "#10B981");

        setTimeout(function() {
          inputKode.value = '';
          hideAllStates();
          btnGunakan.disabled = false;
          btnGunakan.innerHTML = "Gunakan Promo Sekarang";
          btnGunakan.style.background = "var(--success)";
          activePromo = null;
        }, 3000);

      } catch (err) {
        console.error("Gagal klaim promo: ", err);
        showToast("Terjadi kesalahan sistem, gagal klaim.", "#ef4444");
        btnGunakan.disabled = false;
        btnGunakan.innerHTML = "Gunakan Promo Sekarang";
      }
    }
  });

});
