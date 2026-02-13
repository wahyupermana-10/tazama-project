#!/bin/bash
# Demo Rule 903 - Large Transaction Detection

echo "=============================================="
echo "  DEMO: Rule 903 - Large Transaction Detection"
echo "=============================================="

TMS_URL="http://localhost:5000"
E2E="demo$(date +%s)"
MSG_ID="msg$E2E"
AMOUNT=15000000

echo ""
echo "Mengirim transaksi Rp $AMOUNT (> 10 juta = INTERDICTION)"
echo "EndToEndId: $E2E"
echo ""

# Step 1: Kirim pacs.008
echo "Step 1: Kirim pacs.008..."
RESP=$(curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.008.001.10" \
  -H "Content-Type: application/json" \
  -d '{
  "TxTp": "pacs.008.001.10",
  "FIToFICstmrCdtTrf": {
    "GrpHdr": {
      "MsgId": "'$MSG_ID'",
      "CreDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "NbOfTxs": 1,
      "SttlmInf": {"SttlmMtd": "CLRG"}
    },
    "CdtTrfTxInf": {
      "PmtId": {"InstrId": "instr001", "EndToEndId": "'$E2E'"},
      "IntrBkSttlmAmt": {"Amt": {"Amt": '$AMOUNT', "Ccy": "IDR"}},
      "InstdAmt": {"Amt": {"Amt": '$AMOUNT', "Ccy": "IDR"}},
      "XchgRate": 1,
      "ChrgBr": "DEBT",
      "ChrgsInf": {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
      "InitgPty": {
        "Nm": "Korban Penipuan",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "KORBAN001", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-812345678"}
      },
      "Dbtr": {
        "Nm": "Korban Penipuan",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "KORBAN001", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-812345678"}
      },
      "DbtrAcct": {"Id": {"Othr": [{"Id": "KORBAN_ACC", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Korban Account"},
      "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
      "Cdtr": {
        "Nm": "Penipu",
        "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-05-05", "CityOfBirth": "Unknown", "CtryOfBirth": "ZZ"}, "Othr": [{"Id": "PENIPU001", "SchmeNm": {"Prtry": "MSISDN"}}]}},
        "CtctDtls": {"MobNb": "+62-899999999"}
      },
      "CdtrAcct": {"Id": {"Othr": [{"Id": "PENIPU_ACC", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Penipu Account"},
      "Purp": {"Cd": "MP2P"}
    },
    "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
    "RmtInf": {"Ustrd": "Transfer uang"},
    "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
  }
}')

echo "Response: $RESP"
echo ""

sleep 2

# Step 2: Kirim pacs.002
echo "Step 2: Kirim pacs.002..."
RESP2=$(curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.002.001.12" \
  -H "Content-Type: application/json" \
  -d '{
  "TxTp": "pacs.002.001.12",
  "FIToFIPmtSts": {
    "GrpHdr": {"MsgId": "pacs002'$E2E'", "CreDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"},
    "TxInfAndSts": {
      "OrgnlInstrId": "instr001",
      "OrgnlEndToEndId": "'$E2E'",
      "TxSts": "ACCC",
      "ChrgsInf": [
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
        {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
      ],
      "AccptncDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
      "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
    }
  },
  "DataCache": {
    "dbtrId": "KORBAN001",
    "cdtrId": "PENIPU001",
    "dbtrAcctId": "KORBAN_ACC",
    "cdtrAcctId": "PENIPU_ACC",
    "instdAmt": {"amt": '$AMOUNT', "ccy": "IDR"},
    "intrBkSttlmAmt": {"amt": '$AMOUNT', "ccy": "IDR"}
  }
}')

echo "Response: $RESP2"
echo ""
echo "=============================================="
echo "Demo selesai! Cek hasil di Hasura: http://localhost:6100"
echo "Password: password"
echo "=============================================="
