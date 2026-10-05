# Warung Kita — Aplikasi Kasir & Stok untuk Warung Grosir

Aplikasi kasir sederhana yang bisa dibuka lewat browser HP (seperti buka Instagram/WhatsApp), tanpa perlu install dari Play Store. Dibuat khusus supaya **mudah dipakai orang yang tidak terbiasa pakai komputer**.

## Fitur Utama

- **3 tingkat harga otomatis**: Umum (pembeli biasa), Grosir/B2B (antar warung), Donasi (harga spesial sosial). Tinggal pilih jenis pembeli, semua harga di keranjang otomatis menyesuaikan.
- **Scan barcode pakai kamera HP** untuk produk kemasan pabrik (mie instan, sabun, minuman, dll), ditambah **grid tombol gambar** untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dll). Mendukung juga alat scanner barcode USB/Bluetooth kalau nanti warung mau pakai.
- **Keranjang & total otomatis** — tidak perlu hitung manual pakai kalkulator. Tinggal tap produk, total langsung muncul.
- **Pembayaran & kembalian otomatis dihitung**, hasilnya tersimpan sebagai "struk digital" di sistem (tidak perlu printer), dan bisa dibagikan ke pembeli lewat WhatsApp kalau mau.
- **Rekap stok otomatis**: produk apa yang paling laku, mana yang "stuck" (modal mengendap, tidak laku), dan daftar prioritas belanja/restock supaya tidak kehabisan barang penting.
- **2 jenis akses**: Pemilik (lihat semua termasuk keuntungan & kelola harga) dan Pegawai (hanya kasir, lihat stok, tambah stok — tidak bisa lihat untung/modal).
- **Login pakai PIN angka** (bukan email/password) — tinggal pilih nama lalu masukkan PIN 4-6 digit, cocok untuk yang tidak terbiasa internet.
- Bisa **"ditambahkan ke Layar Utama HP"** supaya tampil seperti aplikasi asli dengan ikon sendiri (PWA).

---

## 1. Cara Mengaktifkan Aplikasi Ini (Online, Gratis)

Aplikasi ini perlu di-"deploy" (dipasang ke internet) satu kali saja. Setelah itu, pemilik dan pegawai tinggal buka alamat websitenya dari browser HP masing-masing — tidak perlu install ulang apa pun.

Butuh waktu sekitar 15-20 menit, dan **gratis** (untuk skala 1 warung, jauh di bawah batas gratis layanan yang dipakai). Kalau ada kenalan yang agak paham teknologi (anak muda di desa, misalnya), proses ini paling enak diminta bantuan sekali saja di awal.

### Yang dibutuhkan
- Akun GitHub (gratis, buat di [github.com](https://github.com))
- Akun Vercel (gratis, bisa daftar pakai akun GitHub di [vercel.com](https://vercel.com))
- Akun Neon — database gratis (daftar pakai akun GitHub di [neon.tech](https://neon.tech))

### Langkah-langkah

1. **Unggah folder proyek ini ke GitHub**
   - Buat repository baru di GitHub (tombol hijau "New").
   - Upload semua isi folder ini ke repository tersebut (bisa lewat GitHub Desktop, atau minta bantuan yang paham `git push`).

2. **Buat database gratis di Neon**
   - Daftar/masuk ke [neon.tech](https://neon.tech), buat project baru.
   - Setelah project dibuat, cari **Connection String** (bentuknya seperti `postgresql://...`). Salin teks ini.

3. **Deploy ke Vercel**
   - Masuk ke [vercel.com](https://vercel.com), klik **Add New → Project**.
   - Pilih repository GitHub yang tadi diunggah.
   - Sebelum klik Deploy, buka bagian **Environment Variables**, lalu tambahkan dua variabel:
     - `DATABASE_URL` → tempel connection string dari Neon tadi
     - `SESSION_SECRET` → isi dengan teks acak yang panjang (minimal 32 karakter, bebas, contoh: `rahasia-warung-kita-2026-jangan-disebar-xyz123`)
   - Klik **Deploy**, tunggu beberapa menit sampai selesai.

4. **Siapkan isi database (sekali saja)**
   - Setelah deploy berhasil, jalankan perintah ini dari komputer (lewat terminal, di dalam folder proyek), dengan `DATABASE_URL` yang sama seperti di Vercel:
     ```bash
     npm install
     npx prisma migrate deploy
     npm run prisma:seed
     ```
   - Perintah `prisma:seed` akan membuat 1 akun Pemilik contoh dan beberapa produk contoh, supaya langsung bisa dicoba. **Lihat bagian "Login Pertama Kali" di bawah untuk PIN default.**

5. **Selesai!** Vercel akan memberi alamat website, misalnya `https://warung-kita.vercel.app`. Alamat inilah yang dibuka dari HP pemilik & pegawai.

> Kalau butuh bantuan teknis saat deploy, tunjukkan file ini ke siapa pun yang membantu — semua langkah di atas standar dan terdokumentasi resmi di situs Vercel & Neon.

---

## 2. Login Pertama Kali

Setelah `npm run prisma:seed` dijalankan, ada 3 akun contoh:

| Nama | Peran | PIN |
|---|---|---|
| Bu Siti (Pemilik) | Pemilik | `123456` |
| Kasir Warung | Pegawai | `111111` |
| Dedi | Pegawai | `222222` |

**PENTING — lakukan segera setelah login pertama kali sebagai Pemilik:**
1. Buka menu **Akun → Kelola Pengguna & Pegawai**.
2. Edit nama "Bu Siti (Pemilik)" jadi nama pemilik asli, dan ganti PIN-nya ke PIN rahasia sendiri.
3. Ganti nama & PIN pegawai contoh sesuai pegawai asli, atau hapus (nonaktifkan) kalau tidak dipakai, lalu tambah pegawai sungguhan lewat tombol "+".
4. Hapus produk-produk contoh dan ganti dengan daftar barang warung yang sebenarnya lewat menu **Produk**.

---

## 3. Cara Pakai Sehari-hari

### Menambahkan ke Layar Utama HP (supaya seperti aplikasi asli)
- **Android (Chrome):** buka alamat website → titik tiga di pojok kanan atas → "Tambahkan ke Layar Utama" / "Install aplikasi".
- **iPhone (Safari):** buka alamat website → tombol Bagikan (kotak dengan panah ke atas) → "Tambah ke Layar Utama".

Setelah itu akan muncul ikon hijau "Warung Kita" di layar HP seperti aplikasi biasa.

### Menjual barang (menu Kasir)
1. Pilih jenis pembeli dulu: **Umum / Grosir / Donasi**.
2. Cari produk dengan mengetik nama, atau tekan tombol hijau kotak untuk **scan barcode** pakai kamera, atau langsung **tap gambar produk** di daftar.
3. Produk masuk ke keranjang, total otomatis terhitung di bawah.
4. Tekan **Bayar**, masukkan uang yang diterima (atau tekan "Uang Pas"), kembalian otomatis muncul.
5. Tekan **Selesai & Simpan** — transaksi tersimpan, bisa dibagikan ke WhatsApp pembeli kalau mau.

### Mengelola produk & stok (menu Produk)
- Pegawai bisa membuka produk untuk **melihat stok** dan **menambah stok** saat barang baru datang (tanpa bisa ubah harga).
- Pemilik bisa menambah produk baru, mengubah harga (3 tingkat + harga modal), mengubah stok, dan menonaktifkan produk yang sudah tidak dijual.

### Melihat riwayat transaksi (menu Riwayat)
Semua transaksi tercatat otomatis seperti struk digital, bisa difilter per hari/7 hari/30 hari.

### Melihat laporan & rekomendasi restock (menu Laporan — khusus Pemilik)
- Omzet, keuntungan, jumlah transaksi, dan nilai subsidi yang sudah diberikan lewat harga Donasi.
- Penjualan per jenis pembeli (Umum/Grosir/Donasi).
- **Produk Terlaris** — barang yang paling cepat habis.
- **Prioritas Restock** — daftar barang yang stoknya akan habis dalam beberapa hari (berdasarkan kecepatan jual), dan daftar barang yang **stuck** (modal mengendap karena tidak laku-laku), supaya belanja stok baru lebih strategis.

---

## 4. Catatan Tentang Scan Barcode

- Untuk barang kemasan pabrik (ada barcode di bungkusnya), tekan tombol scan, arahkan kamera HP ke barcode — otomatis masuk keranjang.
- Untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dsb), cukup **tap gambar produknya** di daftar — tidak perlu scan.
- Fitur scan kamera butuh koneksi HTTPS (alamat Vercel sudah otomatis HTTPS, jadi aman dipakai) dan izin kamera — browser akan tanya izin sekali di awal, pilih "Izinkan".
- Kalau nanti warung mau pakai alat scanner barcode fisik (USB/Bluetooth, harga murah di marketplace), tinggal tap kotak pencarian lalu scan — alat tersebut otomatis mengisi kotak pencarian seperti mengetik, dan barang langsung masuk keranjang.

---

## 5. Keamanan

- Jangan bagikan `SESSION_SECRET` ke siapa pun — ini kunci rahasia supaya sesi login tidak bisa dipalsukan.
- Segera ganti semua PIN default setelah instalasi pertama.
- PIN pegawai sebaiknya beda-beda per orang, supaya kalau ada barang hilang/selisih kas, pemilik tahu siapa kasir yang bertugas saat itu (tercatat otomatis di setiap transaksi).

---

## 6. Untuk yang Teknis (Developer)

Dijalankan secara lokal untuk pengembangan:

```bash
npm install
cp .env.example .env   # isi DATABASE_URL (PostgreSQL) & SESSION_SECRET
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL. Scan barcode pakai `html5-qrcode`. Sesi login pakai JWT di cookie httpOnly (`jose`), PIN di-hash pakai `bcryptjs`.

Struktur penting:
- `prisma/schema.prisma` — model database (User, Product, Transaction, TransactionItem, StockMovement)
- `src/lib/restock.ts` — logika perhitungan prioritas restock & produk stuck
- `src/lib/pricing.ts` — logika pemilihan harga sesuai tingkat pembeli
- `src/app/api/**` — semua endpoint API, dengan pengecekan peran (OWNER/EMPLOYEE) di tiap endpoint sensitif
- `src/components/kasir/KasirClient.tsx` — layar kasir (inti aplikasi)
