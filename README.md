# Tazama Project - Transaction Monitoring & Fraud Detection

Project ini berisi setup lengkap Tazama termasuk custom rules, demo UI, konfigurasi, dan dokumentasi.

## Quick Start

### macOS / Linux
```bash
cd Full-Stack-Docker-Tazama-dev
./tazama.sh
```

### Windows
```powershell
cd Full-Stack-Docker-Tazama-dev
tazama.bat
```

Lihat [SETUP-WINDOWS.md](SETUP-WINDOWS.md) untuk panduan lengkap setup di Windows.

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [SETUP-WINDOWS.md](SETUP-WINDOWS.md) | Panduan setup di Windows |
| [DOKUMENTASI-TAZAMA.md](DOKUMENTASI-TAZAMA.md) | Dokumentasi lengkap membuat custom rules |
| [TUTORIAL-INSTALASI-TAZAMA.md](TUTORIAL-INSTALASI-TAZAMA.md) | Tutorial instalasi |
| [TAZAMA-PANDUAN-SEDERHANA.md](TAZAMA-PANDUAN-SEDERHANA.md) | Panduan sederhana |
| [PANDUAN-TAZAMA-UNTUK-MANAJEMEN.md](PANDUAN-TAZAMA-UNTUK-MANAJEMEN.md) | Panduan untuk manajemen |
| [POSTMAN-DEMO-GUIDE.md](POSTMAN-DEMO-GUIDE.md) | Panduan demo Postman |
| [INTEGRASI-KAFKA-TAZAMA.md](INTEGRASI-KAFKA-TAZAMA.md) | Integrasi Kafka |
| [KEBUTUHAN-SERVER-TAZAMA.md](KEBUTUHAN-SERVER-TAZAMA.md) | Kebutuhan server & infrastruktur |
| [INFRASTRUKTUR-TAZAMA-BANK-GRADE.md](INFRASTRUKTUR-TAZAMA-BANK-GRADE.md) | Spek infrastruktur bank-grade |

## Komponen

- `Full-Stack-Docker-Tazama-dev/` - Docker compose untuk deploy Tazama
- `demo-ui/` - Demo UI (HTML)
- `configs/` - Konfigurasi custom rules
- `postman/` - Postman collections untuk testing
- `rule-903/` - Custom rule: Large Transaction Detection
- `rule-904/` - Custom rule: Rapid Transaction Detection
- `rule-907-example/` - Contoh rule tambahan
- `rule-executer-903/` - Rule executer untuk rule 903
- `rule-executer-904/` - Rule executer untuk rule 904
- `rule-builder/` - Rule builder UI
- `tazama-libs/` - Tazama libraries

## Demo Scripts

```bash
bash demo-rule903.sh          # Demo large transaction
bash demo-rule904.sh          # Demo rapid transaction
bash demo-large-transaction.sh # Demo large amount
bash test-rapid.sh            # Test rapid transactions
```
