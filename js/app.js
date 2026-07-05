/* ===================================================================
   app.js – Indofood Login (static / Vercel)
   =================================================================== */

const DASHBOARD_PAGE = 'dashboard.html';

const DEMO_USERS = [
  { email: 'admin@indofood.com',  password: 'admin123', name: 'Administrator' },
  { email: 'user@indofood.com',   password: 'user123',  name: 'User Indofood' },
  { email: 'demo@perusahaan.com', password: 'demo123',  name: 'Demo Pengguna' },
];

function isLoggedIn() {
  return !!(
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('user_name') ||
    sessionStorage.getItem('user_name')
  );
}

// ── DOM References ──────────────────────────────────────────────────
const form        = document.getElementById('loginForm');
const emailInput  = document.getElementById('email');
const pwdInput    = document.getElementById('password');
const emailErr    = document.getElementById('emailError');
const pwdErr      = document.getElementById('passwordError');
const alertBox    = document.getElementById('alertBox');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = submitBtn.querySelector('.btn-text');
const spinner     = document.getElementById('spinner');
const togglePwd   = document.getElementById('togglePwd');
const eyeIcon     = document.getElementById('eyeIcon');
const forgotLink  = document.getElementById('forgotLink');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose  = document.getElementById('modalClose');
const resetBtn    = document.getElementById('resetBtn');
const resetEmail  = document.getElementById('resetEmail');
const modalFeedback = document.getElementById('modalFeedback');

// ── Utility Helpers ─────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function showAlert(message, type = 'error') {
  alertBox.textContent = message;
  alertBox.className = 'alert ' + type;
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
  alertBox.textContent = '';
  alertBox.className = 'alert';
}

function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  input.classList.add('invalid');
}

function clearFieldError(input, errorEl) {
  errorEl.textContent = '';
  input.classList.remove('invalid');
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.hidden = isLoading;
  spinner.hidden = !isLoading;
}

function saveSession(user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('auth_token', 'session-' + Date.now());
  storage.setItem('user_name', user.name);
  storage.setItem('user_email', user.email);
}

// ── Real-time Validation ────────────────────────────────────────────
emailInput.addEventListener('input', () => {
  if (emailInput.value && !isValidEmail(emailInput.value)) {
    setFieldError(emailInput, emailErr, 'Format email tidak valid.');
  } else {
    clearFieldError(emailInput, emailErr);
  }
});

pwdInput.addEventListener('input', () => {
  if (pwdInput.value && pwdInput.value.length < 6) {
    setFieldError(pwdInput, pwdErr, 'Password minimal 6 karakter.');
  } else {
    clearFieldError(pwdInput, pwdErr);
  }
});

// ── Password Visibility Toggle ──────────────────────────────────────
togglePwd.addEventListener('click', () => {
  const isHidden = pwdInput.type === 'password';
  pwdInput.type = isHidden ? 'text' : 'password';
  eyeIcon.innerHTML = isHidden
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
       <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  togglePwd.setAttribute('aria-label', isHidden ? 'Sembunyikan password' : 'Tampilkan password');
});

// ── Form Submit ─────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email    = emailInput.value.trim().toLowerCase();
  const password = pwdInput.value.trim();
  const remember = document.getElementById('remember').checked;
  let valid = true;

  if (!email) {
    setFieldError(emailInput, emailErr, 'Email tidak boleh kosong.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldError(emailInput, emailErr, 'Format email tidak valid.');
    valid = false;
  } else {
    clearFieldError(emailInput, emailErr);
  }

  if (!password) {
    setFieldError(pwdInput, pwdErr, 'Password tidak boleh kosong.');
    valid = false;
  } else if (password.length < 6) {
    setFieldError(pwdInput, pwdErr, 'Password minimal 6 karakter.');
    valid = false;
  } else {
    clearFieldError(pwdInput, pwdErr);
  }

  if (!valid) return;

  setLoading(true);
  await new Promise((r) => setTimeout(r, 600));

  const matched = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (matched) {
    saveSession(matched, remember);
    showAlert(`Selamat datang, ${matched.name}! Mengalihkan…`, 'success');
    setTimeout(() => {
      window.location.href = DASHBOARD_PAGE;
    }, 1200);
  } else {
    showAlert('Email atau password salah. Silakan coba lagi.');
  }

  setLoading(false);
});

// ── Forgot Password Modal ───────────────────────────────────────────
forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  modalOverlay.classList.add('open');
  resetEmail.value = emailInput.value;
  modalFeedback.textContent = '';
  modalFeedback.className = 'modal-feedback';
});

function closeModal() {
  modalOverlay.classList.remove('open');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

resetBtn.addEventListener('click', async () => {
  const email = resetEmail.value.trim();
  if (!isValidEmail(email)) {
    modalFeedback.textContent = 'Masukkan email yang valid.';
    modalFeedback.className = 'modal-feedback error';
    return;
  }

  resetBtn.disabled = true;
  resetBtn.textContent = 'Mengirim…';
  await new Promise((r) => setTimeout(r, 800));

  modalFeedback.textContent = `Instruksi reset telah dikirim ke ${email}.`;
  modalFeedback.className = 'modal-feedback success';
  resetBtn.disabled = false;
  resetBtn.textContent = 'Kirim Instruksi';
  setTimeout(closeModal, 2500);
});

// ── On Page Load ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    window.location.href = DASHBOARD_PAGE;
    return;
  }
  emailInput.focus();
});
