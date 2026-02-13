# Setup Tazama di Windows

Panduan ini menjelaskan cara menyiapkan seluruh project Tazama (termasuk demo UI, custom rules, dan semua konfigurasi) di PC Windows dari repository ini.

---

## 1. Prerequisites

### Software yang Perlu Diinstall

| Software | Download | Keterangan |
|----------|----------|------------|
| **Git** | https://git-scm.com/download/win | Version control |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ | Container runtime |
| **Node.js 20 LTS** | https://nodejs.org/ | Untuk build rules |
| **VS Code** | https://code.visualstudio.com/ | Code editor |
| **Postman** | https://www.postman.com/downloads/ | API testing |
| **Python 3** | https://www.python.org/downloads/ | Untuk demo UI server (opsional) |

### System Requirements

| Komponen | Minimum |
|----------|---------|
| OS | Windows 10/11 (64-bit) |
| RAM | 16 GB |
| Storage | 30 GB free |
| CPU | 4 cores |

### Konfigurasi Docker Desktop

1. Buka Docker Desktop
2. Settings → Resources
3. Set minimal:
   - CPUs: 4
   - Memory: 8 GB
   - Disk: 20 GB
4. Pastikan WSL 2 backend aktif (Settings → General → Use the WSL 2 based engine)

---

## 2. Clone Repository

Buka Command Prompt atau PowerShell:

```powershell
# Clone repo ini
git clone https://github.com/USERNAME/tazama-project.git
cd tazama-project
```

> Ganti `USERNAME` dengan username GitHub kamu.

---

## 3. Deploy Tazama

### 3.1 Masuk ke folder Full-Stack-Docker

```powershell
cd Full-Stack-Docker-Tazama-dev
```

### 3.2 Jalankan Tazama

**Pakai script bawaan:**
```powershell
# Windows
tazama.bat
```

Pilih opsi deployment:
- **Option 2** (Public DockerHub) - paling mudah, tidak perlu build
- Aktifkan addon: pgAdmin, Hasura

**Atau manual:**
```powershell
# Start infrastructure
docker compose -p tazama -f docker-compose.base.infrastructure.yaml -f docker-compose.base.override.yaml up -d

# Start core (DockerHub)
docker compose -p tazama -f docker-compose.base.infrastructure.yaml -f docker-compose.base.override.yaml -f docker-compose.hub.cfg.yaml -f docker-compose.hub.core.yaml up -d

# Start utilities
docker compose -p tazama -f docker-compose.base.infrastructure.yaml -f docker-compose.base.override.yaml -f docker-compose.utils.hasura.yaml -f docker-compose.utils.pgadmin.yaml up -d
```

### 3.3 Verifikasi

```powershell
# Cek semua container running
docker ps

# Test TMS API
curl http://localhost:5000
# Expected: {"status":"UP"}
```

---

## 4. Setup Custom Rules (903 & 904)

### 4.1 Deploy Rule 903

```powershell
cd ..
cd rule-903
npm install
npm run build
cd ..
```

### 4.2 Deploy Rule 904

```powershell
cd rule-904
npm install
npm run build
cd ..
```

### 4.3 Konfigurasi Rules di Database

Jalankan script konfigurasi (pastikan Tazama sudah running):

```powershell
# Setup Rule 903
bash configs/setup-rule903.sh

# Setup Rule 904
bash configs/setup-rule904.sh
```

> Di Windows tanpa bash, bisa jalankan via Git Bash atau WSL.
> Atau import konfigurasi manual via Postman (lihat section 6).

---

## 5. Demo UI

### 5.1 Jalankan Demo UI

```powershell
cd demo-ui

# Option 1: Python
python -m http.server 8888

# Option 2: Node.js (install http-server dulu)
npx http-server -p 8888

# Option 3: Langsung buka file
# Double-click index-animated.html di browser
```

### 5.2 Akses Demo UI

Buka browser: http://localhost:8888/index-animated.html

### File Demo UI yang tersedia:

| File | Deskripsi |
|------|-----------|
| `index.html` | Demo UI basic |
| `index-animated.html` | Demo UI dengan animasi |

---

## 6. Setup Postman

### 6.1 Import Collections

1. Buka Postman
2. Import file-file dari folder `postman/`:
   - `DEMO-TAZAMA-CUSTOM-RULES.postman_collection.json` (demo custom rules)
   - `2.1. (NO-AUTH) Public DockerHub End-to-End Test.postman_collection.json` (end-to-end test)
3. Import environment:
   - `postman/environments/Tazama-Demo-Local.postman_environment.json`

### 6.2 Pilih Environment

Di Postman, pilih environment **Tazama-Demo-Local** di dropdown kanan atas.

### 6.3 Jalankan Test

Klik "Run Collection" pada collection yang diimport.

---

## 7. Demo Scripts

### 7.1 Demo Large Transaction (Rule 903)

```powershell
# Via Git Bash atau WSL
bash demo-rule903.sh
```

### 7.2 Demo Rapid Transaction (Rule 904)

```powershell
bash demo-rule904.sh
```

### 7.3 Demo Large Transaction Amount

```powershell
bash demo-large-transaction.sh
```

> Semua demo script menggunakan `curl`. Di Windows, pastikan curl tersedia
> (sudah built-in di Windows 10+) atau jalankan via Git Bash.

---

## 8. Struktur Folder

```
tazama-project/
├── Full-Stack-Docker-Tazama-dev/  # Docker compose Tazama
├── demo-ui/                        # Demo UI (HTML)
├── configs/                         # Konfigurasi rules
├── postman/                         # Postman collections
├── rule-901/                        # Rule 901 (default)
├── rule-903/                        # Rule 903 (large transaction)
├── rule-903-simple/                 # Rule 903 simplified
├── rule-904/                        # Rule 904 (rapid transaction)
├── rule-907-example/                # Rule 907 example
├── rule-executer/                   # Rule executer (template)
├── rule-executer-903/               # Rule executer for 903
├── rule-executer-904/               # Rule executer for 904
├── rule-builder/                    # Rule builder UI
├── phishing-demo/                   # Phishing demo scripts
├── tazama-libs/                     # Tazama libraries
├── demo-rule903.sh                  # Demo script rule 903
├── demo-rule904.sh                  # Demo script rule 904
├── demo-large-transaction.sh        # Demo large transaction
├── test-rapid.sh                    # Test rapid transactions
├── run-scenario.sh                  # Run scenario script
├── DOKUMENTASI-TAZAMA.md            # Dokumentasi lengkap
├── TUTORIAL-INSTALASI-TAZAMA.md     # Tutorial instalasi
├── TAZAMA-DOCUMENTATION.md          # Documentation (EN)
├── TAZAMA-GUIDE.md                  # Guide
├── TAZAMA-PANDUAN-SEDERHANA.md      # Panduan sederhana
├── PANDUAN-TAZAMA-UNTUK-MANAJEMEN.md # Panduan manajemen
├── POSTMAN-DEMO-GUIDE.md            # Panduan demo Postman
├── INFRASTRUKTUR-TAZAMA-BANK-GRADE.md # Spek infrastruktur
├── INTEGRASI-KAFKA-TAZAMA.md        # Integrasi Kafka
├── KEBUTUHAN-SERVER-TAZAMA.md       # Kebutuhan server
└── SETUP-WINDOWS.md                 # Panduan ini
```

---

## 9. Troubleshooting Windows

### Docker tidak bisa start

```powershell
# Pastikan WSL 2 terinstall
wsl --install

# Restart Docker Desktop
# Pastikan Hyper-V atau WSL 2 backend aktif
```

### Port sudah dipakai

```powershell
# Cek port yang dipakai
netstat -ano | findstr :5000

# Kill process yang pakai port
taskkill /PID <PID> /F
```

### curl tidak ditemukan

```powershell
# Windows 10+ sudah ada curl built-in
# Jika tidak ada, install via:
winget install curl

# Atau gunakan Git Bash yang sudah include curl
```

### bash script tidak jalan

```powershell
# Option 1: Pakai Git Bash
# Klik kanan file .sh → Open with Git Bash

# Option 2: Pakai WSL
wsl bash demo-rule903.sh

# Option 3: Jalankan curl command manual dari script
```

### Container crash / restart loop

```powershell
# Cek logs
docker logs tazama-tms-1

# Restart semua
docker compose -p tazama down
docker compose -p tazama up -d

# Nuclear option: hapus semua dan mulai ulang
docker compose -p tazama down -v
docker system prune -a
```

---

## 10. Quick Start (Ringkasan)

```powershell
# 1. Clone
git clone https://github.com/USERNAME/tazama-project.git
cd tazama-project

# 2. Start Tazama
cd Full-Stack-Docker-Tazama-dev
tazama.bat
# Pilih Option 2 (DockerHub), aktifkan pgAdmin & Hasura

# 3. Tunggu semua container ready (~2-5 menit)
docker ps

# 4. Test
curl http://localhost:5000

# 5. Buka Demo UI
# Buka browser: demo-ui/index-animated.html

# 6. Import Postman collection dan test
```

---

**Selesai! Tazama siap digunakan di Windows.**
