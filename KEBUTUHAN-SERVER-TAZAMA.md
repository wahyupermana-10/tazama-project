# Kebutuhan Server untuk Tazama
## Dokumen Permintaan Infrastruktur

**Tanggal:** Februari 2026  
**Tujuan:** Permintaan server untuk sistem Tazama (Transaction Monitoring & Fraud Detection)

---

## 1. Ringkasan Eksekutif

Tazama adalah sistem **monitoring transaksi real-time** untuk mendeteksi fraud dan aktivitas mencurigakan. Sistem ini akan menerima data transaksi dari Kafka yang sudah ada, lalu menganalisis setiap transaksi berdasarkan aturan (rules) yang dikonfigurasi.

```mermaid
flowchart LR
    KAFKA[Kafka<br/>sudah ada] --> SERVER[Server Tazama<br/>yang diminta]
    SERVER --> ALERT[Alert Fraud]
    SERVER --> REPORT[Laporan]
    
    style SERVER fill:#ff9,stroke:#f00,stroke-width:3px
```

---

## 2. Kebutuhan Server

### 2.1 Pilihan Deployment

Terdapat 3 opsi deployment berdasarkan kebutuhan dan volume transaksi:

```mermaid
flowchart TB
    subgraph "OPSI A: POC/Pilot"
        A[1 Server<br/>Testing & Development]
    end
    
    subgraph "OPSI B: Production Small"
        B1[Server App]
        B2[Server Database]
    end
    
    subgraph "OPSI C: Production Medium/Large"
        C1[App Cluster<br/>3 servers]
        C2[DB Cluster<br/>2 servers]
        C3[Consumer<br/>2 servers]
    end
    
    style A fill:#9f9
    style B1 fill:#ff9
    style B2 fill:#ff9
    style C1 fill:#f99
    style C2 fill:#f99
    style C3 fill:#f99
```

---

### 2.2 OPSI A: POC / Pilot (1 Server)

**Cocok untuk:** Testing, development, pilot project, volume rendah

| Komponen | Spesifikasi Minimum | Rekomendasi |
|----------|---------------------|-------------|
| **Jumlah Server** | 1 | 1 |
| **CPU** | 8 vCPU | 8 vCPU |
| **RAM** | 16 GB | 32 GB |
| **Storage** | 100 GB SSD | 200 GB SSD |
| **Network** | 1 Gbps | 1 Gbps |
| **OS** | RHEL 9 | RHEL 9 |

**Kapasitas:** ~100-500 TPS | ~1-5 juta transaksi/hari

```mermaid
flowchart TB
    subgraph "1 Server - All in One"
        subgraph "Containers"
            KC[Kafka Consumer]
            TMS[Tazama Services]
            PG[(PostgreSQL)]
            VK[(Valkey)]
            NATS[NATS]
        end
    end
    
    KAFKA[Kafka Existing] --> KC
    KC --> TMS
    TMS <--> PG
    TMS <--> VK
    TMS <--> NATS
```

---

### 2.3 OPSI B: Production Small (2 Servers)

**Cocok untuk:** Production dengan volume sedang, membutuhkan pemisahan database

| Server | Fungsi | CPU | RAM | Storage | OS |
|--------|--------|-----|-----|---------|-----|
| **Server 1: Application** | Tazama + Consumer | 8 vCPU | 32 GB | 100 GB SSD | RHEL 9 |
| **Server 2: Database** | PostgreSQL + Valkey | 8 vCPU | 32 GB | 500 GB SSD | RHEL 9 |

**Total:** 2 servers | 16 vCPU | 64 GB RAM | 600 GB SSD

**Kapasitas:** ~500-2,000 TPS | ~5-20 juta transaksi/hari

```mermaid
flowchart TB
    subgraph "Server 1: Application"
        KC[Kafka Consumer]
        TMS[Tazama Services]
        NATS[NATS]
    end
    
    subgraph "Server 2: Database"
        PG[(PostgreSQL)]
        VK[(Valkey/Redis)]
    end
    
    KAFKA[Kafka Existing] --> KC
    KC --> TMS
    TMS <-->|Network| PG
    TMS <-->|Network| VK
    TMS <--> NATS
    
    style PG fill:#f9f
    style VK fill:#f9f
```

**Keuntungan pemisahan:**
- Database bisa di-backup tanpa ganggu aplikasi
- Performa lebih stabil
- Lebih mudah troubleshooting
- Database bisa di-scale terpisah

---

### 2.4 OPSI C: Production Medium/Large (5-7 Servers)

**Cocok untuk:** Production high-volume, butuh High Availability (HA), mission-critical

| Server | Qty | CPU | RAM | Storage | Fungsi |
|--------|-----|-----|-----|---------|--------|
| **App Server** | 3 | 8 vCPU | 32 GB | 100 GB SSD | Tazama Services (load balanced) |
| **DB Primary** | 1 | 8 vCPU | 64 GB | 1 TB SSD | PostgreSQL Primary |
| **DB Replica** | 1 | 8 vCPU | 64 GB | 1 TB SSD | PostgreSQL Replica (failover) |
| **Cache Cluster** | 2 | 4 vCPU | 16 GB | 50 GB SSD | Valkey/Redis Cluster |
| **Consumer** | 2 | 4 vCPU | 8 GB | 50 GB SSD | Kafka Consumer (HA) |

**Total:** 7 servers | 52 vCPU | 248 GB RAM | ~3.4 TB SSD

**Kapasitas:** ~2,000-10,000 TPS | ~20-100 juta transaksi/hari

```mermaid
flowchart TB
    subgraph "Load Balancer"
        LB[HAProxy/Nginx]
    end
    
    subgraph "Consumer Layer - 2 Servers"
        KC1[Consumer 1]
        KC2[Consumer 2]
    end
    
    subgraph "Application Layer - 3 Servers"
        APP1[Tazama App 1]
        APP2[Tazama App 2]
        APP3[Tazama App 3]
    end
    
    subgraph "Database Layer - 2 Servers"
        PG1[(PostgreSQL<br/>Primary)]
        PG2[(PostgreSQL<br/>Replica)]
    end
    
    subgraph "Cache Layer - 2 Servers"
        VK1[(Valkey 1)]
        VK2[(Valkey 2)]
    end
    
    KAFKA[Kafka] --> KC1
    KAFKA --> KC2
    KC1 --> LB
    KC2 --> LB
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 <--> PG1
    APP2 <--> PG1
    APP3 <--> PG1
    PG1 -->|Replication| PG2
    
    APP1 <--> VK1
    APP2 <--> VK1
    APP3 <--> VK2
    VK1 <-->|Sync| VK2
    
    style PG1 fill:#9f9
    style PG2 fill:#ff9
```

**Fitur High Availability:**
- Load balancer untuk distribusi traffic
- Database replication untuk failover
- Multiple consumer untuk redundancy
- Cache cluster untuk performa

---

### 2.5 Perbandingan Opsi

```mermaid
flowchart LR
    subgraph "Pilih Berdasarkan Kebutuhan"
        Q1{Volume<br/>Transaksi?}
        
        Q1 -->|< 5 juta/hari| A[OPSI A<br/>1 Server]
        Q1 -->|5-20 juta/hari| B[OPSI B<br/>2 Servers]
        Q1 -->|lebih 20 juta/hari| C[OPSI C<br/>5-7 Servers]
    end
    
    style A fill:#9f9
    style B fill:#ff9
    style C fill:#f99
```

| Aspek | OPSI A (POC) | OPSI B (Prod Small) | OPSI C (Prod Large) |
|-------|--------------|---------------------|---------------------|
| **Jumlah Server** | 1 | 2 | 5-7 |
| **Total vCPU** | 8 | 16 | 52 |
| **Total RAM** | 16-32 GB | 64 GB | 248 GB |
| **Total Storage** | 100-200 GB | 600 GB | ~3.4 TB |
| **Kapasitas TPS** | 100-500 | 500-2,000 | 2,000-10,000 |
| **Transaksi/hari** | 1-5 juta | 5-20 juta | 20-100 juta |
| **High Availability** | ❌ | ❌ | ✅ |
| **DB Failover** | ❌ | ❌ | ✅ |
| **Estimasi Biaya** | $ | $$ | $$$$ |
| **Cocok untuk** | Testing, Pilot | Production kecil-sedang | Production besar |

---

### 2.6 Rekomendasi Berdasarkan Tahap

```mermaid
flowchart TB
    subgraph "Tahap 1: POC"
        T1[Mulai dengan OPSI A<br/>1 Server]
    end
    
    subgraph "Tahap 2: Pilot Production"
        T2[Upgrade ke OPSI B<br/>2 Servers]
    end
    
    subgraph "Tahap 3: Full Production"
        T3[Scale ke OPSI C<br/>5-7 Servers]
    end
    
    T1 -->|Setelah testing OK| T2
    T2 -->|Volume meningkat| T3
    
    style T1 fill:#9f9
    style T2 fill:#ff9
    style T3 fill:#f99
```

**Strategi yang disarankan:**
1. **Mulai dengan OPSI A** untuk POC dan testing
2. **Upgrade ke OPSI B** saat masuk production
3. **Scale ke OPSI C** jika volume transaksi meningkat signifikan

---

### 2.7 Visualisasi Kebutuhan Resource (OPSI A)

```mermaid
pie title Distribusi RAM (16 GB)
    "PostgreSQL (Database)" : 4
    "Valkey/Redis (Cache)" : 2
    "NATS (Message Queue)" : 1
    "Tazama Processors" : 6
    "Kafka Consumer" : 1
    "OS & Buffer" : 2
```

```mermaid
pie title Distribusi Storage (100 GB)
    "PostgreSQL Data" : 50
    "Docker Images" : 20
    "Logs" : 15
    "OS & System" : 15
```

---

## 3. Sistem Operasi: RHEL 9

### 3.1 Kenapa RHEL 9?

| Alasan | Penjelasan |
|--------|------------|
| **Standar Perusahaan** | Sesuai dengan standar OS yang digunakan |
| **Support Enterprise** | Ada dukungan resmi dari Red Hat |
| **Keamanan** | SELinux built-in untuk keamanan tambahan |
| **Stabilitas** | Cocok untuk sistem production banking |
| **Compliance** | Memenuhi standar regulasi keuangan |

### 3.2 Software yang Perlu Diinstall

Setelah server ready, tim akan menginstall software berikut:

```mermaid
flowchart TB
    subgraph "Layer 1: OS"
        RHEL[RHEL 9]
    end
    
    subgraph "Layer 2: Container Runtime"
        DOCKER[Docker CE<br/>atau Podman]
    end
    
    subgraph "Layer 3: Aplikasi dalam Container"
        PG[(PostgreSQL)]
        VK[(Valkey/Redis)]
        NATS[NATS]
        TMS[Tazama Services]
        KC[Kafka Consumer]
    end
    
    RHEL --> DOCKER
    DOCKER --> PG
    DOCKER --> VK
    DOCKER --> NATS
    DOCKER --> TMS
    DOCKER --> KC
```

| Software | Versi | Fungsi | Diinstall oleh |
|----------|-------|--------|----------------|
| RHEL | 9.x | Sistem Operasi | Tim Infrastruktur |
| Docker CE / Podman | Latest | Container runtime | Tim Infrastruktur |
| Docker Compose | Latest | Orchestration | Tim Infrastruktur |
| PostgreSQL | 18 | Database (dalam container) | Tim Aplikasi |
| Valkey | 7.x | Cache (dalam container) | Tim Aplikasi |
| NATS | 2.x | Message queue (dalam container) | Tim Aplikasi |
| Tazama | 3.x | Fraud detection (dalam container) | Tim Aplikasi |

---

## 4. Kebutuhan Network

### 4.1 Konektivitas yang Diperlukan

```mermaid
flowchart TB
    subgraph "Network Existing"
        KAFKA[Kafka Cluster<br/>Port 9092]
    end
    
    subgraph "Server Tazama yang Diminta"
        KC[Kafka Consumer]
        TMS[Tazama Services]
        DB[(Database)]
    end
    
    subgraph "Output"
        ALERT[Alert System]
        SIEM[SIEM/Splunk<br/>jika diperlukan]
    end
    
    KAFKA <-->|Port 9092| KC
    KC --> TMS
    TMS --> DB
    TMS -->|Optional| ALERT
    TMS -->|Optional| SIEM
```

### 4.2 Port yang Perlu Dibuka

| Port | Protokol | Arah | Tujuan |
|------|----------|------|--------|
| **9092** | TCP | Outbound | Koneksi ke Kafka cluster |
| **5000** | TCP | Internal | Tazama API (dalam server) |
| **5432** | TCP | Internal | PostgreSQL (dalam server) |
| **6379** | TCP | Internal | Valkey/Redis (dalam server) |
| **4222** | TCP | Internal | NATS (dalam server) |
| **22** | TCP | Inbound | SSH untuk administrasi |

### 4.3 Firewall Rules yang Diperlukan

```
# Outbound ke Kafka (WAJIB)
Server Tazama → Kafka Cluster : Port 9092

# Inbound untuk administrasi
Admin Network → Server Tazama : Port 22 (SSH)

# Optional: Jika perlu akses dari luar
Load Balancer → Server Tazama : Port 5000 (API)
```

---

## 5. Kapasitas & Performa

### 5.1 Estimasi Kapasitas

Dengan spesifikasi yang diminta, server dapat menangani:

| Metrik | Kapasitas |
|--------|-----------|
| **Transaksi per detik (TPS)** | 100 - 500 TPS |
| **Transaksi per hari** | ~1 - 5 juta transaksi |
| **Data retention** | 90 hari (configurable) |
| **Response time** | < 100ms per transaksi |

### 5.2 Skenario Beban

```mermaid
flowchart LR
    subgraph "Volume Rendah"
        L1[< 100K txn/hari]
        L2[Server ini CUKUP]
    end
    
    subgraph "Volume Sedang"
        M1[100K - 1M txn/hari]
        M2[Server ini CUKUP]
    end
    
    subgraph "Volume Tinggi"
        H1[lebih dari 5M txn/hari]
        H2[Perlu scale up<br/>atau tambah server]
    end
    
    L1 --> L2
    M1 --> M2
    H1 --> H2
    
    style L2 fill:#9f9
    style M2 fill:#9f9
    style H2 fill:#ff9
```

---

## 6. Timeline & Tahapan

### 6.1 Timeline Implementasi

```mermaid
gantt
    title Timeline Implementasi Tazama
    dateFormat  YYYY-MM-DD
    
    section Infrastruktur
    Provisioning Server      :a1, 2026-02-15, 5d
    Install OS & Docker      :a2, after a1, 2d
    Konfigurasi Network      :a3, after a2, 2d
    
    section Aplikasi
    Deploy Tazama            :b1, after a3, 3d
    Konfigurasi Rules        :b2, after b1, 3d
    
    section Testing
    Testing Internal         :c1, after b2, 5d
    UAT                      :c2, after c1, 5d
    
    section Go Live
    Production               :milestone, after c2, 0d
```

---

## 7. Pertimbangan Keamanan

### 7.1 Keamanan yang Sudah Built-in

```mermaid
flowchart TB
    subgraph "Security Layers"
        S1[RHEL 9 + SELinux]
        S2[Docker Container Isolation]
        S3[Internal Network Only]
        S4[No Direct Internet Access]
    end
    
    S1 --> S2 --> S3 --> S4
```

| Aspek | Implementasi |
|-------|--------------|
| **OS Security** | RHEL 9 dengan SELinux enabled |
| **Container Isolation** | Setiap komponen dalam container terpisah |
| **Network** | Hanya koneksi internal, tidak perlu internet |
| **Data** | Semua data tersimpan dalam server |
| **Access** | SSH dengan key-based authentication |

### 7.2 Data yang Diproses

| Jenis Data | Perlakuan |
|------------|-----------|
| Data transaksi | Diproses real-time, disimpan untuk audit |
| Hasil evaluasi | Disimpan di PostgreSQL internal |
| Alert | Dikirim ke sistem alert existing |

---

## 8. Ringkasan Permintaan

### 8.1 Opsi yang Tersedia

```mermaid
flowchart TB
    subgraph "Pilih Salah Satu"
        A[OPSI A: POC<br/>1 Server<br/>8 vCPU, 32GB, 200GB]
        B[OPSI B: Prod Small<br/>2 Servers<br/>16 vCPU, 64GB, 600GB]
        C[OPSI C: Prod Large<br/>5-7 Servers<br/>52 vCPU, 248GB, 3.4TB]
    end
    
    style A fill:#9f9
    style B fill:#ff9
    style C fill:#f99
```

### 8.2 Checklist Permintaan - OPSI A (POC)

| No | Item | Spesifikasi | Status |
|----|------|-------------|--------|
| 1 | Server | 1x (8 vCPU, 32GB RAM, 200GB SSD) | ⏳ Pending |
| 2 | OS | RHEL 9.x | ⏳ Pending |
| 3 | Docker | Docker CE atau Podman + Compose | ⏳ Pending |
| 4 | Network | Akses ke Kafka (port 9092) | ⏳ Pending |
| 5 | Firewall | Port 9092 outbound, 22 inbound | ⏳ Pending |
| 6 | SSH Access | Key-based untuk tim aplikasi | ⏳ Pending |

### 8.3 Checklist Permintaan - OPSI B (Production Small)

| No | Item | Spesifikasi | Status |
|----|------|-------------|--------|
| 1 | Server App | 1x (8 vCPU, 32GB RAM, 100GB SSD) | ⏳ Pending |
| 2 | Server DB | 1x (8 vCPU, 32GB RAM, 500GB SSD) | ⏳ Pending |
| 3 | OS | RHEL 9.x (kedua server) | ⏳ Pending |
| 4 | Docker | Docker CE atau Podman + Compose | ⏳ Pending |
| 5 | Network Internal | Koneksi antar 2 server (low latency) | ⏳ Pending |
| 6 | Network External | Akses ke Kafka (port 9092) | ⏳ Pending |
| 7 | Firewall | Sesuai tabel port | ⏳ Pending |
| 8 | SSH Access | Key-based untuk tim aplikasi | ⏳ Pending |

### 8.4 Checklist Permintaan - OPSI C (Production Large)

| No | Item | Spesifikasi | Status |
|----|------|-------------|--------|
| 1 | App Servers | 3x (8 vCPU, 32GB RAM, 100GB SSD) | ⏳ Pending |
| 2 | DB Primary | 1x (8 vCPU, 64GB RAM, 1TB SSD) | ⏳ Pending |
| 3 | DB Replica | 1x (8 vCPU, 64GB RAM, 1TB SSD) | ⏳ Pending |
| 4 | Cache Servers | 2x (4 vCPU, 16GB RAM, 50GB SSD) | ⏳ Pending |
| 5 | Consumer Servers | 2x (4 vCPU, 8GB RAM, 50GB SSD) | ⏳ Pending |
| 6 | Load Balancer | 1x (atau gunakan existing) | ⏳ Pending |
| 7 | OS | RHEL 9.x (semua server) | ⏳ Pending |
| 8 | Docker | Docker CE atau Podman + Compose | ⏳ Pending |
| 9 | Network Internal | Private network antar server | ⏳ Pending |
| 10 | Network External | Akses ke Kafka (port 9092) | ⏳ Pending |
| 11 | Firewall | Sesuai tabel port | ⏳ Pending |
| 12 | SSH Access | Key-based untuk tim aplikasi | ⏳ Pending |

### 8.5 Tabel Ringkasan Semua Opsi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RINGKASAN SPESIFIKASI SERVER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPSI A - POC/PILOT (1 Server)                                              │
│  ├── Server    : 1 unit                                                     │
│  ├── CPU       : 8 vCPU                                                     │
│  ├── RAM       : 32 GB                                                      │
│  ├── Storage   : 200 GB SSD                                                 │
│  ├── OS        : RHEL 9                                                     │
│  └── Kapasitas : ~500 TPS / ~5 juta txn per hari                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPSI B - PRODUCTION SMALL (2 Servers)                                      │
│  ├── Server 1 (App)  : 8 vCPU, 32 GB RAM, 100 GB SSD                       │
│  ├── Server 2 (DB)   : 8 vCPU, 32 GB RAM, 500 GB SSD                       │
│  ├── Total           : 16 vCPU, 64 GB RAM, 600 GB SSD                      │
│  ├── OS              : RHEL 9 (kedua server)                               │
│  └── Kapasitas       : ~2,000 TPS / ~20 juta txn per hari                  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPSI C - PRODUCTION LARGE (5-7 Servers)                                    │
│  ├── App Servers     : 3x (8 vCPU, 32 GB, 100 GB SSD)                      │
│  ├── DB Primary      : 1x (8 vCPU, 64 GB, 1 TB SSD)                        │
│  ├── DB Replica      : 1x (8 vCPU, 64 GB, 1 TB SSD)                        │
│  ├── Cache Servers   : 2x (4 vCPU, 16 GB, 50 GB SSD)                       │
│  ├── Consumer        : 2x (4 vCPU, 8 GB, 50 GB SSD)                        │
│  ├── Total           : 52 vCPU, 248 GB RAM, ~3.4 TB SSD                    │
│  ├── OS              : RHEL 9 (semua server)                               │
│  └── Kapasitas       : ~10,000 TPS / ~100 juta txn per hari                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.6 Yang Dibutuhkan dari Tim Infrastruktur

```mermaid
flowchart TB
    subgraph "✅ Permintaan ke Infrastruktur"
        R1[Server sesuai opsi yang dipilih]
        R2[RHEL 9 terinstall]
        R3[Docker CE atau Podman]
        R4[Koneksi network ke Kafka]
        R5[Firewall rules configured]
        R6[Network internal antar server<br/>jika multi-server]
    end
    
    R1 --> R2 --> R3 --> R4 --> R5 --> R6
```

---

## 9. Kontak & Eskalasi

| Role | Nama | Untuk |
|------|------|-------|
| **Requestor** | [Nama Tim Aplikasi] | Pertanyaan teknis aplikasi |
| **Infrastruktur** | [Nama Tim Infra] | Provisioning & network |
| **Approval** | [Nama Manager] | Approval resource |

---

## 10. Lampiran

### 10.1 Arsitektur Sistem Lengkap

```mermaid
flowchart TB
    subgraph "Existing Infrastructure"
        CB[Core Banking]
        KAFKA[Kafka Cluster]
    end
    
    subgraph "Server yang Diminta"
        subgraph "Container: Kafka Consumer"
            KC[Kafka Consumer Service]
        end
        
        subgraph "Container: Tazama Core"
            TMS[TMS API]
            ED[Event Director]
            RP[Rule Processors]
            TP[Typology Processor]
            TADP[TADP]
        end
        
        subgraph "Container: Infrastructure"
            PG[(PostgreSQL)]
            VK[(Valkey)]
            NATS[NATS]
        end
    end
    
    subgraph "Output"
        ALERT[Alert System]
        REPORT[Reporting]
    end
    
    CB --> KAFKA
    KAFKA --> KC
    KC --> TMS
    TMS --> ED
    ED --> RP
    RP --> TP
    TP --> TADP
    
    ED <--> PG
    ED <--> VK
    ED <--> NATS
    
    TADP --> ALERT
    PG --> REPORT
    
    style KC fill:#ff9
    style TMS fill:#9cf
    style PG fill:#f9f
```

### 10.2 Referensi

- Tazama Official: https://github.com/tazama-lf
- RHEL 9 Documentation: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9
- Docker on RHEL: https://docs.docker.com/engine/install/rhel/

---

**Dokumen ini dibuat untuk keperluan permintaan infrastruktur.**  
**Versi: 1.0 | Tanggal: Februari 2026**
