# Toko Arief — Aplikasi Kasir & Stok

Aplikasi kasir sederhana yang bisa dibuka lewat browser HP (seperti buka Instagram/WhatsApp), tanpa perlu install dari Play Store. Begitu dibuka, langsung tampil **Cek Harga** — siapa saja (pembeli maupun kasir) bisa langsung pakai tanpa harus login.

## Fitur Utama

- **Cek Harga jadi halaman pembuka, kamera langsung nyala** — buka link-nya, kamera otomatis aktif siap scan (tidak perlu tap apa-apa dulu), atau cari nama produk lewat kotak pencarian. Harga muncul besar di layar. Cocok buat pembeli yang cuma mau tahu harga, atau titik cek harga mandiri.
- **Tingkat harga otomatis**: Satuan (pembeli biasa), Warung/B2B (antar warung). Tinggal pilih jenis pembeli di Kasir, semua harga di keranjang otomatis menyesuaikan. Tiap produk juga bisa diisi **Harga Dus/Karton** sebagai referensi (tidak dijual langsung lewat Kasir, cuma tampil di Cek Harga & Produk) — misalnya Kapal Api per renteng 18rb, ke warung 17rb, per dus 200rb.
- **Scan barcode pakai kamera HP** untuk produk kemasan pabrik (mie instan, sabun, minuman, dll), ditambah **grid tombol gambar** untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dll). Mendukung juga alat scanner barcode USB/Bluetooth kalau nanti mau pakai.
- **Keranjang & total otomatis** — tidak perlu hitung manual pakai kalkulator. Tinggal tap produk, total langsung muncul.
- **Pembayaran & kembalian otomatis dihitung**, hasilnya tersimpan sebagai "struk digital" di sistem (tidak perlu printer), dan bisa dibagikan ke pembeli lewat WhatsApp kalau mau.
- **Rekap stok otomatis**: produk apa yang paling laku, mana yang "stuck" (modal mengendap, tidak laku), dan daftar prioritas belanja/restock supaya tidak kehabisan barang penting.
- **Semua data bisa diunduh sendiri** langsung dari aplikasi (menu Laporan → Unduh Data) dalam format CSV (bisa dibuka di Excel/Google Sheets) — baik riwayat transaksi maupun daftar produk & stok.
- **Impor ribuan produk sekaligus** dari file CSV/Excel (menu Produk → Impor dari CSV/Excel) — tidak perlu input satu-satu lewat HP. Lihat bagian **Impor Produk Massal** di bawah.
- Bisa **"ditambahkan ke Layar Utama HP"** supaya tampil seperti aplikasi asli dengan ikon sendiri (PWA).

### Struktur menu

Di bagian bawah layar cuma ada **3 ikon**, terbuka untuk siapa saja yang membuka link-nya:

| Ikon | Fungsi |
|---|---|
| **Cek Harga** | Scan/cari produk, lihat harga — tanpa masuk keranjang. Ini halaman pembuka. |
| **Produk** | Lihat & kelola daftar barang, harga, dan stok. |
| **Kasir** | Proses transaksi jual-beli — ada di sini juga dua tautan ke **Riwayat** dan **Laporan**, tapi keduanya **dikunci PIN khusus pemilik**. |

**Riwayat** (daftar transaksi) dan **Laporan** (omzet, keuntungan, rekap stok) sengaja tidak ditaruh di menu bawah karena isinya data keuangan toko — begitu disentuh dari Kasir, akan diminta **PIN Pemilik** dulu. Setelah PIN benar sekali, HP itu tidak akan ditanya lagi sampai ditekan tombol **Kunci** di halaman Laporan.

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
   - Sebelum klik Deploy, buka bagian **Environment Variables**, lalu tambahkan tiga variabel:
     - `DATABASE_URL` → tempel connection string dari Neon tadi
     - `OWNER_PIN` → angka 4-6 digit bebas, ini PIN rahasia untuk membuka Riwayat & Laporan (misalnya `193847`, **jangan dibuat mudah ditebak seperti 123456**)
     - `OWNER_SECRET` → teks acak yang panjang (bebas, contoh: `toko-arief-rahasia-2026-jangan-disebar-xyz123`), dipakai server untuk mengamankan sesi "mode pemilik" — ini BUKAN PIN, cukup diisi sekali dan tidak perlu diingat
   - Klik **Deploy**, tunggu beberapa menit sampai selesai.

4. **Siapkan isi database (sekali saja)**
   - Setelah deploy berhasil, jalankan perintah ini dari komputer (lewat terminal, di dalam folder proyek), dengan `DATABASE_URL` yang sama seperti di Vercel:
     ```bash
     npm install
     npx prisma migrate deploy
     npm run prisma:seed
     ```
   - Perintah `prisma:seed` akan memasukkan beberapa produk contoh, supaya langsung bisa dicoba. Produk contoh ini bisa dihapus/diganti lewat menu **Produk** di aplikasi.

5. **Selesai!** Vercel akan memberi alamat website, misalnya `https://toko-arief.vercel.app`. Alamat inilah yang dibuka dari HP — langsung tampil Cek Harga.

> Kalau butuh bantuan teknis saat deploy, tunjukkan file ini ke siapa pun yang membantu — semua langkah di atas standar dan terdokumentasi resmi di situs Vercel & Neon.

---

## 2. Cara Pakai Sehari-hari

### Menambahkan ke Layar Utama HP (supaya seperti aplikasi asli)
- **Android (Chrome):** buka alamat website → titik tiga di pojok kanan atas → "Tambahkan ke Layar Utama" / "Install aplikasi".
- **iPhone (Safari):** buka alamat website → tombol Bagikan (kotak dengan panah ke atas) → "Tambah ke Layar Utama".

Setelah itu akan muncul ikon "Toko Arief" di layar HP seperti aplikasi biasa — buka langsung tampil Cek Harga.

### Cek harga tanpa transaksi (menu Cek Harga — halaman pembuka)
Buat yang cuma mau tahu harga suatu barang (misalnya pembeli nanya duluan sebelum beli, atau titik cek harga mandiri): begitu halaman ini dibuka, kamera sudah langsung siap scan — tinggal arahkan ke barcode, tidak perlu tap apa pun dulu. Bisa juga ketik nama produknya di kotak pencarian kalau barcode-nya tidak mau kebaca. Harga langsung tampil besar (Satuan, Warung, dan Dus/Karton kalau diisi) tanpa masuk keranjang belanja. Kalau ternyata jadi dibeli, tinggal tekan **Tambah ke Kasir** dan barangnya otomatis pindah ke keranjang kasir.

### Menjual barang (menu Kasir)
1. Pilih jenis pembeli dulu: **Satuan / Warung**.
2. Cari produk dengan mengetik nama, atau tekan tombol hijau kotak untuk **scan barcode** pakai kamera, atau langsung **tap gambar produk** di daftar.
3. Produk masuk ke keranjang, total otomatis terhitung di bawah.
4. Tekan **Bayar**, masukkan uang yang diterima (atau tekan "Uang Pas"), kembalian otomatis muncul.
5. Tekan **Selesai & Simpan** — transaksi tersimpan, bisa dibagikan ke WhatsApp pembeli kalau mau.

### Melihat Riwayat & Laporan (khusus Pemilik, dari dalam Kasir)
Di bagian atas halaman Kasir ada dua tombol kecil: **Riwayat** dan **Laporan**. Begitu ditekan:
1. Kalau belum pernah buka sebelumnya di HP itu, akan diminta **PIN Pemilik** (yang diisi di `OWNER_PIN` saat deploy).
2. Setelah PIN benar, langsung masuk, dan HP itu tidak akan ditanya PIN lagi untuk kunjungan berikutnya.
3. Di halaman **Laporan**, ada tombol **Kunci** untuk mengunci lagi mode pemilik di HP tersebut (penting dipakai kalau HP kasir dipakai bergantian/dipegang orang lain).

Isi **Riwayat**: semua transaksi tercatat otomatis seperti struk digital, bisa difilter per hari/7 hari/30 hari, lengkap dengan keuntungan per transaksi.

Isi **Laporan**:
- Omzet, keuntungan, dan jumlah transaksi.
- Penjualan per jenis pembeli (Satuan/Warung).
- **Produk Terlaris** — barang yang paling cepat habis.
- **Prioritas Restock** — daftar barang yang stoknya akan habis dalam beberapa hari (berdasarkan kecepatan jual), dan daftar barang yang **stuck** (modal mengendap karena tidak laku-laku).
- **Unduh Data** — unduh seluruh riwayat transaksi dan daftar produk sebagai file CSV, langsung dari HP, kapan saja.

### Mengelola produk & stok (menu Produk)
Tambah produk baru, ubah harga (Satuan/Warung/Dus + harga modal), tambah stok cepat saat barang baru datang, atau nonaktifkan produk yang sudah tidak dijual. Ada tombol kategori di bawah kotak pencarian supaya bisa langsung lompat ke kategori tertentu tanpa scroll. **Menu ini terbuka untuk siapa saja yang membuka link aplikasi** — lihat catatan di bagian Keamanan.

### Impor Produk Massal (buat yang punya ribuan barang)

Daripada input satu-satu lewat HP, siapkan daftar barang di Excel/Google Sheets lalu unggah sekali lewat menu **Produk → Impor dari CSV/Excel**.

Caranya:
1. Di menu Produk, tekan **Unduh format** — ini mengunduh file CSV dengan kolom yang benar (kalau produk masih kosong, filenya berisi header saja, tetap bisa dipakai sebagai contoh format).
2. Buka file itu di Excel/Google Sheets, isi daftar barang. Yang **wajib** diisi cuma dua kolom: **Nama Produk** dan **Harga Satuan**. Kolom lain (Barcode, Kategori, Satuan, Stok, Harga Modal, Harga Warung (B2B), Harga Dus) boleh dikosongkan — nanti otomatis diisi nilai wajar (misalnya Harga Warung ikut sama dengan Harga Satuan kalau tidak diisi, Harga Dus dibiarkan kosong, stok dianggap 0), tinggal diperbaiki belakangan lewat aplikasi kalau perlu beda harga per tingkat.
3. Simpan sebagai file **.csv** (di Excel: *Save As → CSV*; di Google Sheets: *File → Download → Comma-separated values*).
4. Di aplikasi, tekan **Impor dari CSV/Excel**, pilih file tadi. Ribuan baris selesai diproses dalam hitungan detik.
5. Muncul ringkasan: berapa produk baru, berapa yang diperbarui, dan baris mana saja yang gagal (misalnya karena harga kosong/salah ketik) — tinggal diperbaiki di spreadsheet dan diunggah ulang, baris yang sudah benar tidak akan dobel.

Aturan pencocokan: kalau **Barcode** di baris itu cocok dengan produk yang sudah ada → produk itu **diperbarui**. Kalau tidak ada barcode tapi **Nama Produk**-nya persis sama dengan yang sudah ada → juga **diperbarui**. Selain itu → jadi **produk baru**. Jadi file yang sama bisa diunggah berkali-kali (misalnya untuk update harga massal) tanpa takut data dobel.

---

## 3. Catatan Tentang Scan Barcode

- Di **Cek Harga**, kamera langsung menyala begitu halaman dibuka — tidak perlu tekan tombol apa pun, tinggal arahkan ke barcode produk. Di **Kasir**, tekan dulu tombol kotak hijau untuk membuka kamera (supaya tidak mengganggu saat sedang memilih barang lewat grid).
- Untuk barang curah/eceran tanpa barcode (beras, gula, cabai, bawang, dsb), cukup **tap gambar produknya** di daftar — tidak perlu scan.
- Fitur scan kamera butuh koneksi HTTPS (alamat Vercel sudah otomatis HTTPS, jadi aman dipakai) dan izin kamera — browser akan tanya izin sekali di awal, pilih "Izinkan".
- **Barcode kecil (rokok, dll) susah kebaca?** Di layar kamera ada dua bantuan (muncul otomatis kalau HP-nya mendukung):
  - **Geser zoom** (ikon kaca pembesar) untuk memperbesar tampilan sampai barcode kecil terlihat jelas, tanpa perlu mendekatkan HP sampai gambar blur.
  - **Tombol senter** (ikon lampu) untuk pencahayaan tambahan kalau tempatnya agak gelap atau kemasannya mengilap.
  - Kalau kedua tombol ini tidak muncul, berarti HP tersebut memang tidak mendukung fitur zoom/senter lewat browser — tinggal pakai jarak & sudut yang pas, atau ketik manual di kotak pencarian.
- Kalau nanti mau pakai alat scanner barcode fisik (USB/Bluetooth, harga murah di marketplace — biasanya lebih jago baca barcode kecil dibanding kamera HP), tinggal tap kotak pencarian lalu scan — alat tersebut otomatis mengisi kotak pencarian seperti mengetik, dan barang langsung masuk keranjang.

---

## 4. Keamanan — Penting Dibaca

- **Riwayat & Laporan** (data keuangan: omzet, keuntungan, histori transaksi) dikunci **PIN Pemilik** (`OWNER_PIN`). Jangan sebar PIN ini ke sembarang orang — anggap seperti kunci brankas.
- **Cek Harga, Produk, dan Kasir sengaja terbuka untuk siapa saja** yang membuka link aplikasi, tanpa PIN — sesuai permintaan supaya cepat dipakai tanpa hambatan.
- Konsekuensinya: menu **Produk** (termasuk tombol tambah/edit/hapus produk, harga, dan **harga modal**) bisa diakses dan diubah siapa pun yang punya link-nya, bukan cuma pemilik. Begitu juga transaksi di Kasir bisa dibuat siapa saja. **Kalau ini terasa terlalu terbuka**, opsi yang gampang ditambahkan nanti: kunci juga tombol tambah/edit produk (dan sembunyikan Harga Modal) di balik PIN Pemilik yang sama, sementara orang tetap bisa lihat-lihat stok & harga jual seperti katalog biasa — tinggal bilang saja kalau mau ditambahkan.
- **Jangan sebar alamat website-nya** ke orang yang tidak perlu — anggap seperti kunci toko. Simpan alamatnya di HP yang dipakai sendiri (bookmark / ikon di layar utama).
- `OWNER_SECRET` jangan dibagikan ke siapa pun — ini kunci rahasia supaya sesi "mode pemilik" tidak bisa dipalsukan.

---

## 5. Menghubungkan ke Email (Rencana ke Depan)

Karena aplikasi ini kode sendiri (bukan fitur bawaan Claude), nantinya **bisa** dihubungkan ke layanan email terpisah untuk, misalnya, mengirim laporan harian otomatis — sepenuhnya independen, tidak butuh Claude sama sekali. Caranya nanti: pakai layanan seperti [Resend](https://resend.com) atau Gmail SMTP, dengan API key milik sendiri, lalu ditambahkan sebagai fitur baru di aplikasi ini (mirip seperti fitur Unduh Data, tinggal tambah satu endpoint baru yang mengirim email berisi lampiran CSV). Fitur ini belum dibuat — baru disiapkan supaya gampang ditambah kapan saja dibutuhkan.

---

## 6. Untuk yang Teknis (Developer)

Dijalankan secara lokal untuk pengembangan:

```bash
npm install
cp .env.example .env   # isi DATABASE_URL, OWNER_PIN, OWNER_SECRET
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL. Scan barcode pakai `html5-qrcode`. Sesi "mode pemilik" pakai JWT di cookie httpOnly (`jose`), ditandatangani dengan `OWNER_SECRET` dan hanya terbit kalau `OWNER_PIN` cocok — satu PIN bersama untuk pemilik, bukan sistem akun per-pengguna.

Struktur penting:
- `prisma/schema.prisma` — model database (Product, Transaction, TransactionItem, StockMovement)
- `src/lib/restock.ts` — logika perhitungan prioritas restock & produk stuck
- `src/lib/pricing.ts` — logika pemilihan harga sesuai tingkat pembeli
- `src/lib/csv.ts` — util pembuatan & pembacaan CSV untuk fitur unduh/impor data
- `src/lib/owner.ts` — gate PIN pemilik (cookie, verifikasi, `withOwnerGuard` untuk route API)
- `src/lib/useBarcodeScanner.ts` — hook kamera html5-qrcode bersama (dipakai Cek Harga & Kasir), termasuk zoom/senter via `RangeCameraCapability`/`BooleanCameraCapability`
- `src/proxy.ts` — middleware yang mengarahkan `/riwayat` & `/laporan` ke `/owner-login` kalau belum terbuka
- `src/app/api/**` — semua endpoint API; yang terkait Riwayat/Laporan/Export-transaksi dibungkus `withOwnerGuard`, sisanya terbuka
- `src/components/kasir/KasirClient.tsx` — layar kasir (inti aplikasi)
- `src/components/cekharga/CekHargaClient.tsx` — layar Cek Harga (halaman pembuka)
