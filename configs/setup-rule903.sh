#!/bin/bash
# Script untuk setup Rule 903 di Tazama
# Jalankan setelah Tazama sudah running

echo "=============================================="
echo "  Setup Rule 903 - Large Transaction Detection"
echo "=============================================="

# 1. Insert Rule Configuration
echo ""
echo "Step 1: Insert Rule 903 Configuration..."
docker exec tazama-postgres-1 psql -U postgres -d configuration -c "
INSERT INTO rule (configuration) VALUES ('{
  \"id\": \"903@1.0.0\",
  \"cfg\": \"1.0.0\",
  \"desc\": \"Large Transaction Detection\",
  \"tenantId\": \"DEFAULT\",
  \"config\": {
    \"bands\": [
      {\"subRuleRef\": \".01\", \"lowerLimit\": 0, \"upperLimit\": 1000000, \"reason\": \"Normal transaction\"},
      {\"subRuleRef\": \".02\", \"lowerLimit\": 1000000, \"upperLimit\": 5000000, \"reason\": \"Medium transaction\"},
      {\"subRuleRef\": \".03\", \"lowerLimit\": 5000000, \"upperLimit\": 10000000, \"reason\": \"Large transaction - ALERT\"},
      {\"subRuleRef\": \".04\", \"lowerLimit\": 10000000, \"upperLimit\": 999999999999, \"reason\": \"Very large - INTERDICTION\"}
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
  \"cfg\": \"903-Large-Transaction\",
  \"typology_name\": \"Large-Transaction-Alert\",
  \"tenantId\": \"DEFAULT\",
  \"rules\": [
    {
      \"id\": \"903@1.0.0\",
      \"cfg\": \"1.0.0\",
      \"termId\": \"v903at100at100\",
      \"wghts\": [
        {\"ref\": \".err\", \"wght\": \"0\"},
        {\"ref\": \".x00\", \"wght\": \"0\"},
        {\"ref\": \".01\", \"wght\": \"0\"},
        {\"ref\": \".02\", \"wght\": \"100\"},
        {\"ref\": \".03\", \"wght\": \"300\"},
        {\"ref\": \".04\", \"wght\": \"500\"}
      ]
    },
    {
      \"id\": \"EFRuP@1.0.0\",
      \"cfg\": \"none\",
      \"termId\": \"vEFRuPat100atnone\",
      \"wghts\": [{\"ref\": \"none\", \"wght\": \"0\"}]
    }
  ],
  \"expression\": [\"Add\", \"v903at100at100\"],
  \"workflow\": {
    \"flowProcessor\": \"EFRuP@1.0.0\",
    \"alertThreshold\": 200,
    \"interdictionThreshold\": 400
  }
}'::jsonb)
ON CONFLICT (typologyid, typologycfg, tenantid) DO UPDATE SET configuration = EXCLUDED.configuration;
"

# 3. Update Network Map
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
        }
      ]
    }
  ]
}'::jsonb
WHERE tenantid = 'DEFAULT';
"

# 4. Create set_tenant_id function (fix bug)
echo ""
echo "Step 4: Create set_tenant_id function..."
for db in configuration event_history raw_history; do
  docker exec tazama-postgres-1 psql -U postgres -d $db -c "
  CREATE OR REPLACE FUNCTION public.set_tenant_id(tenant_id text)
  RETURNS void AS \\\$\\\$
  BEGIN
    PERFORM set_config('app.tenant_id', tenant_id, false);
  END;
  \\\$\\\$ LANGUAGE plpgsql;
  " 2>/dev/null
done

# 5. Restart processors
echo ""
echo "Step 5: Restart processors..."
docker restart tazama-ed-1 tazama-tp-1 tazama-tadp-1 2>/dev/null

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo ""
echo "  Jangan lupa deploy rule-903 container:"
echo "  docker compose -f docker-compose.rule-903.yaml -p tazama up -d"
echo "=============================================="
