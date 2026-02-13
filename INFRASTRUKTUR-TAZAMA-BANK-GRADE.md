# Infrastruktur Tazama untuk Standar Perbankan
## Rekomendasi Arsitektur Production-Ready

---

## Pendahuluan

Dokumen ini menjelaskan kebutuhan infrastruktur untuk menjalankan sistem Tazama dengan standar yang layak untuk industri perbankan. Infrastruktur ini dirancang untuk memenuhi kebutuhan ketersediaan tinggi (high availability), keamanan, skalabilitas, dan kepatuhan regulasi.

---

## Arsitektur Umum

```mermaid
flowchart TB
    subgraph INTERNET["Internet / Jaringan Eksternal"]
        CLIENT["Sistem Core Banking"]
    end
    
    subgraph DMZ["DMZ (Demilitarized Zone)"]
        WAF["Web Application Firewall"]
        LB["Load Balancer<br/>(Primary + Standby)"]
    end
    
    subgraph INTERNAL["Jaringan Internal Bank"]
        subgraph KUBERNETES["Kubernetes Cluster"]
            subgraph APP["Application Layer"]
                TMS1["TMS Pod 1"]
                TMS2["TMS Pod 2"]
                TMS3["TMS Pod 3"]
                ED1["Event Director 1"]
                ED2["Event Director 2"]
                RULES["Rule Processors<br/>(Auto-scaling)"]
                TP1["Typology Processor 1"]
                TP2["Typology Processor 2"]
                TADP1["TADP 1"]
                TADP2["TADP 2"]
            end
        end
        
        subgraph DATA["Data Layer"]
            subgraph PGCLUSTER["PostgreSQL Cluster"]
                PG_PRIMARY["PostgreSQL Primary"]
                PG_STANDBY1["PostgreSQL Standby 1"]
                PG_STANDBY2["PostgreSQL Standby 2"]
            end
            
            subgraph NATSCLUSTER["NATS Cluster"]
                NATS1["NATS Node 1"]
                NATS2["NATS Node 2"]
                NATS3["NATS Node 3"]
            end
            
            subgraph CACHE["Cache Cluster"]
                REDIS1["Redis/Valkey Primary"]
                REDIS2["Redis/Valkey Replica 1"]
                REDIS3["Redis/Valkey Replica 2"]
            end
        end
        
        subgraph MONITORING["Monitoring & Logging"]
            PROMETHEUS["Prometheus"]
            GRAFANA["Grafana"]
            ELK["ELK Stack<br/>(Elasticsearch, Logstash, Kibana)"]
            ALERTMANAGER["Alert Manager"]
        end
    end
    
    subgraph DR["Disaster Recovery Site"]
        DR_CLUSTER["Kubernetes Cluster<br/>(Standby)"]
        DR_DB["PostgreSQL<br/>(Async Replica)"]
    end
    
    CLIENT --> WAF
    WAF --> LB
    LB --> TMS1 & TMS2 & TMS3
    
    PG_PRIMARY -.->|Replication| PG_STANDBY1 & PG_STANDBY2
    PG_PRIMARY -.->|Async Replication| DR_DB
    
    NATS1 <--> NATS2 <--> NATS3
    REDIS1 -.->|Replication| REDIS2 & REDIS3
```

---

## Spesifikasi Server

### Environment Production

#### Kubernetes Worker Nodes (Application Layer)

| Komponen | Jumlah | CPU | RAM | Storage | Keterangan |
|----------|--------|-----|-----|---------|------------|
| Worker Node | 6 minimum | 16 vCPU | 64 GB | 500 GB SSD | Untuk menjalankan pods aplikasi |
| Master Node | 3 | 8 vCPU | 32 GB | 200 GB SSD | Control plane Kubernetes |

#### Database Servers

| Komponen | Jumlah | CPU | RAM | Storage | Keterangan |
|----------|--------|-----|-----|---------|------------|
| PostgreSQL Primary | 1 | 16 vCPU | 128 GB | 2 TB NVMe SSD | Database utama |
| PostgreSQL Standby | 2 | 16 vCPU | 128 GB | 2 TB NVMe SSD | Synchronous replication |
| PostgreSQL DR | 1 | 16 vCPU | 128 GB | 2 TB NVMe SSD | Di site DR, async replication |

#### Message Queue & Cache

| Komponen | Jumlah | CPU | RAM | Storage | Keterangan |
|----------|--------|-----|-----|---------|------------|
| NATS Server | 3 | 8 vCPU | 32 GB | 200 GB SSD | Clustered untuk HA |
| Redis/Valkey | 3 | 8 vCPU | 64 GB | 200 GB SSD | Primary + 2 Replica |

#### Infrastructure Services

| Komponen | Jumlah | CPU | RAM | Storage | Keterangan |
|----------|--------|-----|-----|---------|------------|
| Load Balancer | 2 | 4 vCPU | 16 GB | 100 GB SSD | Active-Passive |
| WAF | 2 | 8 vCPU | 32 GB | 200 GB SSD | Active-Passive |
| Monitoring Stack | 3 | 8 vCPU | 64 GB | 1 TB SSD | Prometheus, Grafana, ELK |
| Bastion Host | 2 | 4 vCPU | 8 GB | 100 GB SSD | Untuk akses administrasi |

---

## Estimasi Kapasitas Berdasarkan Volume Transaksi

### Skenario: 1 Juta Transaksi per Hari

```mermaid
flowchart LR
    subgraph INPUT["Input"]
        TRX["1 Juta Transaksi/Hari<br/>≈ 12 TPS rata-rata<br/>≈ 50 TPS peak"]
    end
    
    subgraph SIZING["Kebutuhan Minimum"]
        APP["Application Pods:<br/>TMS: 3 replicas<br/>ED: 2 replicas<br/>Rules: 4-8 replicas<br/>TP: 2 replicas<br/>TADP: 2 replicas"]
        
        DB["Database:<br/>PostgreSQL 128GB RAM<br/>Storage: 500GB/bulan growth"]
        
        CACHE["Cache:<br/>Redis 32GB RAM<br/>NATS 16GB RAM"]
    end
    
    INPUT --> SIZING
```

### Skenario: 10 Juta Transaksi per Hari

```mermaid
flowchart LR
    subgraph INPUT["Input"]
        TRX["10 Juta Transaksi/Hari<br/>≈ 120 TPS rata-rata<br/>≈ 500 TPS peak"]
    end
    
    subgraph SIZING["Kebutuhan Minimum"]
        APP["Application Pods:<br/>TMS: 6 replicas<br/>ED: 4 replicas<br/>Rules: 12-20 replicas<br/>TP: 4 replicas<br/>TADP: 4 replicas"]
        
        DB["Database:<br/>PostgreSQL 256GB RAM<br/>Storage: 2TB/bulan growth<br/>Read Replicas: 2"]
        
        CACHE["Cache:<br/>Redis 64GB RAM<br/>NATS 32GB RAM"]
    end
    
    INPUT --> SIZING
```

---

## Arsitektur Jaringan

```mermaid
flowchart TB
    subgraph EXTERNAL["Zona Eksternal"]
        CORE["Core Banking System"]
    end
    
    subgraph DMZ["DMZ - 10.0.1.0/24"]
        FW1["Firewall Eksternal"]
        WAF["WAF"]
        LB["Load Balancer"]
    end
    
    subgraph APP_ZONE["Zona Aplikasi - 10.0.2.0/24"]
        FW2["Firewall Internal"]
        K8S["Kubernetes Cluster<br/>(Tazama Applications)"]
    end
    
    subgraph DATA_ZONE["Zona Data - 10.0.3.0/24"]
        FW3["Firewall Database"]
        DB["PostgreSQL Cluster"]
        MQ["NATS Cluster"]
        CACHE["Redis Cluster"]
    end
    
    subgraph MGMT_ZONE["Zona Management - 10.0.4.0/24"]
        BASTION["Bastion Host"]
        MONITOR["Monitoring Stack"]
        BACKUP["Backup Server"]
    end
    
    CORE -->|HTTPS 443| FW1
    FW1 --> WAF --> LB
    LB -->|HTTP 5000| FW2
    FW2 --> K8S
    K8S -->|5432, 4222, 6379| FW3
    FW3 --> DB & MQ & CACHE
    
    BASTION -.->|SSH 22| K8S & DB & MQ & CACHE
    MONITOR -.->|Metrics| K8S & DB & MQ & CACHE
```

### Segmentasi Jaringan

| Zona | CIDR | Fungsi | Akses |
|------|------|--------|-------|
| DMZ | 10.0.1.0/24 | Load Balancer, WAF | Dari internet (terbatas) |
| Aplikasi | 10.0.2.0/24 | Kubernetes cluster | Dari DMZ saja |
| Data | 10.0.3.0/24 | Database, Message Queue, Cache | Dari zona aplikasi saja |
| Management | 10.0.4.0/24 | Monitoring, Bastion, Backup | Dari internal network |

---

## Keamanan

### Komponen Keamanan yang Dibutuhkan

```mermaid
flowchart TB
    subgraph PERIMETER["Keamanan Perimeter"]
        WAF["Web Application Firewall<br/>- OWASP Top 10 Protection<br/>- Rate Limiting<br/>- DDoS Protection"]
        FW["Next-Gen Firewall<br/>- Stateful Inspection<br/>- IPS/IDS<br/>- Application Control"]
    end
    
    subgraph NETWORK["Keamanan Jaringan"]
        SEG["Network Segmentation<br/>- VLAN/Subnet Isolation<br/>- Micro-segmentation"]
        TLS["Enkripsi Transit<br/>- TLS 1.3 untuk semua komunikasi<br/>- mTLS antar service"]
    end
    
    subgraph DATA["Keamanan Data"]
        ENC["Enkripsi Data<br/>- At-rest encryption (AES-256)<br/>- Database TDE"]
        MASK["Data Masking<br/>- PII Protection<br/>- Tokenization"]
    end
    
    subgraph ACCESS["Kontrol Akses"]
        IAM["Identity & Access Management<br/>- RBAC<br/>- MFA<br/>- SSO Integration"]
        PAM["Privileged Access Management<br/>- Session Recording<br/>- Just-in-time Access"]
    end
    
    subgraph AUDIT["Audit & Compliance"]
        LOG["Centralized Logging<br/>- Immutable Logs<br/>- 7 Tahun Retention"]
        SIEM["SIEM Integration<br/>- Real-time Alerting<br/>- Threat Detection"]
    end
```

### Checklist Keamanan untuk Bank

| Kategori | Requirement | Implementasi |
|----------|-------------|--------------|
| **Enkripsi** | Data at rest | AES-256, PostgreSQL TDE |
| | Data in transit | TLS 1.3, mTLS antar service |
| **Akses** | Authentication | OAuth 2.0 / OIDC, MFA |
| | Authorization | RBAC dengan principle of least privilege |
| | Privileged Access | PAM dengan session recording |
| **Audit** | Logging | Centralized logging, immutable |
| | Retention | Minimum 7 tahun (sesuai regulasi BI) |
| | Monitoring | SIEM integration, real-time alerting |
| **Network** | Segmentation | VLAN, firewall antar zona |
| | Protection | WAF, IPS/IDS, DDoS protection |
| **Compliance** | PCI-DSS | Jika memproses data kartu |
| | ISO 27001 | Information security management |
| | POJK | Sesuai regulasi OJK |

---

## High Availability & Disaster Recovery

### Arsitektur HA

```mermaid
flowchart TB
    subgraph DC_PRIMARY["Data Center Primary (Jakarta)"]
        subgraph K8S_P["Kubernetes Cluster"]
            APP_P["Application Pods<br/>(Auto-scaling)"]
        end
        
        subgraph DB_P["Database Cluster"]
            PG_P["PostgreSQL Primary"]
            PG_S1["PostgreSQL Standby 1"]
            PG_S2["PostgreSQL Standby 2"]
        end
        
        PG_P -->|Synchronous| PG_S1 & PG_S2
    end
    
    subgraph DC_DR["Data Center DR (Surabaya/Bandung)"]
        subgraph K8S_DR["Kubernetes Cluster (Standby)"]
            APP_DR["Application Pods<br/>(Warm Standby)"]
        end
        
        subgraph DB_DR["Database"]
            PG_DR["PostgreSQL<br/>Async Replica"]
        end
    end
    
    PG_P -->|Asynchronous<br/>Replication| PG_DR
    
    subgraph GSLB["Global Load Balancer"]
        DNS["DNS-based<br/>Failover"]
    end
    
    DNS --> DC_PRIMARY
    DNS -.->|Failover| DC_DR
```

### Target SLA

| Metrik | Target | Keterangan |
|--------|--------|------------|
| **Availability** | 99.95% | Maksimal downtime 4.38 jam/tahun |
| **RPO** (Recovery Point Objective) | < 1 menit | Data loss maksimal saat disaster |
| **RTO** (Recovery Time Objective) | < 15 menit | Waktu recovery ke DR site |
| **Response Time** | < 500ms | P95 latency untuk API |
| **Throughput** | Sesuai sizing | Berdasarkan volume transaksi |

---

## Monitoring & Observability

```mermaid
flowchart TB
    subgraph SOURCES["Sumber Data"]
        APP["Application Metrics<br/>- Request rate<br/>- Error rate<br/>- Latency"]
        INFRA["Infrastructure Metrics<br/>- CPU, Memory, Disk<br/>- Network I/O"]
        LOGS["Application Logs<br/>- Transaction logs<br/>- Error logs<br/>- Audit logs"]
        TRACES["Distributed Traces<br/>- Request flow<br/>- Service dependencies"]
    end
    
    subgraph COLLECTION["Pengumpulan"]
        PROM["Prometheus<br/>(Metrics)"]
        LOKI["Loki / ELK<br/>(Logs)"]
        JAEGER["Jaeger<br/>(Traces)"]
    end
    
    subgraph VISUALIZATION["Visualisasi & Alerting"]
        GRAFANA["Grafana<br/>- Dashboards<br/>- Alerting"]
        KIBANA["Kibana<br/>- Log Analysis<br/>- Search"]
    end
    
    subgraph ALERTING["Notifikasi"]
        ALERT["Alert Manager"]
        ONCALL["On-Call System<br/>- PagerDuty<br/>- OpsGenie"]
        NOTIF["Notification<br/>- Email<br/>- SMS<br/>- Slack/Teams"]
    end
    
    APP & INFRA --> PROM
    LOGS --> LOKI
    TRACES --> JAEGER
    
    PROM & LOKI & JAEGER --> GRAFANA
    LOKI --> KIBANA
    
    GRAFANA --> ALERT
    ALERT --> ONCALL --> NOTIF
```

### Dashboard yang Dibutuhkan

| Dashboard | Metrik Utama | Pengguna |
|-----------|--------------|----------|
| **Executive** | Total transaksi, Alert rate, System health | Manajemen |
| **Operations** | TPS, Latency, Error rate, Queue depth | Tim Operasional |
| **Security** | Failed auth, Suspicious patterns, WAF blocks | Tim Security |
| **Infrastructure** | CPU, Memory, Disk, Network | Tim Infra |
| **Database** | Connections, Query performance, Replication lag | DBA |

---

## Backup & Recovery

```mermaid
flowchart LR
    subgraph PRODUCTION["Production"]
        DB_PROD["PostgreSQL<br/>Production"]
        CONFIG["Configuration<br/>Files"]
        SECRETS["Secrets &<br/>Certificates"]
    end
    
    subgraph BACKUP_LOCAL["Backup Lokal"]
        SNAP["Daily Snapshots<br/>(7 hari)"]
        WAL["WAL Archives<br/>(Point-in-time)"]
    end
    
    subgraph BACKUP_REMOTE["Backup Remote"]
        S3["Object Storage<br/>(30 hari)"]
        TAPE["Tape/Cold Storage<br/>(7 tahun)"]
    end
    
    DB_PROD -->|Continuous| WAL
    DB_PROD -->|Daily| SNAP
    SNAP -->|Weekly| S3
    S3 -->|Monthly| TAPE
    
    CONFIG -->|Daily| S3
    SECRETS -->|Daily| S3
```

### Kebijakan Backup

| Tipe Data | Frekuensi | Retensi | Lokasi |
|-----------|-----------|---------|--------|
| Database Full | Harian | 7 hari lokal, 30 hari remote | Local + Object Storage |
| Database WAL | Continuous | 7 hari | Local + Object Storage |
| Configuration | Harian | 30 hari | Object Storage |
| Logs | Real-time | 90 hari online, 7 tahun archive | ELK + Cold Storage |
| Secrets | Saat perubahan | 30 hari | Encrypted Object Storage |

---

## Estimasi Biaya Infrastruktur

### On-Premise (Data Center Sendiri)

| Komponen | Jumlah | Estimasi Biaya (IDR) | Keterangan |
|----------|--------|----------------------|------------|
| Server Aplikasi | 6 unit | 1.8 Miliar | @300 juta/unit |
| Server Database | 4 unit | 2 Miliar | @500 juta/unit (high-spec) |
| Server Infrastruktur | 6 unit | 1.2 Miliar | @200 juta/unit |
| Storage Enterprise | 1 set | 1.5 Miliar | SAN/NAS dengan redundancy |
| Network Equipment | 1 set | 800 Juta | Switch, Firewall, Load Balancer |
| **Total CAPEX** | | **7.3 Miliar** | Belum termasuk DR site |
| Lisensi Software | Tahunan | 500 Juta/tahun | OS, Database, Monitoring |
| Maintenance | Tahunan | 730 Juta/tahun | 10% dari CAPEX |
| **Total OPEX** | | **1.23 Miliar/tahun** | |

### Cloud (AWS/GCP/Azure)

| Komponen | Spesifikasi | Estimasi Biaya (USD/bulan) |
|----------|-------------|---------------------------|
| Kubernetes (EKS/GKE/AKS) | 6 worker nodes | $2,500 |
| Database (RDS/Cloud SQL) | Multi-AZ, 128GB RAM | $3,000 |
| Cache (ElastiCache/Memorystore) | 3 nodes | $800 |
| Message Queue (MSK/Pub-Sub) | 3 brokers | $600 |
| Load Balancer | Application LB | $200 |
| Storage | 5TB SSD | $500 |
| Monitoring | CloudWatch/Stackdriver | $300 |
| Network | Data transfer, VPN | $500 |
| **Total** | | **$8,400/bulan** |
| | | **≈ 130 Juta IDR/bulan** |

*Catatan: Estimasi untuk skenario 1 juta transaksi/hari. Biaya akan meningkat sesuai volume.*

---

## Tim yang Dibutuhkan

```mermaid
flowchart TB
    subgraph TEAM["Struktur Tim"]
        PM["Project Manager<br/>(1 orang)"]
        
        subgraph DEV["Development Team"]
            LEAD_DEV["Tech Lead<br/>(1 orang)"]
            BE["Backend Developer<br/>(2-3 orang)"]
            DEVOPS["DevOps Engineer<br/>(2 orang)"]
        end
        
        subgraph OPS["Operations Team"]
            LEAD_OPS["Operations Lead<br/>(1 orang)"]
            SRE["SRE / Sysadmin<br/>(2 orang)"]
            DBA["Database Admin<br/>(1 orang)"]
        end
        
        subgraph SEC["Security Team"]
            SEC_ENG["Security Engineer<br/>(1 orang)"]
        end
    end
    
    PM --> DEV & OPS & SEC
```

### Kebutuhan SDM

| Role | Jumlah | Tanggung Jawab |
|------|--------|----------------|
| Project Manager | 1 | Koordinasi project, timeline, stakeholder |
| Tech Lead | 1 | Arsitektur, code review, technical decision |
| Backend Developer | 2-3 | Pengembangan rule, integrasi, API |
| DevOps Engineer | 2 | CI/CD, infrastructure as code, deployment |
| SRE / Sysadmin | 2 | Operasional harian, monitoring, incident response |
| DBA | 1 | Database administration, performance tuning |
| Security Engineer | 1 | Security review, compliance, audit |
| **Total** | **10-12 orang** | |

---

## Timeline Implementasi

```mermaid
gantt
    title Timeline Implementasi Tazama (Bank Grade)
    dateFormat  YYYY-MM-DD
    
    section Persiapan
    Procurement & Setup Infra     :a1, 2026-01-01, 60d
    Network & Security Setup      :a2, after a1, 30d
    
    section Development
    Instalasi Tazama Base         :b1, after a2, 14d
    Pengembangan Rules            :b2, after b1, 60d
    Integrasi Core Banking        :b3, after b1, 45d
    
    section Testing
    SIT (System Integration Test) :c1, after b2, 30d
    UAT (User Acceptance Test)    :c2, after c1, 30d
    Performance Test              :c3, after c1, 21d
    Security Assessment           :c4, after c1, 21d
    
    section Go-Live
    Pilot (Limited Users)         :d1, after c2, 30d
    Full Production               :d2, after d1, 14d
    Hypercare                     :d3, after d2, 30d
```

### Estimasi Timeline

| Fase | Durasi | Keterangan |
|------|--------|------------|
| Persiapan Infrastruktur | 3 bulan | Procurement, setup, security |
| Development & Integrasi | 2-3 bulan | Instalasi, rules, integrasi |
| Testing | 2 bulan | SIT, UAT, Performance, Security |
| Go-Live | 2 bulan | Pilot, production, hypercare |
| **Total** | **9-10 bulan** | Dari kick-off sampai production stable |

---

## Ringkasan

Untuk implementasi Tazama dengan standar perbankan, dibutuhkan:

1. **Infrastruktur** yang redundant dan tersebar di minimal 2 data center
2. **Keamanan** berlapis dengan enkripsi, segmentasi jaringan, dan audit trail
3. **High Availability** dengan target 99.95% uptime
4. **Tim** sekitar 10-12 orang dengan berbagai keahlian
5. **Investasi** sekitar 7-8 Miliar untuk on-premise atau 130 juta/bulan untuk cloud
6. **Waktu** sekitar 9-10 bulan dari awal sampai production

Implementasi ini bukan proyek sederhana dan membutuhkan perencanaan matang, tim yang kompeten, serta komitmen dari manajemen untuk memastikan keberhasilan.
