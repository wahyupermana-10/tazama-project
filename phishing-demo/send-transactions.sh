#!/bin/bash
# Demo Phishing Scam Detection
# Skenario: Korban (elderly) transfer berulang ke Penipu (akun baru)

TMS_URL="http://localhost:5000"

# Fungsi untuk generate UUID sederhana
generate_id() {
  cat /dev/urandom | LC_ALL=C tr -dc 'a-f0-9' | fold -w 32 | head -n 1
}

# Korban: Orang tua dengan akun lama
KORBAN_ACCOUNT="KORBAN-ACC-001"
KORBAN_NAME="Pak Budi (65 tahun)"

# Penipu: Akun baru yang mengaku dari "kantor pajak"
PENIPU_ACCOUNT="PENIPU-ACC-999"
PENIPU_NAME="Kantor Pajak Palsu"

echo "=============================================="
echo "  DEMO: Deteksi Phishing Scam dengan Tazama"
echo "=============================================="
echo ""
echo "Skenario:"
echo "- Korban: $KORBAN_NAME"
echo "- Penipu: $PENIPU_NAME (mengaku dari kantor pajak)"
echo "- Penipu menelepon korban, mengancam akan dipenjara jika tidak bayar 'tunggakan pajak'"
echo ""

send_transaction() {
  local tx_num=$1
  local amount=$2
  local msg_id=$(generate_id)
  local e2e_id=$(generate_id)
  
  echo "📤 Transaksi #$tx_num: Rp $amount dari $KORBAN_NAME ke $PENIPU_NAME"
  
  # Kirim pacs.008 (transfer request)
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
          "Dbtr": {"Nm": "'"$KORBAN_NAME"'", "Id": {"PrvtId": {"DtAndPlcOfBirth": {"BirthDt": "1960-01-15"}}}},
          "DbtrAcct": {"Id": {"Othr": {"Id": "'$KORBAN_ACCOUNT'", "SchmeNm": {"Prtry": "MSISDN"}}}, "Nm": "'"$KORBAN_NAME"'"},
          "DbtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp001"}}},
          "Cdtr": {"Nm": "'"$PENIPU_NAME"'"},
          "CdtrAcct": {"Id": {"Othr": {"Id": "'$PENIPU_ACCOUNT'", "SchmeNm": {"Prtry": "MSISDN"}}}, "Nm": "'"$PENIPU_NAME"'"},
          "CdtrAgt": {"FinInstnId": {"ClrSysMmbId": {"MmbId": "fsp002"}}}
        }
      }
    }' > /dev/null
  
  sleep 1
  
  # Kirim pacs.002 (transfer confirmation)
  curl -s -X POST "$TMS_URL/v1/evaluate/iso20022/pacs.002.001.12" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp": "pacs.002.001.12",
      "FIToFIPmtSts": {
        "GrpHdr": {
          "MsgId": "'$(generate_id)'",
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
  
  echo "   ✅ Transaksi terkirim"
  sleep 1
}

echo "Mengirim transaksi..."
echo ""

# Transaksi 1: Korban mulai transfer kecil (test)
send_transaction 1 500000

# Transaksi 2: Penipu minta lebih
send_transaction 2 2000000

# Transaksi 3: Penipu terus menekan
send_transaction 3 5000000

# Transaksi 4: Korban sudah panik
send_transaction 4 10000000

echo ""
echo "=============================================="
echo "  Semua transaksi terkirim!"
echo "  Cek hasil di Hasura: http://localhost:6100"
echo "  Password: password"
echo "=============================================="
