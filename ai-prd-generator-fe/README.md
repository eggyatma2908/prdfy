# PRDfy - AI PRD Generator & Workspace

**PRDfy** adalah aplikasi web SaaS bertenaga AI yang membantu tim produk, pengembang, dan founder menyusun dokumen spesifikasi produk (*Product Requirements Document* - PRD) yang lengkap dan terstruktur dalam hitungan detik.

Aplikasi ini menggunakan model bahasa **Google Gemini API** (Gemini 2.5 Flash), dilengkapi dengan diagram Mermaid.js interaktif, autentikasi sesi, sistem backup/riwayat versi dokumen, model rating umpan balik pengguna, dan pemrosesan langganan pembayaran lokal terintegrasi (Midtrans Snap).

---

## 🚀 Fitur Utama

- **AI PRD Generator (SSE Streaming)**: Membuat PRD multi-bagian yang mendalam dari satu prompt masukan secara real-time.
- **Diagram Mermaid Interaktif**: Menampilkan diagram alur sistem yang dapat di-zoom, dilihat fullscreen, dan diedit kodenya secara langsung.
- **Asisten AI Chat & Panel Perbandingan (Diff Viewer)**: Berdiskusi langsung dengan AI untuk merevisi draf PRD dan membandingkan perubahannya sebelum diterapkan.
- **Manajemen Riwayat Versi**: Menyimpan otomatis cadangan dokumen lama saat revisi diterapkan dan dapat dipulihkan (*rollback*) kapan saja.
- **Autentikasi Aman**: Didukung oleh Better Auth dengan dukungan masuk via Email/Kata Sandi serta Google OAuth.
- **Sistem Monetisasi (SaaS)**: Integrasi Midtrans Snap dengan verifikasi notifikasi SHA-512 backend yang memisahkan akses untuk tingkat Free, Premium, dan Super Admin.
- **Sistem Umpan Balik (Feedback)**: Rating bintang dan saran teks yang disimpan langsung ke database PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS v4 (CSS-first configuration) + Dark Mode toggle
- **Animasi & Ikon**: Framer Motion + Lucide React
- **Diagram Engine**: Mermaid.js v10

### Backend (API Server)
- **Framework**: Node.js + Express (TypeScript)
- **Database ORM**: Prisma ORM
- **Database Engine**: PostgreSQL
- **Autentikasi**: Better Auth
- **AI Core**: Google Generative AI SDK (Gemini-2.5-flash)
- **Payment Gateway**: Midtrans Snap SDK

---

## 📁 Struktur Direktori Proyek

Proyek ini terbagi menjadi dua bagian utama:
```
ai-prd-generator/
├── ai-prd-generator-be/      # Backend API Server & Database
│   ├── prisma/                # Skema DB & Berkas Migrasi SQL
│   ├── src/                   # Source Code Express (TS)
│   ├── Dockerfile             # Multi-stage build runner
│   └── docker-compose.yml     # Orkestrasi lokal Backend + DB
└── ai-prd-generator-fe/      # Frontend Client (React)
    ├── public/                # File aset publik
    ├── src/                   # Source Code React (TSX)
    ├── index.html             # Entry point HTML utama
    └── prd.md                 # Product Requirements Document PRDfy
```

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** (v20 atau lebih baru)
- **Docker & Docker Desktop** (Sangat disarankan untuk orkestrasi database & backend)

---

### Metode A: Menggunakan Docker Compose (Direkomendasikan)

Metode ini akan menjalankan Backend API, database PostgreSQL, dan Prisma Studio secara otomatis dalam satu jaringan kontainer.

1. Masuk ke direktori backend:
   ```bash
   cd ai-prd-generator-be
   ```
2. Buat file `.env` di folder backend Anda dan konfigurasikan isinya (lihat bagian [Environment Variables](#environment-variables)).
3. Jalankan Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Kontainer akan menjalankan migrasi database secara otomatis dan menyajikan:
   - **Backend Server**: `http://localhost:3000`
   - **Prisma Studio**: `http://localhost:5555` (untuk melihat isi database secara visual)

---

### Metode B: Menjalankan Secara Manual

Jika Anda ingin menjalankan database PostgreSQL secara terpisah dan menjalankan server Node.js di lokal host Anda:

#### 1. Setup Backend
1. Masuk ke folder backend dan pasang dependensi:
   ```bash
   cd ai-prd-generator-be
   npm install
   ```
2. Buat file `.env` dan jalankan migrasi database:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Jalankan backend dalam mode pengembangan (*development*):
   ```bash
   npm run dev
   ```

#### 2. Setup Frontend
1. Buka terminal baru, masuk ke folder frontend, dan pasang dependensi:
   ```bash
   cd ai-prd-generator-fe
   npm install
   ```
2. Buat file `.env` di folder frontend dan tambahkan konfigurasi opsional:
   ```env
   VITE_CREATOR_EMAIL="email-owner-anda@gmail.com"
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
4. Buka browser Anda di: `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend (`ai-prd-generator-be/.env`)
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/prd_generator?schema=public"

# Autentikasi (Better Auth)
BETTER_AUTH_SECRET="kunci-acak-rahasia-32-karakter"
BETTER_AUTH_URL="http://localhost:3000"
SESSION_EXPIRES_IN=1800 # Durasi sesi (detik)
ALLOWED_ORIGINS="http://localhost:5173" # Tambahkan domain prod Anda (dipisah koma)

# AI Engine
GEMINI_API_KEY="API_KEY_GOOGLE_AI_STUDIO_ANDA"
GEMINI_MODEL="gemini-2.5-flash"

# Sosial Login (Opsional dari Google Cloud Console)
GOOGLE_CLIENT_ID="google-client-id-anda"
GOOGLE_CLIENT_SECRET="google-client-secret-anda"

# Email Super Administrator (Sesuaikan dengan email pendaftaran Anda)
CREATOR_EMAIL="email-owner-anda@gmail.com"

# Pembayaran (Midtrans)
MIDTRANS_CLIENT_KEY="Mid-client-..."
MIDTRANS_SERVER_KEY="Mid-server-..."
MIDTRANS_IS_PRODUCTION=false # Set true untuk live production
```

### Frontend (`ai-prd-generator-fe/.env` - Opsional)
```env
VITE_CREATOR_EMAIL="email-owner-anda@gmail.com"
VITE_API_URL="http://localhost:3000" # Biarkan kosong jika ingin fallback ke localhost default
```

---

## ☁️ Panduan Deployment (VPS & Coolify)

Proyek ini telah dioptimalkan agar dapat dideploy dengan mudah ke platform cloud modern berbasis Docker/PaaS seperti **Coolify** (pada VPS Rumahweb, DigitalOcean, dsb):

1. **Database**: Buat database PostgreSQL di panel Coolify Anda.
2. **Backend**:
   - Buat aplikasi baru dari repositori Git Anda (pilih sub-folder `/ai-prd-generator-be`).
   - Gunakan build pack **Dockerfile**.
   - Masukkan seluruh variabel lingkungan backend di atas (ubah `BETTER_AUTH_URL` dan `ALLOWED_ORIGINS` ke URL produksi Anda).
3. **Frontend**:
   - Buat aplikasi baru dari repositori Git Anda (pilih sub-folder `/ai-prd-generator-fe`).
   - Gunakan build pack **Nixpacks** / **Static** (folder tujuan build adalah `dist`).
   - Masukkan variabel lingkungan `VITE_API_URL` yang mengarah ke domain backend produksi Anda.
4. **Google OAuth & Midtrans**:
   - Daftarkan domain callback API backend Anda ke OAuth redirect URIs di Google Cloud Console.
   - Set Payment Notification URL pada dashboard Midtrans ke: `https://api.domain-anda.com/api/prd/payment/notification`.
