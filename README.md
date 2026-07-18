# Dashboard Portfolio

Dashboard portfolio modern untuk membuat, mengelola, dan mempublikasikan portfolio secara cepat.

## Fitur

- Builder portfolio dengan drag-and-drop
- Beberapa template portfolio responsif
- Tema warna yang dapat disesuaikan
- AI Advisor untuk membantu mengisi konten
- Import profil GitHub
- Analytics pengunjung
- Manajemen pengguna dan role admin
- Export portfolio ke PDF

## Tech Stack

- Next.js 16 App Router
- React 19 dan TypeScript
- Tailwind CSS v4
- Supabase
- Framer Motion
- React Hook Form
- Recharts

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- Akses ke service yang digunakan aplikasi, seperti Supabase dan API backend terkait

## Instalasi

```bash
git clone https://github.com/Trias1/dashboard-portfolio.git
cd dashboard-portfolio
npm install
```

## Konfigurasi Environment

Buat file `.env.local` di root project berdasarkan variable yang dibutuhkan aplikasi. File environment lokal tidak boleh di-commit ke repository.

Gunakan secret dari dashboard service masing-masing untuk variable seperti database, autentikasi, email, storage, dan integrasi AI. Jangan menaruh token, password, private key, atau service-role key langsung di source code.

## Menjalankan Lokal

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## Build Production

```bash
npm run build
npm start
```

Pemeriksaan lint tersedia melalui:

```bash
npm run lint
```

## Struktur Utama

```text
src/
├── app/          # Halaman, layout, dan API route
├── components/   # Komponen UI bersama
├── lib/          # Helper dan integrasi service
└── templates/    # Template portfolio
supabase/         # Konfigurasi dan script database
public/           # Asset statis
```

## Template Portfolio

| Template | Gaya |
| --- | --- |
| Modern | Dark elegant dengan animasi |
| Creative | Sidebar editorial dengan kartu rounded |
| Minimal | Tipografi bersih dan fokus pada konten |
| Bold | Gradient, neon glow, dan glassmorphism |

## Deployment

Build aplikasi terlebih dahulu, lalu deploy ke platform Node.js yang mendukung Next.js. Pastikan semua environment variable production dikonfigurasi melalui secret manager platform deployment, bukan melalui repository.

## Catatan Keamanan

- Jangan commit file `.env*`, credential, atau private key.
- Gunakan environment variable berbeda untuk development dan production.
- Batasi akses service-role key hanya di server.
