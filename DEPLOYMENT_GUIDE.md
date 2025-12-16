# Panduan Deployment ke Render.com (Gratis)

Panduan ini akan membantu Anda meng-online-kan aplikasi **TiketKu** agar bisa diakses dari mana saja.

---

## Persiapan Awal

1.  **Daftar Akun GitHub**: Buka [github.com](https://github.com/) dan buat akun (jika belum punya).
2.  **Daftar Akun Render**: Buka [render.com](https://render.com/) dan login menggunakan akun GitHub Anda.
3.  **Daftar Akun Supabase (Database)**: Buka [supabase.com](https://supabase.com/) dan login/daftar. (Kita butuh ini untuk Database PostgreSQL Gratis).

---

## Langkah 1: Upload Kode ke GitHub

Anda perlu meng-upload folder proyek ini ke GitHub.
1.  Buka **GitHub** > Klik **New Repository**.
2.  Beri nama (misal: `tiketku-app`).
3.  Jangan centang "Add README" dsb, biarkan kosong. Klik **Create repository**.
4.  Di komputer Anda (Terminal `c:\tiket`), jalankan perintah ini (satu per satu):

```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/tiketku-app.git  <-- Ganti link ini dengan link repo Anda
git push -u origin main
```

*(Jika diminta login, ikuti instruksi di terminal).*

---

## Langkah 2: Buat Database (Supabase)

1.  Di Dashboard **Supabase**, klik **New Project**.
2.  Buat password database yang kuat (Simpan password ini!).
3.  Tunggu sampai database selesai dibuat (hijau).
4.  Masuk ke menu **Project Settings** > **Database** > **Connection String**.
5.  Pilih **Node.js** dan copy link yang muncul (`postgresql://postgres:[PASSWORD]@...`).
6.  **PENTING**: Ganti `[PASSWORD]` di link tersebut dengan password yang Anda buat tadi. Simpan link lengkap ini untuk nanti.

---

## Langkah 3: Deploy Aplikasi (Render)

1.  Di Dashboard **Render**, klik **New +** > **Web Service**.
2.  Pilih **Build and deploy from a Git repository**.
3.  Connect akun GitHub Anda, dan cari repository `tiketku-app`. Klik **Connect**.
4.  Isi form berikut:
    - **Name**: `tiketku-app` (bebas)
    - **Region**: Singapore (biar cepat di Indo)
    - **Branch**: `main`
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
    - **Instance Type**: Free

5.  **PENTING**: Scroll ke bawah ke bagian **Environment Variables**. Klik **Add Environment Variable**:
    - Key: `DATABASE_URL`
    - Value: (Paste link Supabase tadi yang sudah ada passwordnya)

6.  Klik **Create Web Service**.

---

## Langkah 4: Selesai! 🎉

Tunggu proses build selesai (sekitar 3-5 menit).
Jika berhasil, Anda akan melihat status **Live** dan link website Anda (misal: `https://tiketku-app.onrender.com`).

Link tersebut bisa Anda buka dari HP, Laptop teman, atau browser manapun!
