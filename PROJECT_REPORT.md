# Laporan Proyek: TiketKu (Ticket Platform)

## 📌 Ringkasan Proyek
**TiketKu** adalah platform penjualan tiket event berbasis web yang memungkinkan pengguna membeli tiket dan penyelenggara (Admin) mengelola event. Proyek ini telah berkembang dari sistem dasar menjadi aplikasi siap-cloud dengan fitur keamanan dan manajemen data yang komprehensif.

---

## 🛠️ Teknologi yang Digunakan
- **Bahasa**: Node.js (Runtime), JavaScript (Frontend/Backend)
- **Framework**: Express.js (Web Server)
- **Database (Hybrid)**:
    - **Development (Lokal)**: SQLite (`tickets.db`) - File based, tanpa instalasi.
    - **Production (Cloud)**: PostgreSQL - Siap deploy ke Render/Vercel via `DATABASE_URL`.
- **Fitur Khusus**:
    - `multer`: Upload file gambar.
    - `bcrypt`: Keamanan password.
    - `jsonwebtoken`: Autentikasi berbasis token.

---

## 🚀 Fitur Utama & Update Terbaru

### 1. Sistem Login Terpadu (Unified Auth)
- **Satu Pintu Login**: Admin dan User login melalui modal yang sama di halaman utama.
- **Deteksi Role Otomatis**:
    - **User**: Tetap di halaman utama untuk beli tiket.
    - **Admin**: Otomatis dialihkan ke Dashboard Admin.
- **Registrasi**: User baru bisa memilih role (Pembeli Tiket / Pengelola Event) saat mendaftar.

### 2. Manajemen Event Spesifik (Event Ownership)
- **Kepemilikan Data**: Setiap Admin hanya bisa melihat dan mengedit event yang dibuatnya sendiri di Dashboard.
- **Halaman Publik**: Pengunjung tetap bisa melihat **semua event** dari seluruh admin.

### 3. Upload Gambar Event 📸 (Baru!)
- Admin kini bisa mengunggah file foto dari HP/Laptop.
- Foto disimpan di server lokal (`public/uploads`) dan otomatis ditampilkan di halaman event.

### 4. Database Hybrid (Siap Cloud) ☁️
- Kode database telah dimodifikasi menjadi "Adapter Pintar".
- Otomatis menggunakan **SQLite** saat dijalankan di komputer Anda.
- Otomatis berubah ke **PostgreSQL** jika di-upload ke hosting gratis.

### 5. Akses Mobile (Smartphone) 📱
- Aplikasi Responsif (Tampilan menyesuaikan layar HP).
- Bisa diakses dari HP via jaringan WiFi yang sama (misal: `http://192.168.0.100:3000`).

---

## 📊 Status Pengembangan
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Registrasi & Login | ✅ Selesai | Role-based (User/Admin) |
| CRUD Event | ✅ Selesai | Create, Read, Update, Delete |
| Upload Gambar | ✅ Selesai | Support JPG/PNG/GIF |
| Pembelian Tiket | ✅ Selesai | Simulasi transaksi & stok berkurang |
| Barcode Tiket | ✅ Selesai | Generate unik per tiket |
| Scan Tiket | ✅ Selesai | Validasi tiket masuk |
| Database Migration | ✅ Selesai | SQLite <-> PostgreSQL |

---

## 📝 Catatan untuk Deployment
Untuk meng-online-kan aplikasi ini agar bisa diakses 24 jam tanpa komputer nyala:
1. **Hosting Aplikasi**: Gunakan **Render** atau **Railway** (Upload code ini).
2. **Database Cloud**: Gunakan **Supabase** atau **Neon** (Dapatkan Connection String).
3. **Environment Variable**: Set `DATABASE_URL` di hosting Anda.

Proyek ini sudah sepenuhnya siap untuk tahap tersebut! 🚀
