# Panduan Penggunaan Tazama
## Sistem Deteksi Transaksi Mencurigakan

---

## Gambaran Umum Sistem

Tazama adalah sistem untuk memeriksa transaksi keuangan secara otomatis dan mendeteksi transaksi yang mencurigakan. Sistem ini terdiri dari banyak komponen yang saling terhubung dan bekerja sama untuk memproses setiap transaksi yang masuk.

```mermaid
flowchart TB
    subgraph TAZAMA["Sistem Tazama"]
        TMS["Penerima Transaksi<br/>(TMS)"]
        ED["Pengarah<br/>(Event Director)"]
        RULES["Pemeriksa Aturan<br/>(Rule Processors)"]
        TP["Penghitung Skor<br/>(Typology Processor)"]
        TADP["Pengambil Keputusan<br/>(TADP)"]
        DB[(Database)]
        
        TMS --> ED
        ED --> RULES
        RULES --> TP
        TP --> TADP
        TADP --> DB
    end
    
    BANK["Sistem Bank/<br/>Sumber Transaksi"] --> TMS
    TADP --> HASIL["Hasil:<br/>Aman / Peringatan / Blokir"]
```

---

## Tahap 1: Instalasi Sistem

Pertama, kita perlu mengunduh kode program Tazama dari GitHub dan memasangnya di komputer atau server. Tazama bukan aplikasi tunggal, melainkan kumpulan dari banyak komponen yang saling terhubung. Ada komponen untuk menerima transaksi, komponen untuk memproses aturan, komponen untuk menghitung skor, komponen database, komponen antrian pesan, dan lain-lain. Semua komponen ini dijalankan menggunakan Docker, yaitu aplikasi yang berfungsi sebagai wadah untuk menjalankan banyak program sekaligus secara terisolasi.

Setelah Docker terpasang dan kita menjalankan perintah instalasi, sistem akan mengunduh dan menjalankan sekitar 10-15 komponen yang berbeda. Proses ini memakan waktu sekitar 10-30 menit tergantung kecepatan internet dan spesifikasi komputer. Setelah selesai, semua komponen Tazama sudah berjalan dan siap menerima transaksi untuk diperiksa.

```mermaid
flowchart LR
    subgraph PRASYARAT["Persiapan"]
        A["Siapkan Server/<br/>Komputer"]
        B["Pasang Docker"]
        C["Unduh Kode<br/>dari GitHub"]
    end
    
    subgraph INSTALASI["Proses Instalasi"]
        D["Jalankan<br/>Perintah Instalasi"]
        E["Sistem Mengunduh<br/>Semua Komponen"]
        F["Komponen<br/>Mulai Berjalan"]
    end
    
    subgraph HASIL["Hasil"]
        G["Tazama Siap<br/>Digunakan"]
    end
    
    A --> B --> C --> D --> E --> F --> G
```

---

## Tahap 2: Membuat Aturan Deteksi (Rule)

Tazama sudah menyediakan beberapa aturan bawaan, tapi kalau kita ingin membuat aturan baru sesuai kebutuhan, prosesnya cukup panjang dan melibatkan beberapa langkah.

### Alur Pembuatan Aturan Baru

```mermaid
flowchart TB
    subgraph PENGEMBANGAN["Pengembangan Program"]
        A["Tulis Kode Program<br/>Logika Aturan"]
        B["Build: Kompilasi<br/>Menjadi Paket Aplikasi"]
        C["Kemas Menjadi<br/>Docker Image"]
    end
    
    subgraph DEPLOYMENT["Pemasangan"]
        D["Buat File Konfigurasi<br/>Docker"]
        E["Jalankan<br/>Docker Image"]
    end
    
    subgraph KONFIGURASI["Konfigurasi Database"]
        F["Daftarkan Konfigurasi<br/>Aturan (Rule Config)"]
        G["Buat Konfigurasi<br/>Typology (Bobot & Threshold)"]
        H["Perbarui Network Map<br/>(Daftar Aturan Aktif)"]
    end
    
    subgraph AKTIVASI["Aktivasi"]
        I["Bersihkan Cache"]
        J["Restart Komponen<br/>Terkait"]
        K["Aturan Baru<br/>Siap Digunakan"]
    end
    
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K
```

### Penjelasan Setiap Langkah

**Pertama, kita perlu menulis kode program untuk logika aturannya.** Misalnya kita ingin membuat aturan untuk mendeteksi transaksi nominal besar. Kita harus menulis program yang membaca nilai transaksi, lalu menentukan kategorinya berdasarkan besaran nominal. Program ini ditulis menggunakan bahasa pemrograman TypeScript, dan harus mengikuti format dan struktur yang sudah ditentukan oleh Tazama supaya bisa terhubung dengan komponen lainnya.

**Kedua, setelah kode program selesai ditulis, kita perlu mengubahnya menjadi paket aplikasi yang bisa dijalankan.** Proses ini disebut build, dimana kode yang kita tulis dikompilasi dan dikemas menjadi bentuk yang siap dijalankan oleh komputer.

**Ketiga, paket aplikasi tadi perlu dikemas lagi menjadi Docker image.** Docker image ini seperti "kotak" yang berisi program aturan kita beserta semua yang dibutuhkan untuk menjalankannya. Dengan dikemas dalam Docker image, program aturan kita bisa dijalankan bersama komponen Tazama lainnya.

**Keempat, kita perlu membuat file konfigurasi untuk menjalankan Docker image tadi.** File ini berisi pengaturan seperti nama aturan, koneksi ke database, koneksi ke sistem antrian pesan, dan pengaturan lainnya yang diperlukan supaya program aturan kita bisa berkomunikasi dengan komponen Tazama lainnya.

**Kelima, setelah program aturan berjalan, kita perlu mendaftarkan konfigurasi aturannya ke database.** Di sini kita tentukan kriteria pemeriksaannya, misalnya transaksi di bawah 1 juta masuk kategori pertama, 1-5 juta kategori kedua, dan seterusnya. Konfigurasi ini yang akan dibaca oleh program aturan saat memeriksa transaksi.

**Keenam, kita perlu membuat konfigurasi Typology.** Typology ini menentukan bobot dari setiap kategori hasil pemeriksaan. Misalnya kategori pertama bobotnya 0, kategori kedua bobotnya 100, kategori ketiga bobotnya 300. Typology juga menentukan batas kapan sistem memberi peringatan dan kapan memblokir transaksi.

**Ketujuh, kita perlu memperbarui Network Map.** Network Map ini seperti daftar aturan mana saja yang aktif dan harus dijalankan saat ada transaksi masuk. Kalau aturan baru kita tidak didaftarkan di Network Map, maka aturan tersebut tidak akan dijalankan meskipun programnya sudah berjalan.

**Terakhir, setelah semua konfigurasi dimasukkan, kita perlu membersihkan cache sistem dan me-restart beberapa komponen** supaya konfigurasi baru terbaca oleh sistem.

---

## Tahap 3: Menghubungkan dengan Data Transaksi

Tazama tidak secara otomatis membaca dari database transaksi yang sudah ada. Tazama bekerja dengan cara menerima data transaksi yang dikirimkan kepadanya, memprosesnya, lalu memberikan hasil pemeriksaan.

### Alur Integrasi dengan Sistem yang Sudah Ada

```mermaid
flowchart TB
    subgraph SISTEM_LAMA["Sistem Transaksi yang Sudah Ada"]
        DB_LAMA[(Database<br/>Transaksi)]
    end
    
    subgraph PENGHUBUNG["Program Penghubung (Perlu Dibuat)"]
        BACA["Baca Data<br/>Transaksi"]
        UBAH["Ubah Format<br/>ke ISO 20022"]
        KIRIM["Kirim ke<br/>Tazama"]
        TERIMA["Terima Hasil<br/>Pemeriksaan"]
        SIMPAN["Simpan Hasil"]
    end
    
    subgraph TAZAMA["Sistem Tazama"]
        TMS["Penerima<br/>Transaksi"]
        PROSES["Proses<br/>Pemeriksaan"]
        HASIL["Hasil:<br/>Aman/Peringatan/Blokir"]
    end
    
    DB_LAMA --> BACA
    BACA --> UBAH
    UBAH --> KIRIM
    KIRIM --> TMS
    TMS --> PROSES
    PROSES --> HASIL
    HASIL --> TERIMA
    TERIMA --> SIMPAN
```

### Penjelasan Proses Integrasi

**Untuk menghubungkan sistem transaksi yang sudah ada dengan Tazama, kita perlu membuat program penghubung.** Program ini tugasnya mengambil data transaksi dari sistem kita, mengubah formatnya menjadi format ISO 20022 yang dipahami oleh Tazama, mengirimkannya ke Tazama, lalu menerima dan menyimpan hasilnya.

Format ISO 20022 ini adalah standar internasional untuk pesan keuangan. Tazama menggunakan dua jenis pesan: pacs.008 untuk informasi transaksi (siapa pengirim, siapa penerima, berapa nominal, kapan waktunya), dan pacs.002 untuk konfirmasi status transaksi (apakah berhasil atau gagal). Kedua pesan ini harus dikirimkan secara berurutan untuk setiap transaksi yang ingin diperiksa.

**Program penghubung ini bisa dibuat untuk berjalan secara real-time atau batch.** Kalau real-time, setiap ada transaksi baru langsung dikirim ke Tazama untuk diperiksa. Kalau batch, transaksi dikumpulkan dulu dalam periode tertentu, baru dikirim sekaligus ke Tazama.

**Setelah Tazama selesai memeriksa, hasilnya bisa diambil dari database Tazama** atau langsung dari response saat mengirim transaksi. Hasil ini berisi status apakah transaksi aman, perlu ditinjau, atau harus diblokir, beserta detail skor dari setiap aturan yang dijalankan.

---

## Alur Lengkap: Dari Instalasi Sampai Penggunaan

```mermaid
flowchart TB
    subgraph FASE1["Fase 1: Instalasi"]
        A1["Siapkan Server"]
        A2["Pasang Docker"]
        A3["Unduh & Jalankan Tazama"]
    end
    
    subgraph FASE2["Fase 2: Pembuatan Aturan"]
        B1["Tulis Kode Program Aturan"]
        B2["Build & Kemas ke Docker"]
        B3["Jalankan Program Aturan"]
        B4["Daftarkan Konfigurasi ke Database"]
        B5["Aktifkan di Network Map"]
    end
    
    subgraph FASE3["Fase 3: Integrasi"]
        C1["Buat Program Penghubung"]
        C2["Hubungkan dengan<br/>Database Transaksi"]
        C3["Atur Jadwal Pengiriman<br/>(Real-time/Batch)"]
    end
    
    subgraph FASE4["Fase 4: Operasional"]
        D1["Transaksi Dikirim<br/>ke Tazama"]
        D2["Tazama Memeriksa<br/>Setiap Transaksi"]
        D3["Hasil Disimpan:<br/>Aman/Peringatan/Blokir"]
    end
    
    A1 --> A2 --> A3 --> B1
    B1 --> B2 --> B3 --> B4 --> B5 --> C1
    C1 --> C2 --> C3 --> D1
    D1 --> D2 --> D3
```

---

## Alur Pemrosesan Transaksi di Dalam Tazama

Ketika sebuah transaksi dikirim ke Tazama, berikut adalah proses yang terjadi di dalam sistem:

```mermaid
sequenceDiagram
    participant Bank as Sistem Bank
    participant TMS as Penerima Transaksi
    participant ED as Pengarah
    participant Rule as Pemeriksa Aturan
    participant TP as Penghitung Skor
    participant TADP as Pengambil Keputusan
    participant DB as Database

    Bank->>TMS: Kirim info transaksi (pacs.008)
    Bank->>TMS: Kirim konfirmasi status (pacs.002)
    TMS->>ED: Teruskan transaksi
    ED->>ED: Baca daftar aturan aktif (Network Map)
    ED->>Rule: Kirim ke semua aturan yang aktif
    Rule->>Rule: Periksa transaksi sesuai kriteria
    Rule->>TP: Kirim hasil pemeriksaan
    TP->>TP: Hitung total skor berdasarkan bobot
    TP->>TADP: Kirim total skor
    TADP->>TADP: Bandingkan dengan batas threshold
    TADP->>DB: Simpan hasil pemeriksaan
    TADP-->>Bank: Hasil: Aman / Peringatan / Blokir
```

---

## Ringkasan

| Tahap | Kegiatan | Estimasi Waktu |
|-------|----------|----------------|
| **Instalasi** | Siapkan server, pasang Docker, unduh dan jalankan Tazama | 1-2 jam |
| **Membuat Aturan Baru** | Tulis kode, build, deploy, konfigurasi database, aktivasi | 1-3 hari per aturan |
| **Integrasi** | Buat program penghubung, hubungkan dengan sistem transaksi | 1-2 minggu |
| **Operasional** | Sistem berjalan otomatis memeriksa transaksi | Berkelanjutan |

---

## Catatan Penting

1. **Tazama membutuhkan tim teknis** untuk instalasi, pembuatan aturan, dan integrasi dengan sistem yang sudah ada.

2. **Setiap aturan baru memerlukan pengembangan program**, bukan hanya konfigurasi. Ini membutuhkan programmer yang memahami TypeScript dan arsitektur Tazama.

3. **Integrasi dengan sistem transaksi yang sudah ada memerlukan program penghubung** yang harus dibuat khusus sesuai dengan struktur data dan sistem yang digunakan.

4. **Format data harus diubah ke ISO 20022** sebelum dikirim ke Tazama. Ini adalah standar internasional yang digunakan Tazama untuk memahami data transaksi.

5. **Hasil pemeriksaan perlu ditindaklanjuti** oleh tim operasional untuk transaksi yang mendapat status peringatan atau blokir.
