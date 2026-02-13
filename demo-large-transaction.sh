#!/bin/bash
# Demo Large Transaction Detection dengan Rule 903

echo "=============================================="
echo "  DEMO: Large Transaction Detection (Rule 903)"
echo "=============================================="
echo ""

TMS_URL="http://localhost:5000"

send_transaction() {
  local amount=$1
  local desc=$2
  local msg_id=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-f0-9' | fold -w 32 | head -n 1)
  local e2e_id=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-f0-9' | fold -w 32 | head -n 1)
  
  echo "📤 Mengirim transaksi: Rp $amount ($desc)"
  
  # Kirim pacs.008
  curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.008.001.10" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp": "pacs.008.001.10",
      "FIToFICstmrCdt": {
        "GrpHdr": {
          "MsgId": "'$msg_id'",
          "CreDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
          "NbOfTxs": 1,
          "SttlmInf": {"SttlmMtd": "CLRG"}
        },
        "CdtTrfTxInf": {
          "PmtId": {"EndToEndId": "'$e2e_id'"},
          "IntrBkSttlmAmt": {"Amt": {"Amt": '$amount', "Ccy": "IDR"}},
          "Dbtr": {"Nm": "Pengirim Test"},
          "DbtrAcct": {"Id": {"Othr": {"Id": "SENDER001", "SchmeNm": {"Prtry": "MSISDN"}}}, "Nm": "Pengirim"},
          "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
          "Cdtr": {"Nm": "Penerima Test"},
          "CdtrAcct": {"Id": {"Othr": {"Id": "RECEIVER001", "SchmeNm": {"Prtry": "MSISDN"}}}, "Nm": "Penerima"},
          "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
        }
      }
    }' > /dev/null
  
  sleep 1
  
  # Kirim pacs.002 dengan amount di DataCache
  local pacs002_msg_id=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-f0-9' | fold -w 32 | head -n 1)
  
  curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.002.001.12" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp": "pacs.002.001.12",
      "FIToFIPmtSts": {
        "GrpHdr": {
          "MsgId": "'$pacs002_msg_id'",
          "CreDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
        },
        "TxInfAndSts": {
          "OrgnlEndToEndId": "'$e2e_id'",
          "TxSts": "ACCC",
          "ChrgsInf": [{"Amt": {"Amt": 0, "Ccy": "IDR"}, "Agt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}}}],
          "AccptncDtTm": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
          "InstgAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
          "InstdAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
        }
      },
      "TenantId": "DEFAULT"
    }' > /dev/null
  
  echo "   ✅ Terkirim (MsgId: $pacs002_msg_id)"
  echo ""
  sleep 2
}

echo "Skenario: Mengirim 4 transaksi dengan jumlah berbeda"
echo ""

# Transaksi 1: Normal (< 1 juta)
send_transaction 500000 "Normal - tidak ada alert"

# Transaksi 2: Menengah (1-5 juta)  
send_transaction 3000000 "Menengah - skor 100"

# Transaksi 3: Besar (5-10 juta)
send_transaction 7000000 "Besar - skor 300 - ALERT!"

# Transaksi 4: Sangat besar (> 10 juta)
send_transaction 15000000 "Sangat besar - skor 500 - INTERDICTION!"

echo "=============================================="
echo "  Demo selesai!"
echo ""
echo "  Threshold:"
echo "  - Alert: >= 200"
echo "  - Interdiction (Blokir): >= 400"
echo ""
echo "  Cek hasil di:"
echo "  - Hasura: http://localhost:6100 (password: password)"
echo "=============================================="
