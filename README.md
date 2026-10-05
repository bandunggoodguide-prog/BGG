# Toko Arief — Aplikasi Kasir & Stok

Aplikasi kasir sederhana yang bisa dibuka lewat browser HP (seperti buka Instagram/WhatsApp), tanpa perlu install dari Play Store dan **tanpa login/PIN** — buka langsung bisa dipakai.

## Fitur Utama

- **3 tingkat harga otomatis**: Umum (pembeli biasa), Grosir/B2B (antar warung), Donasi (harga spesial sosial). Tinggal pilih jenis pembeli, semua harga di keranjang otomatis menyesuaikan.
- **Scan barcode pakai kamera HP** untuk produk kemasan pabrik (mie instan, sabun, minuman, dll), ditambah **grid tombol gambar** untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dll). Mendukung juga alat scanner barcode USB/Bluetooth kalau nanti mau pakai.
- **Keranjang & total otomatis** — tidak perlu hitung manual pakai kalkulator. Tinggal tap produk, total langsung muncul.
- **Pembayaran & kembalian otomatis dihitung**, hasilnya tersimpan sebagai "struk digital" di sistem (tidak perlu printer), dan bisa dibagikan ke pembeli lewat WhatsApp kalau mau.
- **Rekap stok otomatis**: produk apa yang paling laku, mana yang "stuck" (modal mengendap, tidak laku), dan daftar prioritas belanja/restock supaya tidak kehabisan barang penting.
- **Semua data bisa diunduh sendiri** langsung dari aplikasi (menu Laporan → Unduh Data) dalam format CSV (bisa dibuka di Excel/Google Sheets) — baik riwayat transaksi maupun daftar produk & stok.
- **Impor ribuan produk sekaligus** dari file CSV/Excel (menu Produk → Impor dari CSV/Excel) — tidak perlu input satu-satu lewat HP. Lihat bagian **Impor Produk Massal** di bawah.
- Bisa **"ditambahkan ke Layar Utama HP"** supaya tampil seperti aplikasi asli dengan ikon sendiri (PWA).

> Tidak ada sistem login/peran (pemilik vs pegawai) — aplikasi ini dibuat untuk dipakai sendiri. Lihat bagian **Keamanan** di bawah untuk hal penting yang perlu diketahui soal ini.

---

## 1. Cara Mengaktifkan Aplikasi Ini (Online, Gratis)

Aplikasi ini perlu di-"deploy" (dipasang ke internet) satu kali saja. Setelah itu, tinggal buka alamat websitenya dari browser HP — tidak perlu install ulang apa pun.

Butuh waktu sekitar 15-20 menit, dan **gratis** (untuk skala 1 toko, jauh di bawah batas gratis layanan yang dipakai).

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
   - Sebelum klik Deploy, buka bagian **Environment Variables**, lalu tambahkan satu variabel:
     - `DATABASE_URL` → tempel connection string dari Neon tadi
   - Klik **Deploy**, tunggu beberapa menit sampai selesai.

4. **Siapkan isi database (sekali saja)**
   - Setelah deploy berhasil, jalankan perintah ini dari komputer (lewat terminal, di dalam folder proyek), dengan `DATABASE_URL` yang sama seperti di Vercel:
     ```bash
     npm install
     npx prisma migrate deploy
     npm run prisma:seed
     ```
   - Perintah `prisma:seed` akan memasukkan beberapa produk contoh, supaya langsung bisa dicoba. Produk contoh ini bisa dihapus/diganti lewat menu **Produk** di aplikasi.

5. **Selesai!** Vercel akan memberi alamat website, misalnya `https://toko-arief.vercel.app`. Alamat inilah yang dibuka dari HP.

> Kalau butuh bantuan teknis saat deploy, tunjukkan file ini ke siapa pun yang membantu — semua langkah di atas standar dan terdokumentasi resmi di situs Vercel & Neon.

---

## 2. Cara Pakai Sehari-hari

### Menambahkan ke Layar Utama HP (supaya seperti aplikasi asli)
- **Android (Chrome):** buka alamat website → titik tiga di pojok kanan atas → "Tambahkan ke Layar Utama" / "Install aplikasi".
- **iPhone (Safari):** buka alamat website → tombol Bagikan (kotak dengan panah ke atas) → "Tambah ke Layar Utama".

Setelah itu akan muncul ikon hijau "Toko Arief" di layar HP seperti aplikasi biasa — buka langsung masuk ke kasir, tidak ada layar login.

### Menjual barang (menu Kasir)
1. Pilih jenis pembeli dulu: **Umum / Grosir / Donasi**.
2. Cari produk dengan mengetik nama, atau tekan tombol hijau kotak untuk **scan barcode** pakai kamera, atau langsung **tap gambar produk** di daftar.
3. Produk masuk ke keranjang, total otomatis terhitung di bawah.
4. Tekan **Bayar**, masukkan uang yang diterima (atau tekan "Uang Pas"), kembalian otomatis muncul.
5. Tekan **Selesai & Simpan** — transaksi tersimpan, bisa dibagikan ke WhatsApp pembeli kalau mau.

### Cek harga tanpa transaksi (menu Cek Harga)
Buat yang cuma mau tahu harga suatu barang (misalnya pembeli nanya duluan sebelum beli, atau titik cek harga mandiri): buka menu **Cek Harga**, scan barcode-nya atau ketik nama produknya, harga langsung tampil besar (3 tingkat sekaligus) tanpa masuk keranjang belanja. Kalau ternyata jadi dibeli, tinggal tekan **Tambah ke Kasir** dan barangnya otomatis pindah ke keranjang kasir.

### Mengelola produk & stok (menu Produk)
Tambah produk baru, ubah harga (3 tingkat + harga modal), tambah stok cepat saat barang baru datang, atau nonaktifkan produk yang sudah tidak dijual.

### Melihat riwayat transaksi (menu Riwayat)
Semua transaksi tercatat otomatis seperti struk digital, bisa difilter per hari/7 hari/30 hari, lengkap dengan keuntungan per transaksi.

### Melihat laporan & rekomendasi restock (menu Laporan)
- Omzet, keuntungan, jumlah transaksi, dan nilai subsidi yang sudah diberikan lewat harga Donasi.
- Penjualan per jenis pembeli (Umum/Grosir/Donasi).
- **Produk Terlaris** — barang yang paling cepat habis.
- **Prioritas Restock** — daftar barang yang stoknya akan habis dalam beberapa hari (berdasarkan kecepatan jual), dan daftar barang yang **stuck** (modal mengendap karena tidak laku-laku).
- **Unduh Data** — unduh seluruh riwayat transaksi dan daftar produk sebagai file CSV, langsung dari HP, kapan saja.

### Impor Produk Massal (buat yang punya ribuan barang)

Daripada input satu-satu lewat HP, siapkan daftar barang di Excel/Google Sheets lalu unggah sekali lewat menu **Produk → Impor dari CSV/Excel**.

Caranya:
1. Di menu Produk, tekan **Unduh format** — ini mengunduh file CSV dengan kolom yang benar (kalau produk masih kosong, filenya berisi header saja, tetap bisa dipakai sebagai contoh format).
2. Buka file itu di Excel/Google Sheets, isi daftar barang. Yang **wajib** diisi cuma dua kolom: **Nama Produk** dan **Harga Umum**. Kolom lain (Barcode, Kategori, Satuan, Stok, Harga Modal, Harga Grosir, Harga Donasi) boleh dikosongkan — nanti otomatis diisi nilai wajar (misalnya Harga Grosir & Harga Donasi ikut sama dengan Harga Umum kalau tidak diisi, stok dianggap 0), tinggal diperbaiki belakangan lewat aplikasi kalau perlu beda harga per tingkat.
3. Simpan sebagai file **.csv** (di Excel: *Save As → CSV*; di Google Sheets: *File → Download → Comma-separated values*).
4. Di aplikasi, tekan **Impor dari CSV/Excel**, pilih file tadi. Ribuan baris selesai diproses dalam hitungan detik.
5. Muncul ringkasan: berapa produk baru, berapa yang diperbarui, dan baris mana saja yang gagal (misalnya karena harga kosong/salah ketik) — tinggal diperbaiki di spreadsheet dan diunggah ulang, baris yang sudah benar tidak akan dobel.

Aturan pencocokan: kalau **Barcode** di baris itu cocok dengan produk yang sudah ada → produk itu **diperbarui**. Kalau tidak ada barcode tapi **Nama Produk**-nya persis sama dengan yang sudah ada → juga **diperbarui**. Selain itu → jadi **produk baru**. Jadi file yang sama bisa diunggah berkali-kali (misalnya untuk update harga massal) tanpa takut data dobel.

---

## 3. Catatan Tentang Scan Barcode

- Untuk barang kemasan pabrik (ada barcode di bungkusnya), tekan tombol scan, arahkan kamera HP ke barcode — otomatis masuk keranjang.
- Untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dsb), cukup **tap gambar produknya** di daftar — tidak perlu scan.
- Fitur scan kamera butuh koneksi HTTPS (alamat Vercel sudah otomatis HTTPS, jadi aman dipakai) dan izin kamera — browser akan tanya izin sekali di awal, pilih "Izinkan".
- Kalau nanti mau pakai alat scanner barcode fisik (USB/Bluetooth, harga murah di marketplace), tinggal tap kotak pencarian lalu scan — alat tersebut otomatis mengisi kotak pencarian seperti mengetik, dan barang langsung masuk keranjang.

---

## 4. Keamanan — Penting Dibaca

Aplikasi ini **sengaja tanpa login/PIN** supaya cepat dipakai. Konsekuensinya: **siapa pun yang tahu alamat websitenya bisa membuka, melihat, dan mengubah semua data** (termasuk harga, stok, dan riwayat transaksi) — karena ini aplikasi online yang bisa diakses dari internet.

Supaya aman:
- **Jangan sebar alamat website-nya** ke orang lain selain yang memang perlu akses (anggap seperti kunci toko).
- Simpan alamatnya hanya di HP yang dipakai sendiri (bookmark / ikon di layar utama).
- Kalau alamatnya pernah ter-share atau khawatir bocor, bisa redeploy ke alamat Vercel yang baru kapan saja.

Kalau suatu saat butuh tambahan proteksi tanpa login per-pengguna, opsi paling simpel adalah mengaktifkan **Vercel Deployment Protection** (fitur bawaan Vercel, perlu paket berbayar) atau menambahkan satu kata sandi tunggal untuk seluruh aplikasi — tinggal bilang saja kalau nanti mau ditambahkan.

---

## 5. Menghubungkan ke Email (Rencana ke Depan)

Karena aplikasi ini kode sendiri (bukan fitur bawaan Claude), nantinya **bisa** dihubungkan ke layanan email terpisah untuk, misalnya, mengirim laporan harian otomatis — sepenuhnya independen, tidak butuh Claude sama sekali. Caranya nanti: pakai layanan seperti [Resend](https://resend.com) atau Gmail SMTP, dengan API key milik sendiri, lalu ditambahkan sebagai fitur baru di aplikasi ini (mirip seperti fitur Unduh Data, tinggal tambah satu endpoint baru yang mengirim email berisi lampiran CSV). Fitur ini belum dibuat — baru disiapkan supaya gampang ditambah kapan saja dibutuhkan.

---

## 6. Untuk yang Teknis (Developer)

Dijalankan secara lokal untuk pengembangan:

```bash
npm install
cp .env.example .env   # isi DATABASE_URL (PostgreSQL)
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL. Scan barcode pakai `html5-qrcode`. Tidak ada autentikasi — semua endpoint API terbuka (lihat bagian Keamanan di atas).

Struktur penting:
- `prisma/schema.prisma` — model database (Product, Transaction, TransactionItem, StockMovement)
- `src/lib/restock.ts` — logika perhitungan prioritas restock & produk stuck
- `src/lib/pricing.ts` — logika pemilihan harga sesuai tingkat pembeli
- `src/lib/csv.ts` — util pembuatan file CSV untuk fitur unduh data
- `src/app/api/**` — semua endpoint API (tanpa autentikasi)
- `src/components/kasir/KasirClient.tsx` — layar kasir (inti aplikasi)
