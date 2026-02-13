# Panduan Sederhana Tazama
## Sistem Pendeteksi Transaksi Mencurigakan

---

## Apa itu Tazama?

Bayangkan Tazama seperti **satpam digital** untuk transaksi keuangan. Setiap kali ada transfer uang, Tazama akan mengecek apakah transaksi itu normal atau mencurigakan.

Contoh sederhana:
- Kalau kamu transfer Rp 500.000 → Tazama bilang "OK, normal"
- Kalau kamu transfer Rp 50.000.000 → Tazama bilang "Wah, ini perlu dicek dulu!"

---

## Bagaimana Cara Kerjanya?

### Analogi: Seperti Pemeriksaan di Bandara

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   PENUMPANG (Transaksi)                                     │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────────┐                                           │
│   │  CHECK-IN   │  ← Transaksi masuk ke sistem              │
│   │  (TMS API)  │                                           │
│   └─────────────┘                                           │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────────┐                                           │
│   │  SECURITY   │  ← Diarahkan ke pemeriksaan               │
│   │  (Router)   │                                           │
│   └─────────────┘                                           │
│        │                                                    │
│        ├──────────────┬──────────────┐                      │
│        ▼              ▼              ▼                      │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │ X-Ray   │    │ Metal   │    │ Dokumen │  ← Dicek       │
│   │ (Rule 1)│    │Detector │    │ (Rule 3)│    berbagai    │
│   │         │    │(Rule 2) │    │         │    aspek       │
│   └─────────┘    └─────────┘    └─────────┘                │
│        │              │              │                      │
│        └──────────────┴──────────────┘                      │
│                       │                                     │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │  KEPUTUSAN      │                            │
│              │  ✅ Boleh lewat │                            │
│              │  ⚠️ Perlu cek   │                            │
│              │  🚫 Ditahan     │                            │
│              └─────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Alur dari Awal sampai Akhir

### 1️⃣ INSTALASI (Menyiapkan "Pos Keamanan")

**Apa yang terjadi:**
- Download dan pasang Tazama di komputer
- Seperti membangun pos keamanan lengkap dengan peralatannya

**Yang dibutuhkan:**
- Komputer dengan RAM minimal 8GB
- Docker (aplikasi untuk menjalankan Tazama)
- Koneksi internet

**Langkah sederhana:**
```
1. Install Docker di komputer
2. Download Tazama dari GitHub
3. Jalankan script instalasi
4. Tunggu sampai selesai (sekitar 10-30 menit)
```

---

### 2️⃣ SISTEM BERJALAN (Pos Keamanan Siap Beroperasi)

Setelah instalasi, Tazama punya beberapa "petugas" yang bekerja:

| Petugas | Tugas |
|---------|-------|
| **TMS** | Menerima transaksi yang masuk |
| **Event Director** | Mengarahkan transaksi ke pemeriksaan yang tepat |
| **Rule Processor** | Memeriksa transaksi berdasarkan aturan tertentu |
| **Typology Processor** | Menghitung skor kecurigaan |
| **TADP** | Membuat keputusan akhir |

---

### 3️⃣ TRANSAKSI MASUK (Ada "Penumpang" Datang)

Ketika bank mengirim transaksi ke Tazama, prosesnya seperti ini:

```
LANGKAH 1: Bank kirim info "Mau transfer"
           ↓
           "Pak Budi mau transfer Rp 15 juta ke Pak Andi"

LANGKAH 2: Bank kirim konfirmasi "Transfer berhasil"
           ↓
           "Transfer sudah selesai, statusnya sukses"

LANGKAH 3: Tazama mulai memeriksa
           ↓
           "Hmm, Rp 15 juta ya... coba kita cek"
```

---

### 4️⃣ PEMERIKSAAN (Dicek Berbagai Aspek)

Tazama punya beberapa "aturan" untuk memeriksa transaksi:

**Contoh Aturan:**

| Aturan | Yang Dicek | Contoh |
|--------|------------|--------|
| Rule 901 | Berapa kali pengirim transfer hari ini? | "Pak Budi sudah transfer 10x hari ini" |
| Rule 902 | Berapa kali penerima dapat transfer? | "Pak Andi dapat 50 transfer hari ini" |
| Rule 903 | Berapa besar nominalnya? | "Rp 15 juta, ini termasuk besar" |
| Rule 904 | Seberapa cepat transaksi berturut-turut? | "3 transfer dalam 5 menit" |

---

### 5️⃣ PERHITUNGAN SKOR (Menilai Tingkat Kecurigaan)

Setiap aturan memberikan "nilai kecurigaan":

```
CONTOH: Transfer Rp 15 juta

Rule 903 memeriksa nominal:
┌────────────────────────────────────────┐
│ Nominal          │ Nilai Kecurigaan   │
├────────────────────────────────────────┤
│ < Rp 1 juta      │ 0 (aman)           │
│ Rp 1-5 juta      │ 100 (normal)       │
│ Rp 5-10 juta     │ 300 (perlu dicek)  │
│ > Rp 10 juta     │ 500 (mencurigakan) │
└────────────────────────────────────────┘

Rp 15 juta → Nilai: 500
```

---

### 6️⃣ KEPUTUSAN AKHIR (Boleh Lewat atau Tidak?)

Berdasarkan total nilai, Tazama memutuskan:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Total Nilai < 200                                 │
│   ✅ AMAN - Transaksi diizinkan                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Total Nilai 200-400                               │
│   ⚠️ ALERT - Transaksi jalan, tapi dicatat         │
│              untuk direview petugas                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Total Nilai > 400                                 │
│   🚫 BLOKIR - Transaksi ditahan                     │
│               sampai ada persetujuan                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Contoh Skenario Nyata

### Skenario 1: Transfer Normal
```
Pak Budi transfer Rp 500.000 ke Pak Andi

→ Rule 903 cek nominal: Rp 500.000 (nilai: 0)
→ Total nilai: 0
→ Keputusan: ✅ AMAN
→ Transaksi langsung diproses
```

### Skenario 2: Transfer Besar
```
Pak Budi transfer Rp 50.000.000 ke Pak Andi

→ Rule 903 cek nominal: Rp 50 juta (nilai: 500)
→ Total nilai: 500
→ Keputusan: 🚫 BLOKIR
→ Transaksi ditahan, petugas akan menghubungi Pak Budi
```

### Skenario 3: Transfer Cepat Berturut-turut
```
Pak Budi transfer 5x dalam 10 menit, masing-masing Rp 200.000

→ Rule 904 cek kecepatan: 5 transaksi cepat (nilai: 400)
→ Total nilai: 400
→ Keputusan: ⚠️ ALERT
→ Transaksi jalan, tapi dicatat untuk direview
```

---

## Cara Menambah Aturan Baru

Kalau mau menambah aturan baru, prosesnya seperti ini:

### Langkah 1: Tentukan Apa yang Mau Dicek
```
Contoh: "Saya mau cek kalau transfer ke rekening baru"
```

### Langkah 2: Tentukan Nilai untuk Setiap Kondisi
```
- Rekening sudah dikenal (>30 hari): nilai 0
- Rekening baru (7-30 hari): nilai 100
- Rekening sangat baru (<7 hari): nilai 300
```

### Langkah 3: Buat Aturannya di Sistem
```
Ini bagian teknis yang dilakukan programmer
```

### Langkah 4: Daftarkan ke Sistem
```
Aturan baru didaftarkan supaya ikut memeriksa transaksi
```

### Langkah 5: Test
```
Coba kirim transaksi untuk memastikan aturan bekerja
```

---

## Ringkasan Alur Data

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. BANK KIRIM TRANSAKSI                                    │
│     "Pak Budi mau transfer Rp 15 juta ke Pak Andi"          │
│                          │                                  │
│                          ▼                                  │
│  2. TAZAMA TERIMA                                           │
│     Transaksi masuk ke sistem                               │
│                          │                                  │
│                          ▼                                  │
│  3. DIARAHKAN KE PEMERIKSAAN                                │
│     Sistem tentukan aturan mana yang aktif                  │
│                          │                                  │
│                          ▼                                  │
│  4. DIPERIKSA BERBAGAI ATURAN                               │
│     Rule 901, 902, 903, 904, dll                            │
│                          │                                  │
│                          ▼                                  │
│  5. DIHITUNG TOTAL NILAI                                    │
│     Semua nilai dari aturan dijumlahkan                     │
│                          │                                  │
│                          ▼                                  │
│  6. KEPUTUSAN                                               │
│     ✅ Aman / ⚠️ Alert / 🚫 Blokir                          │
│                          │                                  │
│                          ▼                                  │
│  7. HASIL DISIMPAN                                          │
│     Dicatat di database untuk laporan                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Istilah Sederhana

| Istilah Teknis | Artinya |
|----------------|---------|
| TMS API | Pintu masuk transaksi |
| Event Director | Pengarah lalu lintas |
| Rule | Aturan pemeriksaan |
| Typology | Kumpulan aturan |
| Network Map | Daftar aturan yang aktif |
| NALT | Aman, tidak ada masalah |
| ALRT | Ada yang perlu dicek |
| Interdiction | Transaksi diblokir |
| pacs.008 | Pesan "mau transfer" |
| pacs.002 | Pesan "transfer selesai" |

---

## Kesimpulan

Tazama bekerja seperti sistem keamanan bandara:

1. **Transaksi masuk** → Seperti penumpang datang
2. **Diperiksa berbagai aspek** → Seperti lewat X-ray, metal detector
3. **Dihitung tingkat kecurigaan** → Seperti penilaian risiko
4. **Keputusan dibuat** → Boleh lewat, perlu cek, atau ditahan

Dengan sistem ini, bank bisa otomatis mendeteksi transaksi mencurigakan tanpa harus mengecek satu per satu secara manual.

---

*Dokumen ini adalah versi sederhana untuk memahami konsep dasar Tazama.*
