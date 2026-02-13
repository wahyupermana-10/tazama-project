# Panduan Lengkap Membuat Rule Baru di Tazama

## Masalah Utama

Untuk membuat rule baru di Tazama, kita butuh:
1. **GitHub Token** dengan akses ke `@tazama-lf` npm packages (private)
2. **Build dari source code** - tidak bisa hanya ubah config

## Struktur Rule Processor

```
rule-executer/          # Framework (handle NATS, DB, dll)
├── src/
│   ├── index.ts        # Entry point
│   └── controllers/
│       └── execute.ts  # Memanggil handleTransaction dari rule
│
rule-XXX/               # Logika rule spesifik
├── src/
│   ├── index.ts        # Export handleTransaction
│   └── rule-XXX.ts     # Logika pengecekan
```

Rule-executer mengimport rule sebagai npm dependency:
```json
"rule": "npm:@tazama-lf/rule-901@3.0.1-rc.0"
```

## Cara Membuat Rule Baru (Lengkap)

### Langkah 1: Setup GitHub Token

```bash
# Buat Personal Access Token di GitHub dengan scope:
# - read:packages
# - repo (jika perlu akses private repo)

export GH_TOKEN=ghp_xxxxxxxxxxxx

# Buat .npmrc
echo "@tazama-lf:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_TOKEN}" > ~/.npmrc
```

### Langkah 2: Clone Repositories

```bash
git clone https://github.com/tazama-lf/rule-executer
git clone https://github.com/tazama-lf/rule-901  # sebagai template
```

### Langkah 3: Buat Rule Baru

```bash
cp -r rule-901 rule-903
cd rule-903

# Edit src/rule-903.ts dengan logika baru
# Edit package.json - ubah nama dan versi
```

### Langkah 4: Publish Rule Package (opsional)

```bash
cd rule-903
npm publish  # ke GitHub Packages atau npm registry lokal
```

### Langkah 5: Build Rule Executer dengan Rule Baru

```bash
cd rule-executer

# Edit package.json
# Ubah: "rule": "npm:@tazama-lf/rule-901@x.x.x"
# Jadi: "rule": "file:../rule-903" atau "npm:@your-org/rule-903@1.0.0"

npm install
npm run build
```

### Langkah 6: Build Docker Image

```bash
docker build -t my-rule-903:latest .
```

### Langkah 7: Deploy

Tambahkan ke docker-compose:

```yaml
# docker-compose.custom-rules.yaml
services:
  rule-903:
    image: my-rule-903:latest
    env_file:
      - env/rule-903.env
    environment:
      - RULE_NAME=903
      - RULE_VERSION=1.0.0
      - FUNCTION_NAME=rule-903-rel-1-0-0
    depends_on:
      - valkey
      - postgres
```

### Langkah 8: Tambah Konfigurasi Rule

```bash
curl -X POST http://localhost:5100/v1/admin/configuration/rule \
  -H "Content-Type: application/json" \
  -d '{
    "id": "903@1.0.0",
    "cfg": "1.0.0",
    "tenantId": "DEFAULT",
    "desc": "Large Transaction Detection",
    "config": {
      "exitConditions": [
        {"subRuleRef": ".x00", "reason": "Transaction unsuccessful"}
      ],
      "bands": [
        {"subRuleRef": ".01", "upperLimit": 1000000, "reason": "Normal transaction"},
        {"subRuleRef": ".02", "lowerLimit": 1000000, "upperLimit": 10000000, "reason": "Large transaction"},
        {"subRuleRef": ".03", "lowerLimit": 10000000, "reason": "Very large transaction - suspicious"}
      ]
    }
  }'
```

### Langkah 9: Update Network Map

```bash
curl -X POST http://localhost:5100/v1/admin/configuration/network_map \
  -H "Content-Type: application/json" \
  -d '{
    "active": true,
    "cfg": "custom@1.0.0",
    "tenantId": "DEFAULT",
    "messages": [{
      "id": "004@1.0.0",
      "cfg": "1.0.0", 
      "txTp": "pacs.002.001.12",
      "typologies": [{
        "id": "typology-processor@1.0.0",
        "cfg": "custom@1.0.0",
        "rules": [
          {"id": "903@1.0.0", "cfg": "1.0.0"},
          {"id": "EFRuP@1.0.0", "cfg": "none"}
        ]
      }]
    }]
  }'
```

### Langkah 10: Restart Processors

```bash
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1
```

## Contoh Logika Rule

### Rule 903 - Large Transaction Detection

```typescript
// rule-903.ts
export async function handleTransaction(
  req: RuleRequest,
  determineOutcome: Function,
  ruleRes: RuleResult,
  loggerService: LoggerService,
  ruleConfig: RuleConfig,
  databaseManager: DatabaseManagerInstance,
): Promise<RuleResult> {
  
  // Cek transaksi sukses
  if (req.transaction.FIToFIPmtSts?.TxInfAndSts?.TxSts !== 'ACCC') {
    return { ...ruleRes, subRuleRef: '.x00', reason: 'Transaction unsuccessful' };
  }

  // Ambil jumlah transaksi
  const amount = Number(req.DataCache?.amt || 0);

  // determineOutcome akan cocokkan amount dengan bands di config
  // dan return hasil yang sesuai
  return determineOutcome(amount, ruleConfig, ruleRes);
}
```

## Kesimpulan

Membuat rule baru di Tazama membutuhkan:
1. Akses ke GitHub Packages (GH_TOKEN)
2. Pengetahuan TypeScript
3. Pemahaman arsitektur Tazama
4. Build dan deploy Docker image

Ini bukan proses yang bisa dilakukan hanya dengan konfigurasi JSON.
