import type { PRDTemplate, PRDDocument } from '../types';

export const templates: PRDTemplate[] = [
  {
    id: 'saas-b2b',
    name: 'SaaS Platform / B2B',
    category: 'saas',
    description: 'Cocok untuk platform berbasis web, portal admin, dashboard B2B, dan aplikasi SaaS multi-tenant.',
    icon: 'LayoutDashboard',
    sections: [
      { id: 'executive_summary', title: '1. Ringkasan Eksekutif', placeholder: 'Tuliskan gambaran umum fitur, latar belakang, dan mengapa fitur ini perlu dibuat.' },
      { id: 'problem_statement', title: '2. Pernyataan Masalah & Peluang', placeholder: 'Masalah apa yang sedang dihadapi user dan apa peluang bisnis yang didapatkan?' },
      { id: 'user_stories', title: '3. User Stories & Persona', placeholder: 'Siapa pengguna fitur ini dan bagaimana mereka menggunakannya? (Contoh: Sebagai [role], saya ingin [action] agar [benefit]).' },
      { id: 'functional_requirements', title: '4. Persyaratan Fungsional', placeholder: 'Daftar detail fitur, aturan bisnis, dan alur kerja aplikasi secara rinci.' },
      { id: 'non_functional_requirements', title: '5. Persyaratan Non-Fungsional', placeholder: 'Kriteria performa, skalabilitas, keamanan, dan batas latensi yang harus dipenuhi.' },
      { id: 'out_of_scope', title: '6. Batasan Fitur (Out of Scope)', placeholder: 'Daftar hal-hal yang TIDAK akan dikerjakan pada rilis versi pertama ini.' },
      { id: 'success_metrics', title: '7. Metrik Keberhasilan & KPI', placeholder: 'Bagaimana kita menilai fitur ini sukses? (Contoh: peningkatan konversi sebesar 15%).' }
    ]
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    category: 'mobile',
    description: 'Dirancang khusus untuk fitur mobile app native (iOS/Android), memperhatikan navigasi seluler dan mode offline.',
    icon: 'Smartphone',
    sections: [
      { id: 'executive_summary', title: '1. Ringkasan Fitur Mobile', placeholder: 'Gambaran umum fitur dan kegunaannya pada platform mobile.' },
      { id: 'problem_statement', title: '2. Konteks Pengguna Seluler', placeholder: 'Mengapa pengguna membutuhkan fitur ini di ponsel mereka (mobilitas, notifikasi, dll)?' },
      { id: 'ux_requirements', title: '3. Persyaratan UX & Alur Layar', placeholder: 'Deskripsi alur navigasi antar halaman, gesture, dan respon layar.' },
      { id: 'functional_requirements', title: '4. Fungsionalitas Aplikasi & Mode Offline', placeholder: 'Spesifikasi fitur utama serta perilaku aplikasi ketika tidak ada internet.' },
      { id: 'hardware_integration', title: '5. Integrasi Perangkat Keras', placeholder: 'Penggunaan fitur ponsel seperti Kamera, GPS, Push Notification, Biometrics, dll.' },
      { id: 'out_of_scope', title: '6. Batasan Fitur (Out of Scope)', placeholder: 'Hal-hal yang tidak diimplementasikan pada versi mobile ini.' },
      { id: 'success_metrics', title: '7. Metrik Retensi Seluler', placeholder: 'Metrik pelacakan seperti Daily Active Users (DAU) dan kecepatan loading layar.' }
    ]
  },
  {
    id: 'rest-api',
    name: 'API / Integration Service',
    category: 'api',
    description: 'Struktur teknis untuk merancang endpoint REST/GraphQL API, integrasi webhook, atau service backend.',
    icon: 'Database',
    sections: [
      { id: 'executive_summary', title: '1. Ringkasan API', placeholder: 'Deskripsi tujuan API, siapa konsumen API (front-end, pihak ketiga), dan use-case utama.' },
      { id: 'architecture_diagram', title: '2. Arsitektur & Alur Data', placeholder: 'Aliran data dari request masuk hingga response dikembalikan, serta integrasi database.' },
      { id: 'endpoint_specifications', title: '3. Spesifikasi Endpoint', placeholder: 'Detail URL, HTTP Method (GET/POST/PUT/DELETE), Request Headers, Body Parameter, dan Response Schema.' },
      { id: 'auth_security', title: '4. Autentikasi & Keamanan', placeholder: 'Bagaimana keamanan API dijamin? (OAuth2, JWT, Rate Limiting, API Key).' },
      { id: 'error_handling', title: '5. Penanganan Error', placeholder: 'Daftar error codes (misal: 400 Bad Request, 401 Unauthorized) dan format response error.' },
      { id: 'performance_sla', title: '6. Target Performa & SLA', placeholder: 'Persyaratan latensi (misal: P99 < 150ms) dan batas kapasitas request per detik (RPS).' }
    ]
  },
  {
    id: 'internal-tool',
    name: 'Internal Dev Tool',
    category: 'internal',
    description: 'Dokumentasi untuk membuat alat bantu developer, dashboard internal ops, CLI tool, atau automation script.',
    icon: 'Terminal',
    sections: [
      { id: 'executive_summary', title: '1. Deskripsi Alat Bantu', placeholder: 'Alat apa yang ingin dibuat dan tim internal mana yang akan menggunakannya?' },
      { id: 'problem_statement', title: '2. Masalah Operasional', placeholder: 'In-efisiensi apa yang ingin diselesaikan oleh alat ini? Berapa jam kerja yang bisa dihemat?' },
      { id: 'functional_requirements', title: '3. Persyaratan Fungsional', placeholder: 'Spesifikasi fitur utama, perintah CLI yang didukung, atau panel dashboard.' },
      { id: 'user_flow', title: '4. Alur Kerja Penggunaan', placeholder: 'Langkah demi langkah bagaimana tim internal mengoperasikan alat ini.' },
      { id: 'out_of_scope', title: '5. Batasan & Dependensi', placeholder: 'Sistem luar yang tidak disentuh atau fitur yang sengaja tidak dibuat karena resiko operasional.' }
    ]
  }
];

export const samplePRDs: PRDDocument[] = [
  {
    id: 'prd-sample-1',
    title: 'AI Code Review Assistant',
    description: 'Sistem integrasi GitHub Action untuk meninjau baris kode baru secara otomatis menggunakan LLM dan mendeteksi celah keamanan.',
    version: 2,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-03T15:20:00Z',
    tags: ['AI', 'Developer Tools', 'GitHub'],
    sections: [
      {
        id: 'executive_summary',
        title: '1. Ringkasan Eksekutif',
        content: `### Ringkasan Fitur
**AI Code Review Assistant** adalah ekstensi berbasis *GitHub Action* yang secara otomatis memeriksa setiap *Pull Request* (PR) baru yang diajukan ke repositori. Menggunakan model bahasa besar (LLM), asisten ini akan menganalisis perubahan kode (*diff*), mengidentifikasi bug potensial, menyarankan optimasi performa, dan memberikan peringatan jika mendeteksi adanya celah keamanan (seperti API key yang bocor atau kerentanan SQL injection).

### Mengapa Ini Penting?
Review kode secara manual memakan waktu rata-rata 30-60 menit per PR dan seringkali menunda proses penggabungan kode (*merge*). Dengan otomatisasi review awal ini, developer dapat memperbaiki kesalahan sintaksis dan keamanan dasar sebelum ditinjau oleh sesama developer (*peer reviewer*), menghemat hingga 40% waktu tinjauan.`
      },
      {
        id: 'problem_statement',
        title: '2. Pernyataan Masalah & Peluang',
        content: `### Masalah Utama
* **Kemacetan Tinjauan Kode (Review Bottlenecks)**: Antrean PR sering menumpuk karena tim sibuk menulis fitur baru, sehingga memperlambat siklus rilis.
* **Kebocoran Kunci Rahasia (Secret Leaks)**: Kadang-kadang developer tidak sengaja melakukan komit pada *environment variables* berisi kunci rahasia (API Key, password database).
* **Konsistensi Kualitas**: Developer junior seringkali melewatkan praktik penulisan kode bersih (*clean code*) karena kurangnya umpan balik instan.

### Peluang
Dengan memanfaatkan API model AI modern yang memiliki jendela konteks besar, kita dapat memindai perubahan baris kode secara *real-time* dengan biaya sangat rendah (kurang dari $0.05 per review) dan memberikan umpan balik dalam hitungan detik.`
      },
      {
        id: 'functional_requirements',
        title: '3. Persyaratan Fungsional',
        content: `### F1: Integrasi GitHub Webhook & Trigger
* Sistem harus mendengarkan event \`pull_request.opened\` dan \`pull_request.synchronize\` dari GitHub.
* Ketika dipicu, sistem harus mengunduh berkas *diff* dari PR tersebut.

### F2: Analisis AI & Review Komentar
* AI harus memindai berkas *diff* yang memiliki ukuran kurang dari 500 baris.
* Komentar review harus ditulis langsung pada baris kode yang bersangkutan di GitHub PR (*inline comments*).
* Komentar harus memiliki format terstruktur:
  1. **Kategori**: (Keamanan | Performa | Kerapihan Kode)
  2. **Deskripsi Masalah**: Penjelasan singkat mengapa bagian kode tersebut kurang optimal.
  3. **Rekomendasi Perbaikan**: Contoh potongan kode pengganti yang lebih baik.`
      },
      {
        id: 'non_functional_requirements',
        title: '4. Persyaratan Non-Fungsional',
        content: `* **Kecepatan Response**: Review harus selesai dan dikirim ke GitHub dalam waktu kurang dari 90 detik sejak webhook diterima.
* **Keamanan Data**: Kode sumber yang diunggah ke AI tidak boleh disimpan oleh penyedia AI untuk pelatihan model di masa depan (menggunakan API dengan kebijakan privasi komersial).
* **Keandalan**: Jika API AI mengalami timeout, GitHub Action harus gagal secara anggun (*fail gracefully*) tanpa menghalangi proses build CI/CD utama.`
      }
    ]
  },
  {
    id: 'prd-sample-2',
    title: 'E-Commerce Checkout Refactor',
    description: 'Penyederhanaan alur pembayaran dari 4 halaman menjadi 1 halaman (Single-Page Checkout) untuk menaikkan rasio konversi penjualan.',
    version: 3,
    created_at: '2026-05-15T08:30:00Z',
    updated_at: '2026-05-20T11:45:00Z',
    tags: ['E-Commerce', 'Checkout', 'UX Improvement'],
    sections: [
      {
        id: 'executive_summary',
        title: '1. Ringkasan Eksekutif',
        content: `### Latar Belakang Proyek
Alur checkout saat ini di platform e-commerce kami membutuhkan 4 langkah terpisah (Keranjang belanja -> Informasi Pengiriman -> Metode Pembayaran -> Konfirmasi Akhir). Data analytics menunjukkan adanya penurunan jumlah pengguna (*drop-off rate*) sebesar **38%** di antara langkah 2 dan langkah 3.

### Solusi
Membangun kembali alur checkout menjadi **Single-Page Checkout** (Satu Halaman Pembayaran) yang menggabungkan input pengiriman, pemilihan kurir, ringkasan keranjang, dan pilihan pembayaran dalam satu tampilan interaktif yang responsif.`
      },
      {
        id: 'problem_statement',
        title: '2. Pernyataan Masalah & Peluang',
        content: `### Masalah Utama
* Proses checkout memakan waktu terlalu lama (rata-rata 3.2 menit).
* Pengguna harus menunggu pemuatan halaman (*page load*) berkali-kali di setiap langkah.
* Pilihan kurir tidak muncul sebelum pengguna memasukkan alamat lengkap secara kaku, seringkali memicu error jika formulir kurang lengkap.

### Sasaran Bisnis
* Menurunkan angka keranjang belanja terbengkalai (*cart abandonment rate*) dari 68% menjadi di bawah 50%.
* Meningkatkan Conversion Rate secara keseluruhan sebesar minimal **15%** dalam kurun waktu 30 hari setelah peluncuran.`
      },
      {
        id: 'functional_requirements',
        title: '3. Persyaratan Fungsional',
        content: `### F1: Integrasi Satu Halaman (Unified UI)
* Pengguna dapat mengedit jumlah barang langsung di keranjang belanja mini yang terpasang di samping halaman checkout.
* Input alamat pengiriman menggunakan integrasi Google Maps Auto-complete untuk mempercepat pengisian.

### F2: Kalkulasi Biaya Real-time (Dynamic Pricing)
* Pilihan kurir dan ongkos kirim harus diperbarui secara otomatis menggunakan AJAX setelah koordinat alamat terisi.
* Kode promo/kupon diskon dapat dimasukkan dan langsung memotong total tagihan secara instan tanpa memuat ulang seluruh halaman.`
      }
    ]
  }
];
