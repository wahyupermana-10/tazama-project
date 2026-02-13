#!/bin/bash
# Script untuk setup Rule 904 di Tazama
# Rule 904: Rapid Transaction Detection - Deteksi transaksi berulang dalam 1 menit

echo "=============================================="
echo "  Setup Rule 904 - Rapid Transaction Detection"
echo "=============================================="

# 1. Insert Rule Configuration
echo ""
echo "Step 1: Insert Rule 904 Configuration..."
docker exec tazama-postgres-1 psql -U postgres -d configuration -c "
INSERT INTO rule (configuration) VALUES ('{
  \"id\": \"904@1.0.0\",
  \"cfg\": \"1.0.0\",
  \"desc\": \"Rapid Transaction Detection - Deteksi transaksi berulang dalam 1 menit\",
  \"tenantId\": \"DEFAULT\",
  \"config\": {
    \"parameters\": {
      \"timeWindowMs\": 60000
    },
    \"bands\": [
      {\"subRuleRef\": \".01\", \"lowerLimit\": 0, \"upperLimit\": 2, \"reason\": \"Normal - 1 transaksi dalam 1 menit\"},
      {\"subRuleRef\": \".02\", \"lowerLimit\": 2, \"upperLimit\": 4, \"reason\": \"Suspicious - 2-3 transaksi dalam 1 menit\"},
      {\"subRuleRef\": \".03\", \"lowerLimit\": 4, \"upperLimit\": 6, \"reason\": \"High Risk - 4-5 transaksi dalam 1 menit\"},
      {\"subRuleRef\": \".04\", \"lowerLimit\": 6, \"upperLimit\": 999999, \"reason\": \"Critical - 6+ transaksi dalam 1 menit\"}
    ],
    \"exitConditions\": [{\"subRuleRef\": \".x00\", \"reason\": \"Unsuccessful transaction\"}]
  }
}'::jsonb)
ON CONFLICT (ruleid, rulecfg, tenantid) DO UPDATE SET configuration = EXCLUDED.configuration;
"

# 2. Insert Typology Configuration
echo ""
echo "Step 2: Insert Typology Configuration..."
docker exec tazama-postgres-1 psql -U postgres -d configuration -c "
INSERT INTO typology (configuration) VALUES ('{
  \"id\": \"typology-processor@1.0.0\",
  \"cfg\": \"904-Rapid-Transaction\",
  \"typology_name\": \"Rapid-Transaction-Alert\",
  \"tenantId\": \"DEFAULT\",
  \"rules\": [
    {
      \"id\": \"904@1.0.0\",
      \"cfg\": \"1.0.0\",
      \"termId\": \"v904at100at100\",
      \"wghts\": [
        {\"ref\": \".err\", \"wght\": \"0\"},
        {\"ref\": \".x00\", \"wght\": \"0\"},
        {\"ref\": \".00\", \"wght\": \"0\"},
        {\"ref\": \".01\", \"wght\": \"0\"},
        {\"ref\": \".02\", \"wght\": \"200\"},
        {\"ref\": \".03\", \"wght\": \"400\"},
        {\"ref\": \".04\", \"wght\": \"600\"}
      ]
    },
    {
      \"id\": \"EFRuP@1.0.0\",
      \"cfg\": \"none\",
      \"termId\": \"vEFRuPat100atnone\",
      \"wghts\": [{\"ref\": \"none\", \"wght\": \"0\"}]
    }
  ],
  \"expression\": [\"Add\", \"v904at100at100\"],
  \"workflow\": {
    \"flowProcessor\": \"EFRuP@1.0.0\",
    \"alertThreshold\": 200,
    \"interdictionThreshold\": 400
  }
}'::jsonb)
ON CONFLICT (typologyid, typologycfg, tenantid) DO UPDATE SET configuration = EXCLUDED.configuration;
"

# 3. Update Network Map untuk include Rule 904
echo ""
echo "Step 3: Update Network Map..."
docker exec tazama-postgres-1 psql -U postgres -d configuration -c "
UPDATE network_map SET configuration = '{
  \"cfg\": \"1.0.0\",
  \"name\": \"Public Network Map\",
  \"active\": true,
  \"tenantId\": \"DEFAULT\",
  \"messages\": [
    {
      \"id\": \"004@1.0.0\",
      \"cfg\": \"1.0.0\",
      \"txTp\": \"pacs.002.001.12\",
      \"typologies\": [
        {
          \"id\": \"typology-processor@1.0.0\",
          \"cfg\": \"999@1.0.0\",
          \"tenantId\": \"DEFAULT\",
          \"rules\": [
            {\"id\": \"EFRuP@1.0.0\", \"cfg\": \"none\"},
            {\"id\": \"901@1.0.0\", \"cfg\": \"1.0.0\"},
            {\"id\": \"902@1.0.0\", \"cfg\": \"1.0.0\"}
          ]
        },
        {
          \"id\": \"typology-processor@1.0.0\",
          \"cfg\": \"903-Large-Transaction\",
          \"tenantId\": \"DEFAULT\",
          \"rules\": [
            {\"id\": \"EFRuP@1.0.0\", \"cfg\": \"none\"},
            {\"id\": \"903@1.0.0\", \"cfg\": \"1.0.0\"}
          ]
        },
        {
          \"id\": \"typology-processor@1.0.0\",
          \"cfg\": \"904-Rapid-Transaction\",
          \"tenantId\": \"DEFAULT\",
          \"rules\": [
            {\"id\": \"EFRuP@1.0.0\", \"cfg\": \"none\"},
            {\"id\": \"904@1.0.0\", \"cfg\": \"1.0.0\"}
          ]
        }
      ]
    }
  ]
}'::jsonb
WHERE tenantid = 'DEFAULT';
"

# 4. Restart processors
echo ""
echo "Step 4: Restart processors..."
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1 2>/dev/null

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo ""
echo "  Konfigurasi Rule 904:"
echo "  - 1 transaksi/menit    → Normal (skor 0)"
echo "  - 2-3 transaksi/menit  → Suspicious (skor 200) - ALERT"
echo "  - 4-5 transaksi/menit  → High Risk (skor 400) - INTERDICTION"
echo "  - 6+ transaksi/menit   → Critical (skor 600) - INTERDICTION"
echo ""
echo "  Deploy rule-904 container:"
echo "  cd Full-Stack-Docker-Tazama-dev"
echo "  docker compose -f docker-compose.rule-904.yaml -p tazama up -d"
echo "=============================================="
