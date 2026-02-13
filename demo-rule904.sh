#!/bin/bash
# Demo Rule 904 - Rapid Transaction Detection
# Mengirim beberapa transaksi dalam waktu singkat untuk trigger alert

echo "=============================================="
echo "  DEMO: Rule 904 - Rapid Transaction Detection"
echo "=============================================="
echo ""
echo "Konfigurasi:"
echo "  - 1 transaksi/menit    → Normal (skor 0)"
echo "  - 2-3 transaksi/menit  → Suspicious (skor 200) - ALERT"
echo "  - 4-5 transaksi/menit  → High Risk (skor 400) - INTERDICTION"
echo "  - 6+ transaksi/menit   → Critical (skor 600) - INTERDICTION"
echo ""
echo "=============================================="

TMS_URL="http://localhost:5000"
DEBTOR_ID="RAPID_TEST_USER"
DEBTOR_ACC="RAPID_TEST_ACC"
TIMESTAMP=$(date +%s)

send_transaction() {
  local tx_num=$1
  local amount=$2
  local e2e="rapid_${TIMESTAMP}_tx${tx_num}"
  local msg_id="msg_${e2e}"
  local current_time=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
  
  echo ""
  echo "📤 Transaksi #${tx_num}: Rp ${amount}"
  echo "   ID: ${e2e}"
  echo "   Waktu: ${current_time}"
  
  # Kirim pacs.008
  curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.008.001.10" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp": "pacs.008.001.10",
      "FIToFICstmrCdtTrf": {
        "GrpHdr": {
          "MsgId": "'$msg_id'",
          "CreDtTm": "'$current_time'",
          "NbOfTxs": 1,
          "SttlmInf": {"SttlmMtd": "CLRG"}
        },
        "CdtTrfTxInf": {
          "PmtId": {"InstrId": "instr'$tx_num'", "EndToEndId": "'$e2e'"},
          "IntrBkSttlmAmt": {"Amt": {"Amt": '$amount', "Ccy": "IDR"}},
          "InstdAmt": {"Amt": {"Amt": '$amount', "Ccy": "IDR"}},
          "XchgRate": 1,
          "ChrgBr": "DEBT",
          "ChrgsInf": {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
          "InitgPty": {
            "Nm": "Rapid Test User",
            "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "'$DEBTOR_ID'", "SchmeNm": {"Prtry": "MSISDN"}}]}},
            "CtctDtls": {"MobNb": "+62-812345678"}
          },
          "Dbtr": {
            "Nm": "Rapid Test User",
            "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1990-01-01", "CityOfBirth": "Jakarta", "CtryOfBirth": "ID"}, "Othr": [{"Id": "'$DEBTOR_ID'", "SchmeNm": {"Prtry": "MSISDN"}}]}},
            "CtctDtls": {"MobNb": "+62-812345678"}
          },
          "DbtrAcct": {"Id": {"Othr": [{"Id": "'$DEBTOR_ACC'", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Rapid Test Account"},
          "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
          "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}},
          "Cdtr": {
            "Nm": "Receiver '$tx_num'",
            "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1985-05-05", "CityOfBirth": "Bandung", "CtryOfBirth": "ID"}, "Othr": [{"Id": "RECEIVER'$tx_num'", "SchmeNm": {"Prtry": "MSISDN"}}]}},
            "CtctDtls": {"MobNb": "+62-899999999"}
          },
          "CdtrAcct": {"Id": {"Othr": [{"Id": "RECV_ACC'$tx_num'", "SchmeNm": {"Prtry": "MSISDN"}}]}, "Nm": "Receiver Account"},
          "Purp": {"Cd": "MP2P"}
        },
        "RgltryRptg": {"Dtls": {"Tp": "BALANCE OF PAYMENTS", "Cd": "100"}},
        "RmtInf": {"Ustrd": "Rapid transaction test '$tx_num'"},
        "SplmtryData": {"Envlp": {"Doc": {"Xprtn": "2026-12-31T23:59:59.000Z", "InitgPty": {"Glctn": {"Lat": "-6.2088", "Long": "106.8456"}}}}}
      }
    }' > /dev/null
  
  sleep 1
  
  # Kirim pacs.002
  curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.002.001.12" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp": "pacs.002.001.12",
      "FIToFIPmtSts": {
        "GrpHdr": {"MsgId": "p002_'$e2e'", "CreDtTm": "'$current_time'"},
        "TxInfAndSts": {
          "OrgnlInstrId": "instr'$tx_num'",
          "OrgnlEndToEndId": "'$e2e'",
          "TxSts": "ACCC",
          "ChrgsInf": [
            {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
            {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}},
            {"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}}
          ],
          "AccptncDtTm": "'$current_time'",
          "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
          "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
        }
      },
      "DataCache": {
        "dbtrId": "'$DEBTOR_ID'",
        "cdtrId": "RECEIVER'$tx_num'",
        "dbtrAcctId": "'$DEBTOR_ACC'",
        "cdtrAcctId": "RECV_ACC'$tx_num'",
        "instdAmt": {"amt": '$amount', "ccy": "IDR"},
        "intrBkSttlmAmt": {"amt": '$amount', "ccy": "IDR"}
      }
    }' > /dev/null
  
  echo "   ✅ Terkirim"
}

echo ""
echo "Mengirim 4 transaksi berturut-turut dari user yang sama..."
echo "(Dalam waktu < 1 menit)"
echo ""

# Kirim 4 transaksi berturut-turut
send_transaction 1 100000
sleep 2
send_transaction 2 150000
sleep 2
send_transaction 3 200000
sleep 2
send_transaction 4 250000

echo ""
echo "=============================================="
echo ""
echo "📊 HASIL YANG DIHARAPKAN:"
echo ""
echo "   | TX# | Jumlah TX/menit | Skor | Status      |"
echo "   |-----|-----------------|------|-------------|"
echo "   | 1   | 1               | 0    | Normal      |"
echo "   | 2   | 2               | 200  | ALERT       |"
echo "   | 3   | 3               | 200  | ALERT       |"
echo "   | 4   | 4               | 400  | INTERDICTION|"
echo ""
echo "Cek hasil di Hasura: http://localhost:6100"
echo "Password: password"
echo "=============================================="
