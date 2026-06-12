# PRODUCT REQUIREMENTS DOCUMENT
## PRDfy - AI PRD Generator & Workspace

---

## 📄 Document Information

| Field | Value |
|------|------|
| Product Name | PRDfy |
| Type | Web Application (SaaS Platform) |
| Target Users | Developers, Product Managers, Solo Founders |
| Stack | Vite + React (FE), Express + Node.js (BE), Prisma ORM, PostgreSQL, Google Gemini API |
| Status | Completed (Ready for Production) |
| Version | v1.0 |
| Author | Eggy Atma Riansyah & Antigravity AI |

---

# 1. Executive Summary

**PRDfy** adalah aplikasi web SaaS bertenaga AI (Google Gemini) yang memungkinkan pengguna menyusun *Product Requirements Document* (PRD) yang komprehensif, terstruktur, dan siap produksi hanya dari satu deskripsi ide singkat.

Alur kerja utama pengguna sangat efisien:
> **Masuk/Daftar** ➔ **Input Ide Produk** ➔ **AI Men-generate PRD** ➔ **Edit/Revisi Manual & AI Chat** ➔ **Ekspor PDF/MD**

Aplikasi ini menyertakan sistem autentikasi modern, pembatasan kuota berbasis langganan (Free vs Premium), integrasi pembayaran lokal (Midtrans Snap), dan sistem umpan balik pengguna langsung ke basis data.

---

# 2. Problem Statement

Menulis PRD secara manual memiliki kendala:
- Memerlukan waktu berjam-jam bahkan berhari-hari.
- Format dan struktur dokumen seringkali tidak konsisten.
- Sulit memetakan aspek teknis (seperti arsitektur database, diagram alur, dan spesifikasi API) bagi non-programmer atau solo founder.
- Sulit memperbarui dokumen secara dinamis saat ide produk berkembang.

PRDfy memecahkan masalah ini dengan menyediakan workspace satu layar terintegrasi yang menghasilkan dokumen berskala enterprise dalam hitungan detik.

---

# 3. Product Goals

- **Kecepatan Tinggi**: Menghasilkan dokumen PRD lengkap dalam waktu kurang dari 10 detik.
- **Interaktivitas Visual**: Menyediakan visualisasi alur sistem secara langsung menggunakan diagram Mermaid.js yang interaktif.
- **Skalabilitas**: Siap dipublikasikan mandiri (self-hosted) di infrastruktur VPS menggunakan platform kontainer seperti Coolify.
- **SaaS Ready**: Sistem monetisasi terintegrasi yang aman untuk mengonversi pengguna free-tier menjadi pembayar premium.

---

# 4. Target Users

1. **Solo Founders & Entrepreneurs**: Ingin memvalidasi dan mendokumentasikan ide bisnis mereka dengan cepat untuk dipresentasikan ke tim pengembang atau investor.
2. **Software Engineers & Developers**: Memerlukan spesifikasi teknis dan skema database yang cepat sebelum memulai proses coding (mencegah *scope creep*).
3. **Product Managers**: Memerlukan draf dasar PRD yang cepat untuk disempurnakan.

---

# 5. Core Features (Implemented)

### 🔑 F1 — Autentikasi & Manajemen Sesi (Better Auth)
- Pendaftaran akun baru menggunakan **Nama**, **Email**, dan **Kata Sandi**.
- Integrasi **Google OAuth** untuk proses masuk satu klik.
- Keamanan sesi berbasis cookies HTTP-only yang dikelola oleh Better Auth.

### 🔥 F2 — AI PRD Generator (Gemini 2.5 Flash)
- Form input deskripsi produk dengan opsi tambahan:
  - Judul Dokumen (Kustom)
  - Tech Stack (Spesifikasi Teknologi)
  - Target Pengguna (Audiens)
  - Tag Kategori
- Animasi checklist penyusunan dokumen (perceived progress) selama ~7 detik.
- Streaming respon AI (SSE) instan untuk menyusun 7 bagian PRD utama:
  1. Ringkasan Eksekutif (*Executive Summary*)
  2. Deskripsi Masalah (*Problem Statement*)
  3. Tujuan Produk & Persyaratan Fungsional
  4. Persyaratan Non-Fungsional (Kinerja, Keamanan, Latensi)
  5. Arsitektur Sistem & Diagram Alur (Mermaid.js)
  6. Skema Database & Relasi Tabel
  7. Strategi Pengujian & QA

### 📊 F3 — Diagram Mermaid.js Interaktif
- Render visual otomatis untuk kode Mermaid yang dihasilkan oleh AI.
- Kontrol interaktif di layar:
  - Zoom-in / Zoom-out
  - Reset tampilan posisi diagram
  - Tampilan Layar Penuh (*Fullscreen*)
  - Penyuntingan Kode langsung (Live Editor) dengan kompilasi ulang instan.

### ✏️ F4 — Workspace Editor Dual-Panel
- **Panel Kiri**: Tab Outline Dokumen, Riwayat Versi Dokumen, dan Editor Markdown Mentah (Raw Markdown Editor) dengan fitur penyimpanan otomatis (*auto-save*) ke database.
- **Panel Kanan**: Hasil Pratinjau Dokumen (Real-time HTML preview render) dan Panel Asisten AI Chat.

### 🤖 F5 — Asisten AI Chat (Revisi Kontekstual)
- Mengobrol langsung dengan AI untuk merevisi bagian PRD tertentu (misal: *"tambahkan tabel transaksi"*, *"ubah arsitektur menjadi microservices"*).
- Menampilkan panel perbandingan perubahan (Diff Viewer) sebelum pengguna menyetujui (*Apply*) atau menolak (*Reject*) revisi AI tersebut.

### 💾 F6 — Riwayat Dokumen & Versi (Lightweight Snapshots)
- **Sidebar Riwayat**: Daftar semua PRD yang pernah dibuat pengguna.
- **Snapshot Versi**: Setiap kali pengguna menyetujui perubahan AI Chat, sistem secara otomatis menyimpan versi cadangan lama. Pengguna dapat melakukan pemulihan (*rollback*) ke versi sebelumnya kapan saja.

### 💳 F7 — Midtrans Snap Payment Gateway
- Sistem upgrade akun Premium menggunakan **Midtrans Snap SDK** (mendukung transfer bank, e-wallet seperti GoPay/OVO, dan kartu kredit).
- Verifikasi keamanan backend menggunakan pencocokan signature SHA-512 dari webhook notifikasi Midtrans.
- Dukungan deteksi otomatis sandbox/production mode secara aman.

### 💬 F8 — Sistem Upan Balik (Feedback System)
- Pengguna dapat memberikan rating bintang (1-5) dan komentar saran secara langsung dari menu navigasi avatar.
- Data disimpan secara permanen di database PostgreSQL untuk analisis pengembangan aplikasi.

---

# 6. Subscription Matrix & Monetization

Aplikasi ini dibagi menjadi 3 tingkat (tier) keanggotaan:

| Fitur | Free Tier | Premium Tier (Rp 55.000 / Bulan) | Super Administrator |
| :--- | :--- | :--- | :--- |
| **Batas Pembuatan PRD** | 1 Dokumen (Maksimum Seumur Hidup) | 5 Dokumen per Hari (Reset Setiap Hari) | **Tanpa Batas** |
| **Asisten AI Chat** | Terkunci (Locked) | **Terbuka (Unlimited)** | **Terbuka (Unlimited)** |
| **Format Ekspor** | Hanya Markdown (.md) | **Markdown (.md) & Cetak PDF** | **Markdown (.md) & Cetak PDF** |
| **Riwayat Versi** | Terkunci | **Terbuka** | **Terbuka** |
| **Akses Tombol Super Admin** | Tersembunyi | Tersembunyi | **Terlihat (Untuk Creator Email)** |

---

# 7. Non-Functional Requirements (NFR)

- **Kecepatan Respon**: Proses pembuatan PRD oleh Gemini API diselesaikan dan di-stream ke pengguna dalam waktu `< 10 detik`.
- **Keamanan Variabel Lingkungan**: API Key Google Gemini, Secret Better Auth, dan Kunci Server Midtrans disimpan aman di sisi server (backend `.env`), terlindungi dari kebocoran client-side.
- **Responsivitas**: Desain antarmuka responsif (Mobile Friendly) dengan sidebar riwayat yang bisa disembunyikan.
- **Z-Index Layering**: Notifikasi Toast berada pada `z-[100]` agar tetap terlihat jelas di atas backdrop blur modal aktif.

---

# 8. Tech Stack Detail

| Layer | Teknologi yang Digunakan |
|------|--------|
| **Frontend Framework** | React 18 + Vite (TypeScript) |
| **Styling & Theme** | TailwindCSS v4 + Dark/Light Theme Support |
| **Icons & Animation** | Lucide React + Framer Motion |
| **Backend Framework** | Node.js + Express (TypeScript) |
| **Database ORM** | Prisma ORM |
| **Database Engine** | PostgreSQL (Dockerized / Cloud Managed) |
| **Autentikasi** | Better Auth |
| **AI LLM Engine** | Google Gemini API (Gemini-2.5-flash) |
| **Payment Gateway** | Midtrans Snap Integration |
| **Diagram Engine** | Mermaid.js v10 |

---

# 9. Deployment Architecture

Aplikasi dikemas menggunakan kontainerisasi **Docker** dan siap untuk di-deploy menggunakan **Coolify** pada **Cloud VPS Rumahweb** (Ubuntu OS).

- **Database**: PostgreSQL kontainer dengan volume persisten.
- **Backend API**: Node.js app yang dibangun dari `Dockerfile` multi-stage builder.
- **Frontend App**: Static Site yang di-build (`dist/`) dan disajikan langsung menggunakan engine web server internal Coolify (Nixpacks/Vite Static).
- **Reverse Proxy / SSL**: Ditangani sepenuhnya secara otomatis oleh Traefik bawaan Coolify dengan Let's Encrypt SSL.

---

# 10. Document Version History

| Versi | Tanggal | Deskripsi Perubahan |
|--------|------|--------|
| v0.1 | 2026-06 | Draf MVP awal untuk AI PRD Generator (stateless). |
| v0.2 | 2026-06 | Integrasi database lokal dan model penyimpanan dokumen. |
| v1.0 | 2026-06 | **Rilis Produksi (PRDfy)**: Penambahan fitur Better Auth, Integrasi Pembayaran Real Midtrans, Sistem Umpan Balik, Dukungan Mermaid diagram interaktif, dan Optimalisasi Kontainer Coolify. |

---