# Panduan Demo Tazama di Postman

## Setup Awal

### 1. Import Environment
Buat environment baru di Postman dengan variabel:

| Variable | Value |
|----------|-------|
| `tmsUrl` | `http://localhost:5000` |
| `hasuraUrl` | `http://localhost:6100` |
| `hasuraPassword` | `password` |

### 2. Struktur Request

Setiap transaksi membutuhkan 2 request:
1. **pacs.008** - Initiation (permintaan transfer)
2. **pacs.002** - Completion (konfirmasi transfer berhasil)

---

## SKENARIO 1: Transaksi Normal (Rp 500.000)
**Expected Result: NALT (No Alert)**

### Request 1a: pacs.008 (Initiation)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10
Content-Type: application/json
```


**Body:**
```json
{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "NORMAL_001",
      "CreDtTm": "2026-01-21T12:00:00.000Z",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr_normal_001", "EndToEndId": "e2e_normal_001"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": 500000, "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": 500000, "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {
        "Amt": {"Amt": 0, "Ccy": "IDR"},
        "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}
      },
      "InitgPty": {
        "Nm": "User Normal",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_NORMAL", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-1111"}
      },
      "Dbtr": {
        "Nm": "User Normal",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_NORMAL", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-1111"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_NORMAL", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Normal"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Receiver",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-01-01", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-822-2222"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Receiver"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Transfer normal"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}
```

### Request 1b: pacs.002 (Completion)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {
      "MsgId": "pacs002_normal_001",
      "CreDtTm": "2026-01-21T12:00:01.000Z"
    },
    "TxInfAndSts": {
      "OrgnlInstrId": "instr_normal_001",
      "OrgnlEndToEndId": "e2e_normal_001",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "2026-01-21T12:00:01.000Z",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "USER_NORMAL",
    "cdtrId": "RECEIVER",
    "dbtrAcctId": "ACC_NORMAL",
    "cdtrAcctId": "ACC_RECEIVER",
    "instdAmt": {"amt": 500000, "ccy": "IDR"},
    "intrBkSttlmAmt": {"amt": 500000, "ccy": "IDR"}
  }
}
```

**Expected Response:** `NALT` (No Alert) - Transaksi diizinkan

---

## SKENARIO 2: Transaksi Besar (Rp 15.000.000)
**Expected Result: ALRT (Alert/Interdiction) - DIBLOKIR**

### Request 2a: pacs.008 (Initiation)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10
Content-Type: application/json
```


**Body:**
```json
{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "LARGE_001",
      "CreDtTm": "2026-01-21T12:05:00.000Z",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr_large_001", "EndToEndId": "e2e_large_001"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": 15000000, "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {
        "Amt": {"Amt": 0, "Ccy": "IDR"},
        "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}
      },
      "InitgPty": {
        "Nm": "User Large",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_LARGE", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-3333"}
      },
      "Dbtr": {
        "Nm": "User Large",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_LARGE", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-3333"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_LARGE", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Large"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Receiver",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-01-01", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-822-2222"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Receiver"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Transfer besar"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}
```

### Request 2b: pacs.002 (Completion)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {
      "MsgId": "pacs002_large_001",
      "CreDtTm": "2026-01-21T12:05:01.000Z"
    },
    "TxInfAndSts": {
      "OrgnlInstrId": "instr_large_001",
      "OrgnlEndToEndId": "e2e_large_001",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "2026-01-21T12:05:01.000Z",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "USER_LARGE",
    "cdtrId": "RECEIVER",
    "dbtrAcctId": "ACC_LARGE",
    "cdtrAcctId": "ACC_RECEIVER",
    "instdAmt": {"amt": 15000000, "ccy": "IDR"},
    "intrBkSttlmAmt": {"amt": 15000000, "ccy": "IDR"}
  }
}
```

**Expected Response:** `ALRT` (Alert) - Transaksi DIBLOKIR karena Rule 903 mendeteksi nominal > Rp 10 juta (skor 500)

---

## SKENARIO 3: Transaksi Berulang (3x dalam 1 menit)
**Expected Result: ALRT - Multiple transactions detected**

Kirim 3 transaksi berturut-turut dengan debtor yang sama dalam waktu singkat.

### Request 3a-1: pacs.008 (Rapid #1)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10
Content-Type: application/json
```


**Body:**
```json
{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "RAPID_001",
      "CreDtTm": "2026-01-21T12:10:00.000Z",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr_rapid_001", "EndToEndId": "e2e_rapid_001"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": 100000, "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": 100000, "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {
        "Amt": {"Amt": 0, "Ccy": "IDR"},
        "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}
      },
      "InitgPty": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "Dbtr": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Rapid"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Receiver",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-01-01", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-822-2222"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Receiver"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Rapid transfer 1"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}
```

### Request 3a-2: pacs.002 (Rapid #1 Completion)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {"MsgId": "pacs002_rapid_001", "CreDtTm": "2026-01-21T12:10:01.000Z"},
    "TxInfAndSts": {
      "OrgnlInstrId": "instr_rapid_001",
      "OrgnlEndToEndId": "e2e_rapid_001",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "2026-01-21T12:10:01.000Z",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "USER_RAPID",
    "cdtrId": "RECEIVER",
    "dbtrAcctId": "ACC_RAPID",
    "cdtrAcctId": "ACC_RECEIVER",
    "instdAmt": {"amt": 100000, "ccy": "IDR"}
  }
}
```

### Request 3b-1: pacs.008 (Rapid #2)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "RAPID_002",
      "CreDtTm": "2026-01-21T12:10:20.000Z",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr_rapid_002", "EndToEndId": "e2e_rapid_002"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": 150000, "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": 150000, "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {
        "Amt": {"Amt": 0, "Ccy": "IDR"},
        "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}
      },
      "InitgPty": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "Dbtr": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Rapid"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Receiver",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-01-01", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-822-2222"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Receiver"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Rapid transfer 2"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}
```

### Request 3b-2: pacs.002 (Rapid #2 Completion)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {"MsgId": "pacs002_rapid_002", "CreDtTm": "2026-01-21T12:10:21.000Z"},
    "TxInfAndSts": {
      "OrgnlInstrId": "instr_rapid_002",
      "OrgnlEndToEndId": "e2e_rapid_002",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "2026-01-21T12:10:21.000Z",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "USER_RAPID",
    "cdtrId": "RECEIVER",
    "dbtrAcctId": "ACC_RAPID",
    "cdtrAcctId": "ACC_RECEIVER",
    "instdAmt": {"amt": 150000, "ccy": "IDR"}
  }
}
```

### Request 3c-1: pacs.008 (Rapid #3)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "RAPID_003",
      "CreDtTm": "2026-01-21T12:10:40.000Z",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr_rapid_003", "EndToEndId": "e2e_rapid_003"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": 200000, "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": 200000, "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {
        "Amt": {"Amt": 0, "Ccy": "IDR"},
        "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}
      },
      "InitgPty": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "Dbtr": {
        "Nm": "User Rapid",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "USER_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-811-4444"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "ACC_RAPID", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Rapid"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Receiver",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-01-01", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-822-2222"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "ACC_RECEIVER", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Account Receiver"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Rapid transfer 3"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}
```

### Request 3c-2: pacs.002 (Rapid #3 Completion)
```
POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12
Content-Type: application/json
```

**Body:**
```json
{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {"MsgId": "pacs002_rapid_003", "CreDtTm": "2026-01-21T12:10:41.000Z"},
    "TxInfAndSts": {
      "OrgnlInstrId": "instr_rapid_003",
      "OrgnlEndToEndId": "e2e_rapid_003",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "2026-01-21T12:10:41.000Z",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "USER_RAPID",
    "cdtrId": "RECEIVER",
    "dbtrAcctId": "ACC_RAPID",
    "cdtrAcctId": "ACC_RECEIVER",
    "instdAmt": {"amt": 200000, "ccy": "IDR"}
  }
}
```

**Expected Response:** Transaksi ke-2 dan ke-3 akan mendapat `ALRT` karena Rule 904 mendeteksi multiple transactions dari debtor yang sama.

---

## Cek Hasil Evaluasi

### Via Hasura GraphQL
```
POST http://localhost:6100/v1/graphql
x-hasura-admin-secret: password
Content-Type: application/json
```

**Body:**
```json
{
  "query": "query { evaluation(limit: 10, order_by: {created_at: desc}) { evaluation created_at } }"
}
```

### Via Admin API
```
GET http://localhost:5100/v1/admin/reports/getreportbymsgid?msgid=LARGE_001
```

---

## Tips Postman

1. **Gunakan Variables**: Set `{{tmsUrl}}` = `http://localhost:5000` di Environment
2. **Unique IDs**: Selalu ganti `MsgId`, `InstrId`, `EndToEndId` untuk setiap test baru
3. **Urutan**: Selalu kirim pacs.008 dulu, tunggu response, baru kirim pacs.002
4. **Timestamp**: Gunakan timestamp yang valid (format ISO 8601)

---

## Ringkasan Threshold

| Rule | Kondisi | Skor | Status |
|------|---------|------|--------|
| 903 | < Rp 1 juta | 0 | NALT |
| 903 | Rp 1-5 juta | 100 | NALT |
| 903 | Rp 5-10 juta | 300 | ALRT |
| 903 | > Rp 10 juta | 500 | ALRT (Interdiction) |
| 904 | 1 transaksi | 0 | NALT |
| 904 | 2-3 transaksi/menit | 200 | ALRT |
| 904 | 4-5 transaksi/menit | 400 | ALRT (Interdiction) |
| 904 | 6+ transaksi/menit | 600 | ALRT (Interdiction) |
