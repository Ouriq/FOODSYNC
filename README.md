# FoodSync Login & Dashboard

Aplikasi web statis (HTML/CSS/JS) untuk login dan dashboard Sales Marketing.

## Struktur Proyek

```
├── index.html        ← Halaman login
├── dashboard.html    ← Dashboard setelah login
├── app.js            ← Logika login (client-side)
├── dashboard.js      ← Logika dashboard & logout
├── style.css
├── dashboard.css
└── vercel.json       ← Konfigurasi deploy Vercel
```

## Akun Demo

| Email | Password |
|-------|----------|
| admin@foodsync.com | admin123 |
| user@foodsync.com | user123 |
| demo@perusahaan.com | demo123 |

## Menjalankan Lokal

Buka `index.html` lewat Live Server, atau:

```bash
npx serve .
```

Lalu buka `http://localhost:3000` (atau port yang ditampilkan).

## Deploy ke Vercel

1. Push proyek ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Deploy — Vercel otomatis mendeteksi situs statis

Setelah deploy: login di `/` → redirect ke `dashboard.html`, logout kembali ke `index.html`.
