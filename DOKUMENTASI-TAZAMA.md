# Dokumentasi Lengkap: Membuat Custom Rules di Tazama

## Daftar Isi
1. [Pengenalan Tazama](#1-pengenalan-tazama)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Instalasi Tazama](#3-instalasi-tazama)
4. [Konsep Rule dan Typology](#4-konsep-rule-dan-typology)
5. [Membuat Custom Rule](#5-membuat-custom-rule)
6. [Konfigurasi Database](#6-konfigurasi-database)
7. [Deploy dan Testing](#7-deploy-dan-testing)
8. [Demo UI](#8-demo-ui)

---

## 1. Pengenalan Tazama

### Apa itu Tazama?
Tazama adalah **open-source real-time transaction monitoring system** dari Linux Foundation untuk mendeteksi fraud dan financial crime.

### Fitur Utama:
- Real-time transaction evaluation
- Configurable rules dan typologies
- ISO 20022 message support (pacs.008, pacs.002)
- Scalable microservices architecture

### Use Cases:
- Deteksi transaksi mencurigakan
- Anti-money laundering (AML)
- Fraud prevention
- Transaction monitoring

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        TAZAMA ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │   TMS    │───▶│   CRSP   │───▶│    TP    │───▶│   TADP   │  │
│  │ (Gateway)│    │ (Router) │    │(Typology)│    │(Aggregat)│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                               │                          │
│       │              ┌────────────────┼────────────────┐        │
│       │              │                │                │        │
│       ▼              ▼                ▼                ▼        │
│  ┌──────────┐   ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │   ED     │   │ Rule 901 │    │ Rule 903 │    │ Rule 904 │  │
│  │(EventDir)│   │ (Debtor) │    │ (Large)  │    │ (Rapid)  │  │
│  └──────────┘   └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      INFRASTRUCTURE                        │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │  │
│  │  │ NATS   │  │Postgres│  │ Valkey │  │ Hasura │          │  │
│  │  │(Queue) │  │  (DB)  │  │(Cache) │  │(GraphQL)│          │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen Utama:

| Komponen | Fungsi |
|----------|--------|
| TMS | Transaction Monitoring Service - Gateway untuk menerima transaksi |
| CRSP | Channel Router & Setup Processor - Routing ke rules |
| TP | Typology Processor - Evaluasi typology |
| TADP | Transaction Aggregation & Determination Processor |
| ED | Event Director - Menyimpan hasil evaluasi |
| Rule Executer | Menjalankan logic rule |

---

## 3. Instalasi Tazama

### Prerequisites:
- Docker & Docker Compose
- Git
- 8GB+ RAM
- 20GB+ Disk space

### Langkah Instalasi:

```bash
# 1. Clone repository
git clone https://github.com/tazama-lf/Full-Stack-Docker-Tazama.git
cd Full-Stack-Docker-Tazama

# 2. Checkout versi stabil
git checkout v3.0.0

# 3. Setup environment
cp .env.example .env

# 4. Start infrastructure
./tazama.sh up base

# 5. Start core services (DockerHub option)
./tazama.sh up hub

# 6. (Optional) Start utilities
./tazama.sh up hasura    # GraphQL interface
./tazama.sh up pgadmin   # Database admin
```

### Verifikasi Instalasi:

```bash
# Cek semua container running
docker ps

# Test endpoint
curl http://localhost:5000/health
```

### Port yang Digunakan:

| Service | Port | URL |
|---------|------|-----|
| TMS (API) | 5000 | http://localhost:5000 |
| Hasura | 6100 | http://localhost:6100 |
| PgAdmin | 5050 | http://localhost:5050 |
| NATS | 4222 | - |
| PostgreSQL | 5432 | - |

---

## 4. Konsep Rule dan Typology

### Hierarki Evaluasi:

```
Network Map
    └── Message (pacs.002.001.12)
            └── Typology (903-Large-Transaction)
                    └── Rule (903@1.0.0)
                            └── Bands (scoring)
```

### Rule
- Unit terkecil evaluasi
- Menganalisis satu aspek transaksi
- Menghasilkan **score** berdasarkan bands

**Contoh Rule:**
```
Rule 903 - Large Transaction Detection
├── Band 1: < 1 juta      → Score 0
├── Band 2: 1-5 juta      → Score 100
├── Band 3: 5-10 juta     → Score 300
└── Band 4: > 10 juta     → Score 500
```

### Typology
- Kumpulan rules dengan bobot (weight)
- Menghitung total score dari semua rules
- Menentukan status: NALT (Normal) atau ALRT (Alert)

**Contoh Typology:**
```
Typology: 903-Large-Transaction
├── Rule 903 (weight: 1.0)
├── Alert Threshold: 200
└── Interdiction Threshold: 400
```

### Network Map
- Mendefinisikan typology mana yang aktif
- Mapping message type ke typologies

---

## 5. Membuat Custom Rule

### Step 1: Clone Template Rule

```bash
# Clone dari rule-901 sebagai template
git clone https://github.com/tazama-lf/rule-901.git rule-903
cd rule-903
```

### Step 2: Update package.json

```json
{
  "name": "rule-903",
  "version": "1.0.0",
  "description": "Large Transaction Detection Rule"
}
```

### Step 3: Implementasi Logic Rule

**File: `src/rule-903.ts`**

```typescript
import type { 
  DatabaseManagerInstance, 
  LoggerService, 
  ManagerConfig 
} from '@tazama-lf/frms-coe-lib';
import type { 
  RuleConfig, 
  RuleRequest, 
  RuleResult 
} from '@tazama-lf/frms-coe-lib/lib/interfaces';

export async function handleTransaction(
  req: RuleRequest,
  determineOutcome: (value: number, ruleConfig: RuleConfig, ruleResult: RuleResult) => RuleResult,
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
    return { ...ruleRes, subRuleRef: '.x00', reason: 'Unsuccessful transaction' };
  }

  // 3. Ambil nilai yang akan dievaluasi
  const amount = req.DataCache?.instdAmt?.amt || 0;

  // 4. Return ke determineOutcome untuk scoring
  return determineOutcome(amount, ruleConfig, ruleRes);
}
```

### Step 4: Build dan Package

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Hasil di folder /lib
```

### Step 5: Setup Rule Executer

```bash
# Clone rule-executer
git clone https://github.com/tazama-lf/rule-executer.git rule-executer-903
cd rule-executer-903
```

**Update `src/config.ts`:**
```typescript
export const config = {
  ruleName: 'rule-903',
  ruleVersion: '1.0.0',
  ruleId: '903@1.0.0',
  // ...
};
```

### Step 6: Buat Dockerfile

**File: `Dockerfile`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy rule-executer
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Copy rule library
COPY node_modules/rule/ ./node_modules/rule/

EXPOSE 3000
CMD ["node", "build/index.js"]
```

### Step 7: Build Docker Image

```bash
docker build -t rule-903:local -f Dockerfile .
```

---

## 6. Konfigurasi Database

### 6.1 Insert Rule Config

```sql
-- Connect ke database configuration
INSERT INTO rule (configuration, ruleid, rulecfg, tenantid)
VALUES (
  '{
    "id": "903@1.0.0",
    "cfg": "1.0.0",
    "desc": "Large Transaction Detection",
    "tenantId": "DEFAULT",
    "config": {
      "parameters": {},
      "bands": [
        {"subRuleRef": ".01", "lowerLimit": 0, "upperLimit": 1000000, "reason": "Normal"},
        {"subRuleRef": ".02", "lowerLimit": 1000000, "upperLimit": 5000000, "reason": "Medium"},
        {"subRuleRef": ".03", "lowerLimit": 5000000, "upperLimit": 10000000, "reason": "High"},
        {"subRuleRef": ".04", "lowerLimit": 10000000, "upperLimit": 999999999999, "reason": "Critical"}
      ],
      "exitConditions": [
        {"subRuleRef": ".x00", "reason": "Unsuccessful transaction"}
      ]
    }
  }'::jsonb,
  '903@1.0.0',
  '1.0.0',
  'DEFAULT'
);
```

### 6.2 Insert Typology Config

```sql
INSERT INTO typology (configuration, typologyid, typologycfg, tenantid)
VALUES (
  '{
    "id": "typology-processor@1.0.0",
    "cfg": "903-Large-Transaction",
    "tenantId": "DEFAULT",
    "rules": [
      {
        "id": "903@1.0.0",
        "cfg": "1.0.0",
        "termId": "v903at100at100",
        "wghts": [
          {"ref": ".err", "wght": "0"},
          {"ref": ".x00", "wght": "0"},
          {"ref": ".01", "wght": "0"},
          {"ref": ".02", "wght": "100"},
          {"ref": ".03", "wght": "300"},
          {"ref": ".04", "wght": "500"}
        ]
      },
      {
        "id": "EFRuP@1.0.0",
        "cfg": "none",
        "termId": "vEFRuPat100atnone",
        "wghts": [{"ref": "none", "wght": "0"}]
      }
    ],
    "expression": ["Add", "v903at100at100"],
    "workflow": {
      "flowProcessor": "EFRuP@1.0.0",
      "alertThreshold": 200,
      "interdictionThreshold": 400
    },
    "typology_name": "Large-Transaction-Alert"
  }'::jsonb,
  'typology-processor@1.0.0',
  '903-Large-Transaction',
  'DEFAULT'
);
```

### 6.3 Update Network Map

```sql
UPDATE network_map SET configuration = '{
  "cfg": "1.0.0",
  "name": "Custom Network Map",
  "active": true,
  "tenantId": "DEFAULT",
  "messages": [{
    "id": "004@1.0.0",
    "cfg": "1.0.0",
    "txTp": "pacs.002.001.12",
    "typologies": [
      {
        "id": "typology-processor@1.0.0",
        "cfg": "903-Large-Transaction",
        "tenantId": "DEFAULT",
        "rules": [
          {"id": "EFRuP@1.0.0", "cfg": "none"},
          {"id": "903@1.0.0", "cfg": "1.0.0"}
        ]
      }
    ]
  }]
}'::jsonb;
```

### 6.4 Clear Cache

```bash
docker exec tazama-valkey-1 valkey-cli FLUSHALL
```

---

## 7. Deploy dan Testing

### 7.1 Docker Compose untuk Custom Rule

**File: `docker-compose.rule-903.yaml`**

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
      - POSTGRES_HOST=postgres
      - REDIS_HOST=valkey
      - NATS_SERVER=nats://nats:4222
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

### 7.2 Start Custom Rule

```bash
docker compose -f docker-compose.rule-903.yaml up -d
```

### 7.3 Testing dengan curl

**Kirim pacs.008 (Payment Initiation):**

```bash
curl -X POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10 \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.008.001.10",
    "FIToFICstmrCdtTrf": {
      "GrpHdr": {
        "MsgId": "TEST_001",
        "CreDtTm": "2026-01-21T10:00:00.000Z",
        "NbOfTxs": 1,
        "SttlmInf": {"SttlmMtd": "CLRG"}
      },
      "CdtTrfTxInf": {
        "PmtId": {"InstrId": "INSTR_001", "EndToEndId": "E2E_001"},
        "IntrBkSttlmAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
        "InstdAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
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

**Kirim pacs.002 (Payment Status):**

```bash
curl -X POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12 \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.002.001.12",
    "FIToFIPmtSts": {
      "GrpHdr": {"MsgId": "PACS002_001", "CreDtTm": "2026-01-21T10:00:01.000Z"},
      "TxInfAndSts": {
        "OrgnlInstrId": "INSTR_001",
        "OrgnlEndToEndId": "E2E_001",
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
      "instdAmt": {"amt": 15000000, "ccy": "IDR"}
    }
  }'
```

### 7.4 Cek Hasil Evaluasi

```bash
curl -X POST http://localhost:6100/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: password" \
  -d '{
    "query": "{ evaluation(where: {messageid: {_eq: \"PACS002_001\"}}) { evaluation } }"
  }'
```

---

## 8. Demo UI

### Akses Demo UI
```
http://localhost:8888
```

### Fitur Demo UI:
1. **Quick Presets** - Tombol cepat untuk skenario test
2. **Transaction Form** - Input manual transaksi
3. **Real-time Results** - Hasil evaluasi langsung
4. **History** - Riwayat transaksi

### Skenario Demo:

| Skenario | Amount | Expected Result |
|----------|--------|-----------------|
| Normal | 500.000 | ✅ NALT (Score 0) |
| Large | 15.000.000 | 🚨 ALRT (Score 500) |
| Rapid (1st) | 100.000 | ✅ NALT (Score 0) |
| Rapid (2nd) | 100.000 | ⚠️ ALRT (Score 200) |
| Rapid (4th) | 100.000 | 🚨 ALRT (Score 400) |

### Start Demo UI Server:

```bash
cd demo-ui
python3 -m http.server 8888
```

---

## Ringkasan Alur Kerja

```
1. INSTALASI
   └── Clone repo → Setup env → Start containers

2. BUAT RULE
   └── Clone template → Implement logic → Build → Docker image

3. KONFIGURASI
   └── Insert rule config → Insert typology → Update network map → Clear cache

4. DEPLOY
   └── Docker compose up → Verify logs

5. TESTING
   └── Send pacs.008 → Send pacs.002 → Check evaluation

6. DEMO
   └── Open UI → Test scenarios → Show results
```

---

## Troubleshooting

### Container tidak start
```bash
docker logs tazama-rule-903-1
```

### Rule tidak terdeteksi
```bash
# Cek NATS subscription
docker logs tazama-rule-903-1 | grep "subscribe"

# Clear cache
docker exec tazama-valkey-1 valkey-cli FLUSHALL
```

### Evaluation tidak muncul
```bash
# Cek database
docker exec tazama-postgres-1 psql -U postgres -d evaluation \
  -c "SELECT * FROM evaluation ORDER BY createdat DESC LIMIT 5;"
```

---

## Resources

- **Tazama GitHub**: https://github.com/tazama-lf
- **Documentation**: https://tazama.atlassian.net/wiki
- **ISO 20022**: https://www.iso20022.org

---

*Dokumentasi ini dibuat untuk keperluan presentasi dan pembelajaran.*
*Versi Tazama: 3.0.0*
