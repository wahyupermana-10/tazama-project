# TUTORIAL LENGKAP INSTALASI DAN KONFIGURASI TAZAMA
## Sistem Deteksi Fraud Real-Time untuk Transaksi Keuangan

---

## DAFTAR ISI

1. [Pengenalan Tazama](#1-pengenalan-tazama)
2. [Persiapan Sistem](#2-persiapan-sistem)
3. [Instalasi Tazama](#3-instalasi-tazama)
4. [Verifikasi Instalasi](#4-verifikasi-instalasi)
5. [Memahami Arsitektur Tazama](#5-memahami-arsitektur-tazama)
6. [Membuat Custom Rule](#6-membuat-custom-rule)
7. [Konfigurasi Database](#7-konfigurasi-database)
8. [Deploy Custom Rule](#8-deploy-custom-rule)
9. [Testing dan Demo](#9-testing-dan-demo)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. PENGENALAN TAZAMA

### 1.1 Apa itu Tazama?

Tazama adalah sistem **Transaction Monitoring** open-source dari Linux Foundation yang dirancang untuk mendeteksi fraud dan financial crime secara real-time. Sistem ini menggunakan format pesan **ISO 20022** (standar internasional untuk pesan keuangan).

### 1.2 Fitur Utama

- ✅ Real-time transaction evaluation
- ✅ Configurable rules dan typologies
- ✅ ISO 20022 message support (pacs.008, pacs.002)
- ✅ Scalable microservices architecture
- ✅ Docker-based deployment

### 1.3 Use Cases

- Deteksi transaksi mencurigakan
- Anti-money laundering (AML)
- Fraud prevention
- Transaction monitoring real-time

**[Screenshot: Logo Tazama atau diagram overview sistem]**

---

## 2. PERSIAPAN SISTEM

### 2.1 Kebutuhan Hardware

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| Disk Space | 20 GB | 50 GB |
| CPU | 4 cores | 8 cores |
| OS | Windows 10/11, Linux, macOS | - |

### 2.2 Software yang Dibutuhkan


#### 2.2.1 Docker Desktop

**Windows:**
1. Download Docker Desktop dari: https://www.docker.com/products/docker-desktop
2. Install dengan double-click file installer
3. Restart komputer setelah instalasi
4. Buka Docker Desktop dan pastikan status "Running"

**[Screenshot: Docker Desktop running]**

#### 2.2.2 Git

**Windows:**
1. Download Git dari: https://git-scm.com/download/win
2. Install dengan setting default
3. Verifikasi instalasi:
```bash
git --version
```

**[Screenshot: Git version output]**

#### 2.2.3 Code Editor (VS Code)

1. Download VS Code dari: https://code.visualstudio.com/
2. Install dengan setting default

**[Screenshot: VS Code welcome screen]**

#### 2.2.4 GitHub Personal Access Token

1. Login ke GitHub
2. Klik profile → Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Klik "Generate new token (classic)"
4. Beri nama token: "Tazama Development"
5. Pilih permissions:
   - ✅ `read:packages`
   - ✅ `read:org`
6. Klik "Generate token"
7. **PENTING:** Copy token dan simpan (tidak bisa dilihat lagi)

**[Screenshot: GitHub token generation page]**


#### 2.2.5 Setup Environment Variable (Windows)

1. Buka "Edit the system environment variables"
2. Klik "Environment Variables"
3. Di "User variables", klik "New"
4. Variable name: `GH_TOKEN`
5. Variable value: [paste token dari langkah sebelumnya]
6. Klik OK

**[Screenshot: Environment Variables dialog]**

Verifikasi:
```cmd
echo %GH_TOKEN%
```

**[Screenshot: Token verification output]**

---

## 3. INSTALASI TAZAMA

### 3.1 Clone Repository

Buka Command Prompt atau Terminal, lalu jalankan:

```bash
# Buat folder untuk project
mkdir C:\Tazama
cd C:\Tazama

# Clone repository
git clone https://github.com/tazama-lf/Full-Stack-Docker-Tazama.git
cd Full-Stack-Docker-Tazama
```

**Output yang diharapkan:**
```
Cloning into 'Full-Stack-Docker-Tazama'...
remote: Enumerating objects: 1353, done.
remote: Counting objects: 100% (578/578), done.
Receiving objects: 100% (1353/1353), 2.12 MiB | 2.80 MiB/s, done.
```

**[Screenshot: Git clone output]**


### 3.2 Konfigurasi Environment

1. Buka folder project di VS Code:
```bash
code .
```

2. Buka file `.env`
3. Pastikan `GH_TOKEN` sudah terisi (jika sudah set environment variable, biarkan `${GH_TOKEN}`)
4. Pilih versi yang ingin di-deploy:
   - `TAZAMA_VERSION=latest` untuk versi stabil
   - `TAZAMA_VERSION=rc` untuk versi development

**[Screenshot: .env file di VS Code]**

### 3.3 Menjalankan Instalasi

#### 3.3.1 Start Docker Desktop

Pastikan Docker Desktop sudah running sebelum melanjutkan.

**[Screenshot: Docker Desktop status running]**

#### 3.3.2 Jalankan Script Instalasi

**Windows (Command Prompt):**
```cmd
tazama.bat
```

**Windows (PowerShell):**
```powershell
.\tazama.bat
```

**Linux/macOS:**
```bash
chmod +x tazama.sh
./tazama.sh
```


#### 3.3.3 Pilih Tipe Deployment

Menu akan muncul:
```
Select docker deployment type:

1. Public (GitHub)
2. Public (DockerHub)
3. Full-service (DockerHub)
4. Multi-Tenant Public (DockerHub)
5. Docker Utilities
6. Database Utilities
7. Consoles

Select option (1-7), or (q)uit:
Enter your choice:
```

**Rekomendasi untuk pemula:** Pilih **2** (Public DockerHub)

**[Screenshot: Menu deployment]**

#### 3.3.4 Pilih Add-ons

Setelah memilih deployment type, menu add-ons akan muncul:

```
Enable optional deployment configuration addons:

CORE ADDONS:
1. [ ] Authentication
2. [ ] Relay Services (NATS)
3. [ ] Basic Logs
4. [ ] Demo UI

UTILITY ADDONS:
5. [ ] NATS Utilities
6. [ ] Batch PPA
7. [X] pgAdmin for PostgreSQL
8. [X] Hasura GraphQL API for PostgreSQL

Toggle addons (1-8), (a)pply current selection, (r)eturn, or (q)uit
Enter your choice:
```

**Rekomendasi untuk development:**
- Toggle ON (ketik angka untuk toggle):
  - 2 (Relay Services)
  - 5 (NATS Utilities)
  - 7 (pgAdmin) - sudah ON by default
  - 8 (Hasura) - sudah ON by default

Setelah selesai, ketik **a** untuk apply.

**[Screenshot: Add-ons selection]**


#### 3.3.5 Proses Download dan Build

Proses ini akan memakan waktu 10-30 menit tergantung kecepatan internet dan spesifikasi komputer.

Output yang akan muncul:
```
[+] Running 15/15
 ✔ Container tazama-postgres-1        Started
 ✔ Container tazama-nats-1            Started
 ✔ Container tazama-valkey-1          Started
 ✔ Container tazama-hasura-1          Started
 ✔ Container tazama-tms-1             Started
 ✔ Container tazama-ed-1              Started
 ✔ Container tazama-rule-901-1        Started
 ✔ Container tazama-tp-1              Started
 ✔ Container tazama-tadp-1            Started
 ...
```

**[Screenshot: Docker containers starting]**

---

## 4. VERIFIKASI INSTALASI

### 4.1 Cek Container Status

Buka Docker Desktop dan pastikan semua container berstatus "Running".

**[Screenshot: Docker Desktop containers list]**

Atau via command line:
```bash
docker ps
```

**[Screenshot: docker ps output]**

### 4.2 Test TMS API

Buka browser atau gunakan curl:

```bash
curl http://localhost:5000
```

**Output yang diharapkan:**
```json
{"status":"UP"}
```

**[Screenshot: TMS API response]**


### 4.3 Akses Web Interfaces

Buka browser dan akses:

| Service | URL | Credentials |
|---------|-----|-------------|
| TMS API | http://localhost:5000 | - |
| Hasura Console | http://localhost:6100 | Password: `password` |
| pgAdmin | http://localhost:15050 | Email: `admin@tazama.org`<br>Password: `tazama` |

**[Screenshot: Hasura console]**
**[Screenshot: pgAdmin login]**

### 4.4 Test dengan Postman/Newman

#### 4.4.1 Clone Postman Repository

```bash
cd C:\Tazama
git clone https://github.com/tazama-lf/postman.git
cd postman
```

#### 4.4.2 Install Newman (Optional)

```bash
npm install -g newman
```

#### 4.4.3 Jalankan Test

```bash
newman run "Newman/Newman - 2.1. (NO-AUTH) Public DockerHub End-to-End Test.postman_collection.json" -e "environments/Tazama-Docker-Compose.postman_environment.json" --timeout-request 10200 --delay-request 500
```

**Output yang diharapkan:**
```
┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               39 │                0 │
└─────────────────────────┴──────────────────┴──────────────────┘
```

**[Screenshot: Newman test results]**


---

## 5. MEMAHAMI ARSITEKTUR TAZAMA

### 5.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    TAZAMA ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Client/Bank]                                               │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │   TMS   │───▶│   ED    │───▶│  Rules  │───▶│   TP    │ │
│  │ (API)   │    │(Router) │    │(901-904)│    │(Typology)│ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│                                      │              │       │
│                                      ▼              ▼       │
│                                 ┌─────────┐    ┌─────────┐ │
│                                 │  TADP   │◀───│ Results │ │
│                                 │(Decision)│    └─────────┘ │
│                                 └─────────┘                 │
│                                      │                      │
│                                      ▼                      │
│                                 [ALERT/BLOCK]               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              INFRASTRUCTURE                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │PostgreSQL│  │   NATS   │  │  Valkey  │           │  │
│  │  │   (DB)   │  │ (Queue)  │  │ (Cache)  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**[Screenshot: Diagram arsitektur yang lebih detail]**


### 5.2 Komponen Utama

| Komponen | Fungsi | Port |
|----------|--------|------|
| **TMS** | Transaction Monitoring Service - Entry point untuk transaksi | 5000 |
| **ED** | Event Director - Routing transaksi ke rules berdasarkan network map | - |
| **Rule Processors** | Evaluasi individual (901, 902, 903, 904, dll) | - |
| **TP** | Typology Processor - Kombinasi hasil rules, hitung skor | - |
| **TADP** | Transaction Aggregation & Decision - Keputusan final alert/block | - |
| **PostgreSQL** | Database untuk konfigurasi dan hasil evaluasi | 5432 |
| **NATS** | Message broker untuk komunikasi antar service | 4222 |
| **Valkey** | In-memory cache untuk performa | 6379 |
| **Hasura** | GraphQL API untuk database | 6100 |

### 5.3 Alur Transaksi

```
1. CLIENT mengirim pacs.008 (Payment Initiation) → TMS
2. CLIENT mengirim pacs.002 (Payment Status) → TMS
3. TMS → ED (Event Director)
4. ED membaca Network Map → menentukan rules yang aktif
5. ED → Rule Processors (901, 902, 903, 904, dll)
6. Rules mengevaluasi → return subRuleRef (.01, .02, .03, .04)
7. Rule Results → TP (Typology Processor)
8. TP menghitung skor berdasarkan weight
9. TP → TADP (Transaction Aggregation & Decision Processor)
10. TADP membandingkan skor dengan threshold
11. TADP → Database (simpan hasil)
12. TADP → ALERT/BLOCK (jika perlu)
```

**[Screenshot: Sequence diagram alur transaksi]**


### 5.4 Konsep Rule, Typology, dan Network Map

#### 5.4.1 Rule

Rule adalah unit terkecil evaluasi yang menganalisis satu aspek transaksi.

**Contoh Rule 903 - Large Transaction Detection:**

```typescript
// Pseudo-code
if (transaction.status !== 'ACCC') {
  return '.x00' // Exit: transaksi gagal
}

amount = transaction.amount

if (amount < 1000000) return '.01'      // Score: 0
if (amount < 5000000) return '.02'      // Score: 100
if (amount < 10000000) return '.03'     // Score: 300
return '.04'                             // Score: 500
```

**Bands Configuration:**
| Band | Range | subRuleRef | Score |
|------|-------|------------|-------|
| 1 | < Rp 1 juta | .01 | 0 |
| 2 | Rp 1-5 juta | .02 | 100 |
| 3 | Rp 5-10 juta | .03 | 300 |
| 4 | > Rp 10 juta | .04 | 500 |

#### 5.4.2 Typology

Typology adalah kombinasi beberapa rules dengan bobot (weight) masing-masing.

**Contoh Typology 903-Large-Transaction:**

```json
{
  "id": "typology-processor@1.0.0",
  "cfg": "903-Large-Transaction",
  "rules": [
    {
      "id": "903@1.0.0",
      "wghts": [
        {"ref": ".01", "wght": "0"},
        {"ref": ".02", "wght": "100"},
        {"ref": ".03", "wght": "300"},
        {"ref": ".04", "wght": "500"}
      ]
    }
  ],
  "workflow": {
    "alertThreshold": 200,
    "interdictionThreshold": 400
  }
}
```

**Perhitungan Skor:**
- Rule 903 return `.04` → Weight 500
- Total Score: 500
- Score >= 400 → **INTERDICTION** (Blokir transaksi)


#### 5.4.3 Network Map

Network Map menentukan rules dan typologies mana yang aktif untuk jenis transaksi tertentu.

```json
{
  "messages": [
    {
      "txTp": "pacs.002.001.12",
      "typologies": [
        {
          "cfg": "903-Large-Transaction",
          "rules": [
            {"id": "903@1.0.0", "cfg": "1.0.0"}
          ]
        }
      ]
    }
  ]
}
```

**[Screenshot: Diagram hubungan Network Map → Typology → Rules]**

---

## 6. MEMBUAT CUSTOM RULE

Sekarang kita akan membuat custom rule untuk mendeteksi transaksi dengan nominal besar.

### 6.1 Clone Template Rule

```bash
cd C:\Tazama
git clone https://github.com/tazama-lf/rule-901.git rule-903
cd rule-903
```

**[Screenshot: Clone rule template]**

### 6.2 Update package.json

Buka `package.json` dan ubah:

```json
{
  "name": "@tazama-lf/rule-903",
  "version": "1.0.0",
  "description": "Rule 903 - Large Transaction Detection",
  "main": "lib/index.js"
}
```

**[Screenshot: package.json edited]**


### 6.3 Implementasi Logic Rule

Buka file `src/rule-903.ts` dan ganti dengan kode berikut:

```typescript
import type { 
  DatabaseManagerInstance, 
  LoggerService 
} from '@tazama-lf/frms-coe-lib';
import type { 
  RuleConfig, 
  RuleRequest, 
  RuleResult 
} from '@tazama-lf/frms-coe-lib/lib/interfaces';

export async function handleTransaction(
  req: RuleRequest,
  determineOutcome: (
    value: number, 
    ruleConfig: RuleConfig, 
    ruleResult: RuleResult
  ) => RuleResult,
  ruleRes: RuleResult,
  loggerService: LoggerService,
  ruleConfig: RuleConfig,
  databaseManager: DatabaseManagerInstance<any>,
): Promise<RuleResult> {
  
  // 1. Validasi config
  if (!ruleConfig.config.bands?.length) {
    throw new Error('Invalid ruleConfig - bands not provided');
  }

  // 2. Exit condition: transaksi gagal
  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    return { 
      ...ruleRes, 
      subRuleRef: '.x00', 
      reason: 'Unsuccessful transaction' 
    };
  }

  // 3. Ambil nilai yang akan dievaluasi
  const amount = req.DataCache?.instdAmt?.amt || 0;

  // 4. Return ke determineOutcome untuk scoring
  return determineOutcome(amount, ruleConfig, ruleRes);
}
```

**[Screenshot: rule-903.ts code]**


### 6.4 Build Rule

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

**Output yang diharapkan:**
```
> @tazama-lf/rule-903@1.0.0 build
> tsc

Successfully compiled TypeScript
```

**[Screenshot: npm run build output]**

Hasil build akan ada di folder `lib/`.

**[Screenshot: lib folder structure]**

### 6.5 Buat Dockerfile

Buat file `Dockerfile` di root folder rule-903:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY lib ./lib

EXPOSE 3000
CMD ["node", "lib/index.js"]
```

**[Screenshot: Dockerfile content]**

### 6.6 Build Docker Image

```bash
docker build -t rule-903:local .
```

**Output yang diharapkan:**
```
[+] Building 45.2s (10/10) FINISHED
 => [internal] load build definition
 => => transferring dockerfile: 234B
 => [internal] load .dockerignore
 => [1/5] FROM docker.io/library/node:20-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm ci --only=production
 => [5/5] COPY lib ./lib
 => exporting to image
 => => exporting layers
 => => writing image sha256:abc123...
 => => naming to docker.io/library/rule-903:local
```

**[Screenshot: Docker build output]**


---

## 7. KONFIGURASI DATABASE

### 7.1 Akses Hasura Console

1. Buka browser: http://localhost:6100
2. Masukkan password: `password`

**[Screenshot: Hasura login]**

### 7.2 Insert Rule Configuration

Di Hasura Console, buka tab "API" dan jalankan query berikut:

```graphql
mutation InsertRule903Config {
  insert_rule_one(object: {
    configuration: {
      id: "903@1.0.0",
      cfg: "1.0.0",
      desc: "Large Transaction Detection",
      tenantId: "DEFAULT",
      config: {
        parameters: {},
        bands: [
          {
            subRuleRef: ".01",
            lowerLimit: 0,
            upperLimit: 1000000,
            reason: "Normal transaction"
          },
          {
            subRuleRef: ".02",
            lowerLimit: 1000000,
            upperLimit: 5000000,
            reason: "Medium amount"
          },
          {
            subRuleRef: ".03",
            lowerLimit: 5000000,
            upperLimit: 10000000,
            reason: "High amount"
          },
          {
            subRuleRef: ".04",
            lowerLimit: 10000000,
            upperLimit: 999999999999,
            reason: "Critical - Very large amount"
          }
        ],
        exitConditions: [
          {
            subRuleRef: ".x00",
            reason: "Unsuccessful transaction"
          }
        ]
      }
    },
    ruleid: "903@1.0.0",
    rulecfg: "1.0.0",
    tenantid: "DEFAULT"
  }) {
    id
  }
}
```

**[Screenshot: Hasura mutation execution]**


### 7.3 Insert Typology Configuration

```graphql
mutation InsertTypology903 {
  insert_typology_one(object: {
    configuration: {
      id: "typology-processor@1.0.0",
      cfg: "903-Large-Transaction",
      tenantId: "DEFAULT",
      typology_name: "Large-Transaction-Alert",
      rules: [
        {
          id: "903@1.0.0",
          cfg: "1.0.0",
          termId: "v903at100at100",
          wghts: [
            {ref: ".err", wght: "0"},
            {ref: ".x00", wght: "0"},
            {ref: ".01", wght: "0"},
            {ref: ".02", wght: "100"},
            {ref: ".03", wght: "300"},
            {ref: ".04", wght: "500"}
          ]
        },
        {
          id: "EFRuP@1.0.0",
          cfg: "none",
          termId: "vEFRuPat100atnone",
          wghts: [
            {ref: "none", wght: "0"}
          ]
        }
      ],
      expression: ["Add", "v903at100at100"],
      workflow: {
        flowProcessor: "EFRuP@1.0.0",
        alertThreshold: 200,
        interdictionThreshold: 400
      }
    },
    typologyid: "typology-processor@1.0.0",
    typologycfg: "903-Large-Transaction",
    tenantid: "DEFAULT"
  }) {
    id
  }
}
```

**[Screenshot: Typology insertion result]**


### 7.4 Update Network Map

```graphql
mutation UpdateNetworkMap {
  update_network_map(
    where: {tenantid: {_eq: "DEFAULT"}},
    _set: {
      configuration: {
        cfg: "1.0.0",
        name: "Custom Network Map with Rule 903",
        active: true,
        tenantId: "DEFAULT",
        messages: [
          {
            id: "004@1.0.0",
            cfg: "1.0.0",
            txTp: "pacs.002.001.12",
            typologies: [
              {
                id: "typology-processor@1.0.0",
                cfg: "903-Large-Transaction",
                tenantId: "DEFAULT",
                rules: [
                  {id: "EFRuP@1.0.0", cfg: "none"},
                  {id: "903@1.0.0", cfg: "1.0.0"}
                ]
              }
            ]
          }
        ]
      }
    }
  ) {
    affected_rows
  }
}
```

**[Screenshot: Network map update result]**

### 7.5 Clear Cache

Buka Command Prompt dan jalankan:

```bash
docker exec tazama-valkey-1 valkey-cli FLUSHALL
```

**Output:**
```
OK
```

**[Screenshot: Cache cleared]**

---

## 8. DEPLOY CUSTOM RULE

### 8.1 Buat Docker Compose File

Buat file `docker-compose.rule-903.yaml` di folder `Full-Stack-Docker-Tazama`:

```yaml
services:
  rule-903:
    image: rule-903:local
    container_name: tazama-rule-903-1
    environment:
      - FUNCTION_NAME=rule-903-rel-1-0-0
      - RULE_NAME=903@1.0.0
      - RULE_VERSION=1.0.0
      - NODE_ENV=production
      - CONFIGURATION_DATABASE=configuration
      - CONFIGURATION_DATABASE_HOST=postgres
      - CONFIGURATION_DATABASE_USER=postgres
      - CONFIGURATION_DATABASE_PASSWORD=tazama
      - REDIS_HOST=valkey
      - REDIS_PORT=6379
      - STARTUP_TYPE=nats
      - SERVER_URL=nats://nats:4222
    networks:
      - tazama-network
    depends_on:
      - nats
      - postgres
      - valkey

networks:
  tazama-network:
    external: true
    name: tazama-network
```

**[Screenshot: docker-compose.rule-903.yaml]**


### 8.2 Start Custom Rule

```bash
cd C:\Tazama\Full-Stack-Docker-Tazama
docker compose -f docker-compose.rule-903.yaml up -d
```

**Output:**
```
[+] Running 1/1
 ✔ Container tazama-rule-903-1  Started
```

**[Screenshot: Rule 903 container started]**

### 8.3 Verifikasi Rule Running

```bash
docker logs tazama-rule-903-1 --tail 50
```

**Output yang diharapkan:**
```
[INFO] Rule 903 processor started
[INFO] Connected to NATS server
[INFO] Subscribed to: rule-903-rel-1-0-0
[INFO] Ready to process transactions
```

**[Screenshot: Rule 903 logs]**

### 8.4 Restart Core Processors

Setelah update network map, restart processors berikut:

```bash
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1
```

**[Screenshot: Processors restarted]**

---

## 9. TESTING DAN DEMO

### 9.1 Test Transaksi Normal (Rp 500.000)

#### Step 1: Kirim pacs.008 (Initiation)

```bash
curl -X POST "http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10" \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.008.001.10",
    "FIToFICstmrCdtTrf": {
      "GrpHdr": {
        "MsgId": "TEST_NORMAL_001",
        "CreDtTm": "2026-01-22T10:00:00.000Z",
        "NbOfTxs": 1,
        "SttlmInf": {"SttlmMtd": "CLRG"}
      },
      "CdtTrfTxInf": {
        "PmtId": {
          "InstrId": "instr_normal_001",
          "EndToEndId": "e2e_normal_001"
        },
        "IntrBkSttlmAmt": {"Amt": {"Amt": 500000, "Ccy": "IDR"}},
        "InstdAmt": {"Amt": {"Amt": 500000, "Ccy": "IDR"}},
        "Dbtr": {"Nm": "John Doe"},
        "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_001"}]}},
        "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
        "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
        "Cdtr": {"Nm": "Jane Smith"},
        "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_002"}]}}
      }
    }
  }'
```

**[Screenshot: pacs.008 request]**


#### Step 2: Kirim pacs.002 (Completion)

```bash
curl -X POST "http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12" \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.002.001.12",
    "FIToFIPmtSts": {
      "GrpHdr": {
        "MsgId": "PACS002_NORMAL_001",
        "CreDtTm": "2026-01-22T10:00:01.000Z"
      },
      "TxInfAndSts": {
        "OrgnlInstrId": "instr_normal_001",
        "OrgnlEndToEndId": "e2e_normal_001",
        "TxSts": "ACCC",
        "ChrgsInf": [
          {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
          {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
        ],
        "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
        "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
      }
    },
    "DataCache": {
      "dbtrId": "JOHN",
      "cdtrId": "JANE",
      "dbtrAcctId": "ACC_001",
      "cdtrAcctId": "ACC_002",
      "instdAmt": {"amt": 500000, "ccy": "IDR"}
    }
  }'
```

**[Screenshot: pacs.002 request]**

#### Step 3: Cek Hasil di Hasura

Buka Hasura Console dan jalankan query:

```graphql
query GetEvaluation {
  evaluation(
    where: {messageid: {_eq: "PACS002_NORMAL_001"}},
    order_by: {createdat: desc}
  ) {
    evaluation
    createdat
  }
}
```

**Expected Result:**
```json
{
  "data": {
    "evaluation": [
      {
        "evaluation": {
          "report": {
            "status": "NALT"
          }
        }
      }
    ]
  }
}
```

**[Screenshot: Hasura query result - NALT]**


### 9.2 Test Transaksi Besar (Rp 15.000.000) - ALERT

#### Step 1: Kirim pacs.008

```bash
curl -X POST "http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10" \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.008.001.10",
    "FIToFICstmrCdtTrf": {
      "GrpHdr": {
        "MsgId": "TEST_LARGE_001",
        "CreDtTm": "2026-01-22T10:05:00.000Z",
        "NbOfTxs": 1,
        "SttlmInf": {"SttlmMtd": "CLRG"}
      },
      "CdtTrfTxInf": {
        "PmtId": {
          "InstrId": "instr_large_001",
          "EndToEndId": "e2e_large_001"
        },
        "IntrBkSttlmAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
        "InstdAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
        "Dbtr": {"Nm": "Victim User"},
        "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_VICTIM"}]}},
        "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
        "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
        "Cdtr": {"Nm": "Fraudster"},
        "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_FRAUD"}]}}
      }
    }
  }'
```

#### Step 2: Kirim pacs.002

```bash
curl -X POST "http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12" \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.002.001.12",
    "FIToFIPmtSts": {
      "GrpHdr": {
        "MsgId": "PACS002_LARGE_001",
        "CreDtTm": "2026-01-22T10:05:01.000Z"
      },
      "TxInfAndSts": {
        "OrgnlInstrId": "instr_large_001",
        "OrgnlEndToEndId": "e2e_large_001",
        "TxSts": "ACCC",
        "ChrgsInf": [
          {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
          {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
        ],
        "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
        "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
      }
    },
    "DataCache": {
      "dbtrId": "VICTIM",
      "cdtrId": "FRAUDSTER",
      "dbtrAcctId": "ACC_VICTIM",
      "cdtrAcctId": "ACC_FRAUD",
      "instdAmt": {"amt": 15000000, "ccy": "IDR"}
    }
  }'
```


#### Step 3: Cek Hasil di Hasura

```graphql
query GetEvaluation {
  evaluation(
    where: {messageid: {_eq: "PACS002_LARGE_001"}},
    order_by: {createdat: desc}
  ) {
    evaluation
    createdat
  }
}
```

**Expected Result:**
```json
{
  "data": {
    "evaluation": [
      {
        "evaluation": {
          "report": {
            "status": "ALRT",
            "typologies": [
              {
                "id": "903-Large-Transaction",
                "score": 500,
                "threshold": 400,
                "result": "INTERDICTION"
              }
            ]
          }
        }
      }
    ]
  }
}
```

**[Screenshot: Hasura query result - ALRT]**

### 9.3 Ringkasan Hasil Testing

| Skenario | Amount | Rule Result | Score | Status | Keterangan |
|----------|--------|-------------|-------|--------|------------|
| Normal | Rp 500.000 | .01 | 0 | NALT | ✅ Transaksi diizinkan |
| Medium | Rp 3.000.000 | .02 | 100 | NALT | ✅ Transaksi diizinkan |
| High | Rp 7.000.000 | .03 | 300 | ALRT | ⚠️ Alert, perlu review |
| Critical | Rp 15.000.000 | .04 | 500 | ALRT | 🚨 Interdiction, DIBLOKIR |

**[Screenshot: Tabel hasil testing dengan warna]**

---

## 10. TROUBLESHOOTING

### 10.1 Container Tidak Start

**Problem:** Container gagal start atau crash

**Solution:**
```bash
# Cek logs container
docker logs tazama-rule-903-1

# Restart container
docker restart tazama-rule-903-1

# Rebuild jika perlu
docker compose -f docker-compose.rule-903.yaml up -d --build --force-recreate
```

**[Screenshot: Docker logs output]**


### 10.2 Rule Tidak Terdeteksi

**Problem:** Rule tidak menerima transaksi

**Solution:**
```bash
# 1. Cek NATS subscription
docker logs tazama-rule-903-1 | grep "subscribe"

# 2. Clear cache
docker exec tazama-valkey-1 valkey-cli FLUSHALL

# 3. Restart ED, TP, TADP
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1

# 4. Restart rule
docker restart tazama-rule-903-1
```

### 10.3 Evaluation Tidak Muncul di Database

**Problem:** Hasil evaluasi tidak tersimpan

**Solution:**
```bash
# 1. Cek database connection
docker exec tazama-postgres-1 psql -U postgres -d evaluation -c "SELECT COUNT(*) FROM evaluation;"

# 2. Cek Hasura initialization
docker logs tazama-hasura-init-1

# 3. Restart Hasura jika ada error
docker restart tazama-hasura-init-1
```

### 10.4 Postman Test Gagal

**Problem:** Newman test collection gagal

**Solution:**
1. Pastikan semua container running
2. Tunggu 30 detik setelah start untuk warm-up
3. Cek Hasura console accessible
4. Jalankan test satu per satu di Postman App

### 10.5 Port Already in Use

**Problem:** Port sudah digunakan aplikasi lain

**Solution:**
```bash
# Windows - cek port usage
netstat -ano | findstr :5000

# Kill process (ganti PID)
taskkill /PID <PID> /F

# Atau ubah port di docker-compose file
```

### 10.6 Out of Memory

**Problem:** Docker kehabisan memory

**Solution:**
1. Buka Docker Desktop → Settings → Resources
2. Increase Memory Limit ke minimum 8GB
3. Restart Docker Desktop

**[Screenshot: Docker Desktop memory settings]**


---

## LAMPIRAN

### A. Command Reference

#### Docker Commands
```bash
# List all containers
docker ps -a

# List all images
docker images

# Stop all Tazama containers
docker stop $(docker ps -q --filter "name=tazama")

# Remove all Tazama containers
docker rm $(docker ps -aq --filter "name=tazama")

# Remove all unused images
docker image prune -a

# View container logs
docker logs <container-name> --tail 100 -f

# Execute command in container
docker exec -it <container-name> bash
```

#### Database Commands
```bash
# Connect to PostgreSQL
docker exec -it tazama-postgres-1 psql -U postgres

# List databases
\l

# Connect to database
\c configuration

# List tables
\dt

# Query data
SELECT * FROM rule LIMIT 5;
```

#### Valkey/Redis Commands
```bash
# Connect to Valkey
docker exec -it tazama-valkey-1 valkey-cli

# Clear all cache
FLUSHALL

# List all keys
KEYS *

# Get value
GET <key>
```

### B. Port Reference

| Service | Port | URL |
|---------|------|-----|
| TMS API | 5000 | http://localhost:5000 |
| Admin API | 5100 | http://localhost:5100 |
| Auth API | 3020 | http://localhost:3020 |
| Hasura | 6100 | http://localhost:6100 |
| pgAdmin | 15050 | http://localhost:15050 |
| PostgreSQL | 15432 | localhost:15432 |
| NATS | 14222 | localhost:14222 |
| Valkey | 16379 | localhost:16379 |


### C. File Structure Reference

```
C:\Tazama\
├── Full-Stack-Docker-Tazama/
│   ├── .env                              # Environment variables
│   ├── tazama.bat                        # Windows installation script
│   ├── tazama.sh                         # Unix installation script
│   ├── docker-compose.*.yaml             # Docker compose files
│   ├── auth/                             # Authentication configs
│   ├── env/                              # Environment files
│   ├── hasura/                           # Hasura configs
│   └── postgres/                         # Database migrations
│
├── rule-903/                             # Custom rule
│   ├── src/
│   │   ├── index.ts
│   │   └── rule-903.ts                   # Rule logic
│   ├── lib/                              # Built files
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
└── postman/                              # Test collections
    ├── Newman/                           # Newman CLI tests
    ├── environments/                     # Postman environments
    └── *.postman_collection.json         # Test collections
```

### D. Environment Variables Reference

**Rule Configuration:**
```bash
FUNCTION_NAME=rule-903-rel-1-0-0
RULE_NAME=903@1.0.0
RULE_VERSION=1.0.0
NODE_ENV=production
```

**Database Configuration:**
```bash
CONFIGURATION_DATABASE=configuration
CONFIGURATION_DATABASE_HOST=postgres
CONFIGURATION_DATABASE_USER=postgres
CONFIGURATION_DATABASE_PASSWORD=tazama
```

**Cache Configuration:**
```bash
REDIS_HOST=valkey
REDIS_PORT=6379
REDIS_DB=0
```

**NATS Configuration:**
```bash
STARTUP_TYPE=nats
SERVER_URL=nats://nats:4222
```


### E. Glossary / Istilah Penting

| Istilah | Penjelasan |
|---------|------------|
| **Rule** | Unit evaluasi terkecil yang menganalisis satu aspek transaksi |
| **Typology** | Kombinasi beberapa rules dengan bobot untuk mendeteksi pola fraud |
| **Network Map** | Konfigurasi yang menentukan rules dan typologies mana yang aktif |
| **Band** | Range nilai untuk scoring dalam rule |
| **subRuleRef** | Referensi hasil evaluasi rule (contoh: .01, .02, .03, .04) |
| **Weight** | Bobot yang diberikan untuk setiap subRuleRef dalam typology |
| **Threshold** | Batas skor untuk menentukan alert atau interdiction |
| **NALT** | No Alert - Transaksi normal, diizinkan |
| **ALRT** | Alert - Transaksi mencurigakan, perlu review atau diblokir |
| **Interdiction** | Pemblokiran transaksi secara otomatis |
| **pacs.008** | ISO 20022 message untuk payment initiation |
| **pacs.002** | ISO 20022 message untuk payment status |
| **TMS** | Transaction Monitoring Service - Entry point API |
| **ED** | Event Director - Router transaksi |
| **TP** | Typology Processor - Evaluasi typology |
| **TADP** | Transaction Aggregation & Decision Processor |
| **Valkey** | In-memory cache (fork dari Redis) |
| **NATS** | Message broker untuk pub/sub |
| **Hasura** | GraphQL engine untuk PostgreSQL |

### F. Resources & Links

**Official Documentation:**
- Tazama GitHub: https://github.com/tazama-lf
- Tazama Wiki: https://tazama.atlassian.net/wiki
- ISO 20022 Standard: https://www.iso20022.org/

**Docker Resources:**
- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

**Development Tools:**
- VS Code: https://code.visualstudio.com/
- Postman: https://www.postman.com/
- Git: https://git-scm.com/

**Community:**
- Tazama Slack: [Contact team for invite]
- GitHub Discussions: https://github.com/tazama-lf/discussions


---

## KESIMPULAN

Selamat! Anda telah berhasil:

✅ **Menginstall Tazama** - Sistem transaction monitoring berbasis Docker
✅ **Memahami Arsitektur** - Komponen dan alur kerja Tazama
✅ **Membuat Custom Rule** - Rule 903 untuk deteksi transaksi besar
✅ **Konfigurasi Database** - Setup rule, typology, dan network map
✅ **Deploy dan Testing** - Menjalankan rule dan menguji dengan transaksi

### Next Steps

1. **Eksplorasi Rules Lain**
   - Pelajari rule-901 (Debtor transaction count)
   - Pelajari rule-904 (Rapid transaction detection)
   - Buat rule custom sesuai kebutuhan

2. **Advanced Configuration**
   - Multi-tenant setup
   - Authentication dengan Keycloak
   - Logging dengan Elastic Stack

3. **Production Deployment**
   - Deploy ke Kubernetes
   - Setup monitoring dan alerting
   - Implement CI/CD pipeline

4. **Integration**
   - Integrate dengan core banking system
   - Setup webhook untuk alerts
   - Build dashboard untuk monitoring

### Tips untuk Development

- Selalu backup konfigurasi database sebelum perubahan
- Gunakan version control (Git) untuk semua custom rules
- Test di environment development sebelum production
- Monitor logs secara berkala
- Clear cache setelah update konfigurasi

### Support

Jika mengalami kesulitan:
1. Cek section Troubleshooting di tutorial ini
2. Review logs container yang bermasalah
3. Konsultasi dokumentasi official Tazama
4. Hubungi tim Tazama atau community

---

**Versi Tutorial:** 1.0
**Tanggal:** Januari 2026
**Tazama Version:** 3.0.0

**Dibuat untuk keperluan pembelajaran dan development.**

---

## CATATAN UNTUK SCREENSHOT

Berikut adalah daftar tempat di mana Anda perlu menambahkan screenshot saat membuat dokumentasi di Word:

1. **Section 1.1** - Logo Tazama atau diagram overview sistem
2. **Section 2.2.1** - Docker Desktop running
3. **Section 2.2.2** - Git version output
4. **Section 2.2.3** - VS Code welcome screen
5. **Section 2.2.4** - GitHub token generation page
6. **Section 2.2.5** - Environment Variables dialog & Token verification
7. **Section 3.1** - Git clone output
8. **Section 3.2** - .env file di VS Code
9. **Section 3.3.1** - Docker Desktop status running
10. **Section 3.3.3** - Menu deployment
11. **Section 3.3.4** - Add-ons selection
12. **Section 3.3.5** - Docker containers starting
13. **Section 4.1** - Docker Desktop containers list & docker ps output
14. **Section 4.2** - TMS API response
15. **Section 4.3** - Hasura console & pgAdmin login
16. **Section 4.4.3** - Newman test results
17. **Section 5.1** - Diagram arsitektur detail
18. **Section 5.3** - Sequence diagram alur transaksi
19. **Section 5.4.3** - Diagram hubungan Network Map → Typology → Rules
20. **Section 6.1** - Clone rule template
21. **Section 6.2** - package.json edited
22. **Section 6.3** - rule-903.ts code
23. **Section 6.4** - npm run build output & lib folder structure
24. **Section 6.5** - Dockerfile content
25. **Section 6.6** - Docker build output
26. **Section 7.1** - Hasura login
27. **Section 7.2** - Hasura mutation execution
28. **Section 7.3** - Typology insertion result
29. **Section 7.4** - Network map update result
30. **Section 7.5** - Cache cleared
31. **Section 8.1** - docker-compose.rule-903.yaml
32. **Section 8.2** - Rule 903 container started
33. **Section 8.3** - Rule 903 logs
34. **Section 8.4** - Processors restarted
35. **Section 9.1** - pacs.008 & pacs.002 requests
36. **Section 9.1 Step 3** - Hasura query result - NALT
37. **Section 9.2 Step 3** - Hasura query result - ALRT
38. **Section 9.3** - Tabel hasil testing dengan warna
39. **Section 10.1** - Docker logs output
40. **Section 10.6** - Docker Desktop memory settings

**Total: 40+ screenshot yang perlu ditambahkan**

Setiap screenshot harus:
- Jelas dan readable
- Diberi caption yang sesuai
- Highlight bagian penting jika perlu
- Resolusi yang cukup untuk print

---

**END OF TUTORIAL**
