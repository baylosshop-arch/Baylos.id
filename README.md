# BAYLOS — Reseller & Wholesale Platform

Paket pembaruan UI Baylos dengan tema obsidian/gold, katalog, pemilihan varian, keranjang, dan **checkout langsung di website tanpa mengalihkan pelanggan ke WhatsApp**.

## Jalankan sekarang (mode demo lokal)
1. Ekstrak ZIP.
2. Buka `index.html` di Chrome/Edge, atau deploy folder sebagai static website.
3. Login demo admin: `admin@baylos.id` / `admin123`.
4. Login demo reseller: `reseller@baylos.id` / `baylos123`.
5. Pilih produk → pilih varian/jumlah → Tambahkan ke Keranjang → Lanjut ke Checkout → isi alamat, kurir, dan metode pembayaran → Buat Pesanan.
6. Nomor order akan tampil. Order demo disimpan di `localStorage` browser yang sama pada key `baylosOrders`.

## Status fitur yang harus dibedakan
- **Berfungsi untuk demo lokal:** navigasi katalog yang sudah ada, pemilihan varian, keranjang, formulir checkout langsung di web, pembuatan nomor order lokal, dan penyimpanan pesanan di browser.
- **Belum transaksi online sungguhan:** mode lokal tidak mengirim pesanan ke Supabase, tidak mengunci/mengurangi stok database, tidak memverifikasi pembayaran, dan tidak memberi tarif ongkir live. Data lokal hanya ada di perangkat/browser yang sama.
- **Supabase:** folder `supabase/` berisi audit skema dan scaffold integrasi yang perlu disesuaikan dengan tipe ID, RLS, dan skema proyek `baylos-s` sebelum live. Jangan isi `BAYLOS_BACKEND` di HTML sampai Edge Function `create-order` yang aman telah diterapkan dan diuji.
- **Biteship:** API key harus disimpan sebagai Supabase Function Secret, bukan di HTML/GitHub. Origin gudang, kode area, berat/dimensi, tarif, webhook, dan tracking harus dikonfigurasi dan diuji sebelum menjanjikan ongkir live.
- **Payment gateway:** butuh akun/provider, secret server-side, callback/webhook, dan pengujian sandbox. Tombol pilihan gateway di demo belum menagih uang.
- **Akses admin/login:** login yang ada masih demo browser; jangan publikasikan kredensial demo atau gunakan untuk data pelanggan nyata.

## Langkah integrasi produksi
1. Jalankan query audit di `supabase/schema-current-project.sql`, lalu cocokkan hasilnya dengan migration sebelum menerapkan perubahan.
2. Konfigurasikan Supabase Auth dan role admin/reseller melalui kebijakan server-side; jangan izinkan browser mengubah role sendiri.
3. Implementasikan fungsi server `create-order` dengan validasi harga, stok, status reseller, ongkir dan idempotensi di database. Jangan menerima subtotal/total dari browser sebagai nilai tepercaya.
4. Konfigurasikan Biteship secrets + area asal gudang yang benar, lalu uji tarif, shipment, webhook dan tracking.
5. Integrasikan gateway pembayaran melalui backend dan webhook terverifikasi.
6. Ikuti `RELEASE-CHECKLIST.md`; jangan aktifkan checkout live sebelum seluruh tes lulus.

## Struktur
- `index.html` — UI storefront/checkout.
- `supabase/` — audit SQL, migration shipment dan scaffold Edge Functions.
- `SUPABASE-NEXT-STEPS-ID.md`, `BITESHIP-SETUP-ID.md`, `RELEASE-CHECKLIST.md` — panduan Bahasa Indonesia.
