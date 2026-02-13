#!/bin/bash
# Skenario Test Tazama

TMS="http://localhost:5000"

send_tx() {
  local name=$1
  local amount=$2
  local debtor=$3
  local e2e="tx_${debtor}_$(date +%s)_$RANDOM"
  local ts=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
  
  echo "📤 $name: Rp $amount (Debtor: $debtor)"
  
  # pacs.008
  curl -s --max-time 10 -X POST "$TMS/v1/evaluate/iso20022/pacs.008.001.10" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp":"pacs.008.001.10",
      "FIToFICstmrCdtTrf":{
        "GrpHdr":{"MsgId":"msg_'$e2e'","CreDtTm":"'$ts'","NbOfTxs":1,"SttlmInf":{"SttlmMtd":"CLRG"}},
        "CdtTrfTxInf":{
          "PmtId":{"InstrId":"i1","EndToEndId":"'$e2e'"},
          "IntrBkSttlmAmt":{"Amt":{"Amt":'$amount',"Ccy":"IDR"}},
          "InstdAmt":{"Amt":{"Amt":'$amount',"Ccy":"IDR"}},
          "XchgRate":1,"ChrgBr":"DEBT",
          "ChrgsInf":{"Amt":{"Amt":0,"Ccy":"IDR"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp001"}}}},
          "InitgPty":{"Nm":"'$debtor'","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1990-01-01","CityOfBirth":"Jakarta","CtryOfBirth":"ID"},"Othr":[{"Id":"'$debtor'","SchmeNm":{"Prtry":"MSISDN"}}]}},"CtctDtls":{"MobNb":"+62-811"}},
          "Dbtr":{"Nm":"'$debtor'","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1990-01-01","CityOfBirth":"Jakarta","CtryOfBirth":"ID"},"Othr":[{"Id":"'$debtor'","SchmeNm":{"Prtry":"MSISDN"}}]}},"CtctDtls":{"MobNb":"+62-811"}},
          "DbtrAcct":{"Id":{"Othr":[{"Id":"ACC_'$debtor'","SchmeNm":{"Prtry":"MSISDN"}}]},"Nm":"Acc"},
          "DbtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp001"}}},
          "CdtrAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp002"}}},
          "Cdtr":{"Nm":"Receiver","Id":{"PrvtId":{"DtAndPlcOfBirth":{"BirthDt":"1985-01-01","CityOfBirth":"Bandung","CtryOfBirth":"ID"},"Othr":[{"Id":"RECV","SchmeNm":{"Prtry":"MSISDN"}}]}},"CtctDtls":{"MobNb":"+62-822"}},
          "CdtrAcct":{"Id":{"Othr":[{"Id":"ACC_RECV","SchmeNm":{"Prtry":"MSISDN"}}]},"Nm":"Recv"},
          "Purp":{"Cd":"MP2P"}
        },
        "RgltryRptg":{"Dtls":{"Tp":"BOP","Cd":"100"}},
        "RmtInf":{"Ustrd":"Test"},
        "SplmtryData":{"Envlp":{"Doc":{"Xprtn":"2026-12-31T23:59:59.000Z","InitgPty":{"Glctn":{"Lat":"-6.2","Long":"106.8"}}}}}
      }
    }' > /dev/null 2>&1
  
  sleep 1
  
  # pacs.002
  curl -s --max-time 10 -X POST "$TMS/v1/evaluate/iso20022/pacs.002.001.12" \
    -H "Content-Type: application/json" \
    -d '{
      "TxTp":"pacs.002.001.12",
      "FIToFIPmtSts":{
        "GrpHdr":{"MsgId":"p_'$e2e'","CreDtTm":"'$ts'"},
        "TxInfAndSts":{
          "OrgnlInstrId":"i1","OrgnlEndToEndId":"'$e2e'","TxSts":"ACCC",
          "ChrgsInf":[{"Amt":{"Amt":0,"Ccy":"IDR"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp001"}}}},{"Amt":{"Amt":0,"Ccy":"IDR"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp001"}}}},{"Amt":{"Amt":0,"Ccy":"IDR"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp002"}}}}],
          "AccptncDtTm":"'$ts'",
          "InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp001"}}},
          "InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"fsp002"}}}
        }
      },
      "DataCache":{"dbtrId":"'$debtor'","cdtrId":"RECV","dbtrAcctId":"ACC_'$debtor'","cdtrAcctId":"ACC_RECV","instdAmt":{"amt":'$amount',"ccy":"IDR"},"intrBkSttlmAmt":{"amt":'$amount',"ccy":"IDR"}}
    }' > /dev/null 2>&1
  
  echo "   ✅ Terkirim (E2E: $e2e)"
}

echo "
╔══════════════════════════════════════════════════════════════╗
║           SKENARIO TEST TAZAMA FRAUD DETECTION               ║
╚══════════════════════════════════════════════════════════════╝
"

echo "
═══════════════════════════════════════════════════════════════
SKENARIO 1: Transaksi Normal (Rp 500.000)
Expected: NALT (No Alert) - Rule 903 skor 0
═══════════════════════════════════════════════════════════════"
send_tx "Normal" 500000 "USER_NORMAL"

sleep 2

echo "
═══════════════════════════════════════════════════════════════
SKENARIO 2: Transaksi Besar (Rp 15.000.000)
Expected: ALRT - Rule 903 skor 500 (INTERDICTION)
═══════════════════════════════════════════════════════════════"
send_tx "Large" 15000000 "USER_LARGE"

sleep 2

echo "
═══════════════════════════════════════════════════════════════
SKENARIO 3: Transaksi Berulang (3x dalam 1 menit)
Expected: ALRT - Multiple transactions detected
═══════════════════════════════════════════════════════════════"
send_tx "Rapid-1" 100000 "USER_RAPID"
sleep 1
send_tx "Rapid-2" 150000 "USER_RAPID"
sleep 1
send_tx "Rapid-3" 200000 "USER_RAPID"

echo "
═══════════════════════════════════════════════════════════════
✅ Semua skenario selesai!
═══════════════════════════════════════════════════════════════
"
