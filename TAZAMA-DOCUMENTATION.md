# Dokumentasi Tazama - Sistem Deteksi Fraud

## Daftar Isi
1. [Apa itu Tazama?](#apa-itu-tazama)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Alur Kerja Transaksi](#alur-kerja-transaksi)
4. [Komponen Utama](#komponen-utama)
5. [Cara Membuat Rule](#cara-membuat-rule)
6. [Cara Membuat Typology](#cara-membuat-typology)
7. [Cara Membuat Network Map](#cara-membuat-network-map)
8. [Simulasi & Demo](#simulasi--demo)

---

## Apa itu Tazama?

Tazama adalah sistem **Transaction Monitoring** open-source dari Linux Foundation untuk mendeteksi fraud/penipuan dalam transaksi keuangan. Sistem ini menggunakan format **ISO 20022** (standar internasional untuk pesan keuangan).

### Kegunaan:
- Mendeteksi transaksi mencurigakan
- Memblokir transaksi fraud secara real-time
- Monitoring pola transaksi
- Compliance dengan regulasi anti-money laundering (AML)

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ALUR TRANSAKSI                               │
└─────────────────────────────────────────────────────────────────────┘

   [Bank/FSP]
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   TMS API   │────▶│    Event    │────▶│    Rule     │
│  (port 5000)│     │  Director   │     │ Processors  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │              ┌─────┴─────┐
                          │              │           │
                          │         Rule 901   Rule 903
                          │         Rule 902   (custom)
                          │              │           │
                          │              └─────┬─────┘
                          │                    │
                          ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Typology   │◀────│   Results   │
                    │  Processor  │     │             │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │    TADP     │──────▶ [ALERT/BLOCK]
                    │ (Aggregator)│
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  PostgreSQL │
                    │  (Results)  │
                    └─────────────┘
```

### Komponen:

| Komponen | Port | Fungsi |
|----------|------|--------|
| TMS API | 5000 | Entry point untuk transaksi |
| Admin API | 5100 | Manajemen konfigurasi |
| Event Director | - | Routing transaksi ke rules |
| Rule Processors | - | Evaluasi rule individual |
| Typology Processor | - | Kombinasi hasil rules, hitung skor |
| TADP | - | Agregasi final, keputusan alert/block |
| PostgreSQL | 5432 | Database konfigurasi & hasil |
| NATS | 4222 | Message broker |
| Hasura | 6100 | GraphQL API untuk database |

---

## Alur Kerja Transaksi

### Step 1: Kirim pacs.008 (Initiation)
```
Bank mengirim permintaan transfer:
- Pengirim: Korban
- Penerima: Penipu  
- Jumlah: Rp 15.000.000
```

### Step 2: Kirim pacs.002 (Completion)
```
Konfirmasi transaksi berhasil (TxSts: ACCC)
Tazama mulai evaluasi
```

### Step 3: Event Director
```
Membaca Network Map → Menentukan rules mana yang aktif
Mengirim transaksi ke semua rule yang relevan
```

### Step 4: Rule Processors
```
Setiap rule mengevaluasi transaksi:
- Rule 901: Cek jumlah transaksi debtor
- Rule 902: Cek jumlah transaksi creditor
- Rule 903: Cek jumlah nominal (custom)

Output: subRuleRef (misal .01, .02, .03, .04)
```

### Step 5: Typology Processor
```
Mengumpulkan hasil semua rules
Menghitung skor berdasarkan weight/bobot
Contoh: Rule 903 return .04 → weight 500
```

### Step 6: TADP (Transaction Aggregation & Decision Processor)
```
Membandingkan skor dengan threshold:
- Skor < 200: NALT (No Alert)
- Skor >= 200: ALRT (Alert)
- Skor >= 400: Interdiction (Blokir)
```

### Step 7: Hasil
```
Disimpan di database evaluation
Status: NALT / ALRT
```

---

## Komponen Utama

### 1. Rule
Rule adalah logika deteksi individual. Setiap rule mengevaluasi satu aspek transaksi.

**Contoh Rule:**
- Rule 901: Menghitung jumlah transaksi keluar dari debtor
- Rule 902: Menghitung jumlah transaksi masuk ke creditor
- Rule 903: Mendeteksi transaksi dengan nominal besar

### 2. Typology
Typology adalah kombinasi beberapa rules dengan bobot (weight) masing-masing.

**Contoh:**
```
Typology "Large-Transaction-Alert":
  - Rule 903 dengan weight berbeda per band
  - alertThreshold: 200
  - interdictionThreshold: 400
```

### 3. Network Map
Network Map menentukan rules dan typologies mana yang aktif untuk jenis transaksi tertentu.

---

## Cara Membuat Rule

### Step 1: Buat Project Rule

```bash
# Clone template dari rule yang ada
cp -r rule-901 rule-903
cd rule-903
```

### Step 2: Edit package.json

```json
{
  "name": "@tazama-lf/rule-903",
  "version": "1.0.0",
  "description": "Rule 903 - Large Transaction Detection"
}
```

### Step 3: Buat Logic Rule (src/rule-903.ts)

```typescript
// Rule 903: Large Transaction Detection
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
  
  // 1. Cek exit condition (transaksi gagal)
  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    return { ...ruleRes, subRuleRef: '.x00', reason: 'Unsuccessful transaction' };
  }

  // 2. Ambil jumlah transaksi dari DataCache
  let amount = 0;
  if (req.DataCache?.instdAmt?.amt) {
    amount = req.DataCache.instdAmt.amt;
  }

  // 3. Evaluasi dengan bands dari config
  // determineOutcome akan cocokkan amount dengan bands
  return determineOutcome(amount, ruleConfig, ruleRes);
}
```

### Step 4: Build Docker Image

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build Docker image
docker build -t rule-903:local .
```

### Step 5: Buat docker-compose file

```yaml
# docker-compose.rule-903.yaml
services:
  rule-903:
    image: rule-903:local
    env_file:
      - env/rule-903.env
    environment:
      - CONFIGURATION_DATABASE_USER=postgres
      - CONFIGURATION_DATABASE_PASSWORD=unused
    networks:
      - tazama_default

networks:
  tazama_default:
    external: true
```

### Step 6: Buat Environment File

```bash
# env/rule-903.env
FUNCTION_NAME=rule-903-rel-1-0-0
RULE_VERSION="1.0.0"
RULE_NAME="903"
NODE_ENV=dev

# Database
CONFIGURATION_DATABASE=configuration
CONFIGURATION_DATABASE_HOST=postgres

# NATS
STARTUP_TYPE=nats
SERVER_URL=nats:4222
```

### Step 7: Deploy Rule

```bash
docker compose -f docker-compose.rule-903.yaml -p tazama up -d
```

---

## Cara Membuat Typology

Typology disimpan di database PostgreSQL, tabel `configuration.typology`.

### Struktur Typology

```json
{
  "id": "typology-processor@1.0.0",
  "cfg": "903-Large-Transaction",
  "typology_name": "Large-Transaction-Alert",
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
      "wghts": [
        {"ref": ".err", "wght": "0"},
        {"ref": "none", "wght": "0"}
      ]
    }
  ],
  "expression": ["Add", "v903at100at100"],
  "workflow": {
    "flowProcessor": "EFRuP@1.0.0",
    "alertThreshold": 200,
    "interdictionThreshold": 400
  }
}
```

### Penjelasan Field:

| Field | Keterangan |
|-------|------------|
| `id` | ID typology processor |
| `cfg` | Nama konfigurasi unik |
| `typology_name` | Nama deskriptif |
| `rules` | Array rules yang digunakan |
| `rules[].wghts` | Weight/bobot untuk setiap subRuleRef |
| `workflow.alertThreshold` | Skor minimum untuk alert |
| `workflow.interdictionThreshold` | Skor minimum untuk blokir |

### Insert Typology via SQL

```sql
INSERT INTO typology (configuration) VALUES ('{
  "id": "typology-processor@1.0.0",
  "cfg": "903-Large-Transaction",
  "typology_name": "Large-Transaction-Alert",
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
    }
  ],
  "expression": ["Add", "v903at100at100"],
  "workflow": {
    "flowProcessor": "EFRuP@1.0.0",
    "alertThreshold": 200,
    "interdictionThreshold": 400
  }
}'::jsonb);
```

---

## Cara Membuat Network Map

Network Map menentukan rules dan typologies mana yang aktif.

### Struktur Network Map

```json
{
  "cfg": "1.0.0",
  "name": "Public Network Map",
  "active": true,
  "tenantId": "DEFAULT",
  "messages": [
    {
      "id": "004@1.0.0",
      "cfg": "1.0.0",
      "txTp": "pacs.002.001.12",
      "typologies": [
        {
          "id": "typology-processor@1.0.0",
          "cfg": "999@1.0.0",
          "tenantId": "DEFAULT",
          "rules": [
            {"id": "EFRuP@1.0.0", "cfg": "none"},
            {"id": "901@1.0.0", "cfg": "1.0.0"},
            {"id": "902@1.0.0", "cfg": "1.0.0"}
          ]
        },
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
    }
  ]
}
```

### Penjelasan:

| Field | Keterangan |
|-------|------------|
| `messages` | Array jenis transaksi yang dimonitor |
| `messages[].txTp` | Tipe transaksi (pacs.002.001.12) |
| `typologies` | Array typology yang aktif |
| `typologies[].rules` | Rules yang digunakan typology |

### Update Network Map via SQL

```sql
UPDATE network_map SET configuration = '{
  "cfg": "1.0.0",
  "name": "Public Network Map",
  "active": true,
  "tenantId": "DEFAULT",
  "messages": [
    {
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
    }
  ]
}'::jsonb
WHERE tenantid = 'DEFAULT';
```

---

## Simulasi & Demo

### Menjalankan Demo

```bash
./demo-rule903.sh
```

### Kirim Transaksi Manual

#### Step 1: Kirim pacs.008

```bash
curl -X POST "http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10" \
  -H "Content-Type: application/json" \
  -d '{
    "TxTp": "pacs.008.001.10",
    "FIToFICstmrCdtTrf": {
      "GrpHdr": {
        "MsgId": "msg001",
        "CreDtTm": "2026-01-21T12:00:00.000Z",
        "NbOfTxs": 1,
        "SttlmInf": {"SttlmMtd": "CLRG"}
      },
      "CdtTrfTxInf": {
        "PmtId": {"InstrId": "instr001", "EndToEndId": "e2e001"},
        "IntrBkSttlmAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
        "InstdAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
        "Dbtr": {"Nm": "Korban"},
        "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC001"}]}},
        "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
        "Cdtr": {"Nm": "Penipu"},
        "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC002"}]}},
        "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
      },
      "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
      "RmtInf": {"Ustrd": "Transfer"}
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
      "GrpHdr": {"MsgId": "pacs002001", "CreDtTm": "2026-01-21T12:00:01.000Z"},
      "TxInfAndSts": {
        "OrgnlInstrId": "instr001",
        "OrgnlEndToEndId": "e2e001",
        "TxSts": "ACCC"
      }
    },
    "DataCache": {
      "instdAmt": {"amt": 15000000, "ccy": "IDR"}
    }
  }'
```

### Cek Hasil Evaluasi

```bash
# Via psql
docker exec tazama-postgres-1 psql -U postgres -d evaluation -c \
  "SELECT evaluation->'report'->>'status' as status FROM evaluation LIMIT 1;"

# Via Hasura
# Buka http://localhost:6100
# Password: password
```

### Hasil yang Diharapkan

| Jumlah | Rule Result | Weight | Status |
|--------|-------------|--------|--------|
| < 1 juta | .01 | 0 | NALT |
| 1-5 juta | .02 | 100 | NALT |
| 5-10 juta | .03 | 300 | ALRT |
| > 10 juta | .04 | 500 | ALRT (Interdiction) |

---

## Troubleshooting

### Error: function set_tenant_id does not exist

```sql
-- Jalankan di setiap database
CREATE OR REPLACE FUNCTION public.set_tenant_id(tenant_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql;
```

### Restart Processors Setelah Update Config

```bash
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1 tazama-rule-903-1
```

### Cek Log Container

```bash
docker logs tazama-rule-903-1 --tail 50
docker logs tazama-ed-1 --tail 50
```

---

## Referensi

- [Tazama GitHub](https://github.com/tazama-lf)
- [ISO 20022 Standard](https://www.iso20022.org/)
- [Full-Stack-Docker-Tazama](https://github.com/tazama-lf/Full-Stack-Docker-Tazama)
