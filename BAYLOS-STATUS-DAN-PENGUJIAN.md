# Baylos Premium — Build pengembangan awal

## Sudah dibuat dalam kode
- `toko.html`: katalog publik dari tabel products Supabase, pencarian, detail produk, keranjang lokal dengan jumlah dan pembatasan stok berdasarkan data terakhir.
- `index.html`: login, pendaftaran pelanggan/reseller, dashboard dan admin dari proyek asal dipertahankan.

## Belum siap produksi / belum diuji langsung
- Checkout pengunjung, pembuatan order, pembayaran gateway, ongkir otomatis, pelacakan resi, chat internal dan keseluruhan fitur admin.
- Fungsi `create-order` masih menolak transaksi secara sengaja; JANGAN menonaktifkan pengaman sebelum audit skema dan transaksi atomik.
- Harga/stock di keranjang hanya perkiraan UI, tidak boleh digunakan sebagai total final server.
- Katalog publik perlu kebijakan SELECT aman di tabel products. Jangan membuka INSERT/UPDATE publik.

## Pemasangan dan uji
1. Cadangkan branch supabase-integration dan jangan ubah main.
2. Upload semua file ZIP ini ke root branch pengujian.
3. Buka `toko.html`, cek data produk asli, cari produk, detail, tambah/kurangi keranjang, refresh halaman.
4. Uji login pelanggan di `index.html`, pengajuan reseller, admin dengan akun uji asli.
5. Jangan menerima pembayaran atau order pengunjung sampai backend transaksi selesai dan diuji.
