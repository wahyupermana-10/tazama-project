#!/bin/bash
# Test Rapid Transaction Detection

RAPID_USER="RAPID_$(date +%s)"
RAPID_ACC="ACC_${RAPID_USER}"

echo "Testing with user: $RAPID_USER"
echo "Account: $RAPID_ACC"
echo ""

send_tx() {
    local i=$1
    local ts=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)
    
    # pacs.008
    curl -s -X POST http://localhost:5000/v1/evaluate/iso20022/pacs.008.001.10 \
      -H "Content-Type: application/json" \
      -d "{
        \"TxTp\": \"pacs.008.001.10\",
        \"FIToFICstmrCdtTrf\": {
          \"GrpHdr\": {\"MsgId\": \"RAPID_$i\", \"CreDtTm\": \"$ts\", \"NbOfTxs\": 1, \"SttlmInf\": {\"SttlmMtd\": \"CLRG\"}},
          \"CdtTrfTxInf\": {
            \"PmtId\": {\"InstrId\": \"INSTR_RAPID_$i\", \"EndToEndId\": \"E2E_RAPID_$i\"},
            \"IntrBkSttlmAmt\": {\"Amt\": {\"Amt\": 100000, \"Ccy\": \"IDR\"}},
            \"InstdAmt\": {\"Amt\": {\"Amt\": 100000, \"Ccy\": \"IDR\"}},
            \"XchgRate\": 1, \"ChrgBr\": \"DEBT\",
            \"ChrgsInf\": {\"Amt\": {\"Amt\": 0, \"Ccy\": \"IDR\"}, \"Agt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp001\"}}}},
            \"InitgPty\": {\"Nm\": \"Rapid User\", \"Id\": {\"PrvtId\": {\"DtAndPlcOfBirth\": {\"BirthDt\": \"1990-01-01\", \"CityOfBirth\": \"Jakarta\", \"CtryOfBirth\": \"ID\"}, \"Othr\": [{\"Id\": \"$RAPID_USER\", \"SchmeNm\": {\"Prtry\": \"MSISDN\"}}]}}, \"CtctDtls\": {\"MobNb\": \"+62-811\"}},
            \"Dbtr\": {\"Nm\": \"Rapid User\", \"Id\": {\"PrvtId\": {\"DtAndPlcOfBirth\": {\"BirthDt\": \"1990-01-01\", \"CityOfBirth\": \"Jakarta\", \"CtryOfBirth\": \"ID\"}, \"Othr\": [{\"Id\": \"$RAPID_USER\", \"SchmeNm\": {\"Prtry\": \"MSISDN\"}}]}}, \"CtctDtls\": {\"MobNb\": \"+62-811\"}},
            \"DbtrAcct\": {\"Id\": {\"Othr\": [{\"Id\": \"$RAPID_ACC\", \"SchmeNm\": {\"Prtry\": \"MSISDN\"}}]}, \"Nm\": \"Account\"},
            \"DbtrAgt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp001\"}}},
            \"CdtrAgt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp002\"}}},
            \"Cdtr\": {\"Nm\": \"Recv$i\", \"Id\": {\"PrvtId\": {\"DtAndPlcOfBirth\": {\"BirthDt\": \"1985-01-01\", \"CityOfBirth\": \"Bandung\", \"CtryOfBirth\": \"ID\"}, \"Othr\": [{\"Id\": \"RECV_R$i\", \"SchmeNm\": {\"Prtry\": \"MSISDN\"}}]}}, \"CtctDtls\": {\"MobNb\": \"+62-822\"}},
            \"CdtrAcct\": {\"Id\": {\"Othr\": [{\"Id\": \"ACC_RECV_R$i\", \"SchmeNm\": {\"Prtry\": \"MSISDN\"}}]}, \"Nm\": \"Account\"},
            \"Purp\": {\"Cd\": \"MP2P\"}
          },
          \"RgltryRptg\": {\"Dtls\": {\"Tp\": \"BALANCE OF PAYMENTS\", \"Cd\": \"100\"}},
          \"RmtInf\": {\"Ustrd\": \"Transfer\"},
          \"SplmtryData\": {\"Envlp\": {\"Doc\": {\"Xprtn\": \"2026-12-31T23:59:59.000Z\", \"InitgPty\": {\"Glctn\": {\"Lat\": \"-6.2\", \"Long\": \"106.8\"}}}}}
        }
      }" > /dev/null

    sleep 0.3
    
    # pacs.002
    curl -s -X POST http://localhost:5000/v1/evaluate/iso20022/pacs.002.001.12 \
      -H "Content-Type: application/json" \
      -d "{
        \"TxTp\": \"pacs.002.001.12\",
        \"FIToFIPmtSts\": {
          \"GrpHdr\": {\"MsgId\": \"PACS002_RAPID_$i\", \"CreDtTm\": \"$ts\"},
          \"TxInfAndSts\": {
            \"OrgnlInstrId\": \"INSTR_RAPID_$i\", \"OrgnlEndToEndId\": \"E2E_RAPID_$i\", \"TxSts\": \"ACCC\",
            \"ChrgsInf\": [{\"Amt\": {\"Amt\": 0, \"Ccy\": \"IDR\"}, \"Agt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp001\"}}}}, {\"Amt\": {\"Amt\": 0, \"Ccy\": \"IDR\"}, \"Agt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp002\"}}}}],
            \"AccptncDtTm\": \"$ts\",
            \"InstgAgt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp001\"}}},
            \"InstdAgt\": {\"FinInstnId\": {\"ClrSysMmbId\": {\"MmbId\": \"fsp002\"}}}
          }
        },
        \"DataCache\": {\"dbtrId\": \"$RAPID_USER\", \"cdtrId\": \"RECV_R$i\", \"dbtrAcctId\": \"$RAPID_ACC\", \"cdtrAcctId\": \"ACC_RECV_R$i\", \"instdAmt\": {\"amt\": 100000, \"ccy\": \"IDR\"}}
      }" > /dev/null
}

# Send 4 transactions
for i in 1 2 3 4; do
    echo "Sending TX $i..."
    send_tx $i
    sleep 1
done

echo ""
echo "Waiting for processing..."
sleep 3

# Check results
echo ""
echo "=== Results ==="
for i in 1 2 3 4; do
    echo "TX $i:"
    curl -s -X POST http://localhost:6100/v1/graphql \
      -H "Content-Type: application/json" \
      -H "x-hasura-admin-secret: password" \
      -d "{\"query\": \"{ evaluation(where: {messageid: {_eq: \\\"PACS002_RAPID_$i\\\"}}) { evaluation } }\"}" | \
    python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    if d['data']['evaluation']:
        r=d['data']['evaluation'][0]['evaluation']['report']
        print(f\"  Status: {r['status']}\")
        for t in r['tadpResult']['typologyResult']:
            print(f\"    {t['cfg']}: Score {t['result']}\")
    else:
        print('  No result yet')
except Exception as e:
    print(f'  Error: {e}')
"
done

echo ""
echo "=== Rule 904 Logs ==="
docker logs tazama-rule-904-1 --tail 20 2>&1 | grep -E "(Normal|Suspicious|High Risk|Critical)"
