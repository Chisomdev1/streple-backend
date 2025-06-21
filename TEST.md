# Full cURL Test‑Drive

Run these commands in terminal

```bash
# Register users
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@streple.com","password":"Pro123"}'

curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"follower@streple.com","password":"Follow123"}'

# Login and save tokens
PRO=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@streple.com","password":"Pro123"}' | jq -r .access_token)

FLW=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"follower@streple.com","password":"Follow123"}' | jq -r .access_token)

# Upgrade pro to PRO_TRADER
curl -X PATCH http://localhost:3000/users/toggle-role \
  -H "Authorization: Bearer $PRO" \
  -H "Content-Type: application/json" \
  -d '{"role":"PRO_TRADER"}'

# Follower top up funding balance
curl -X PATCH http://localhost:3000/users/demo-balance/top-up \
  -H "Authorization: Bearer $FLW" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

# Get Pro ID
PRO_ID=$(curl -s -H "Authorization: Bearer $PRO" http://localhost:3000/users/me | jq -r .id)

# Subscribe follower to Pro
curl -X POST http://localhost:3000/copy/subscribe \
  -H "Authorization: Bearer $FLW" \
  -H "Content-Type: application/json" \
  -d "{\"proTraderId\":\"$PRO_ID\",\"allocate\":500}"

# Pro publishes a signal
SIG=$(curl -s -X POST http://localhost:3000/copy/signals \
  -H "Authorization: Bearer $PRO" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","direction":"buy","amount":0.1,"stopLoss":58000,"takeProfit":62000}' | jq -r .id)

# Follower executes signal
curl -X POST http://localhost:3000/copy/execute \
  -H "Authorization: Bearer $FLW" \
  -H "Content-Type: application/json" \
  -d "{\"signalId\":\"$SIG\"}"

# View wallets & trade history
curl -H "Authorization: Bearer $FLW" http://localhost:3000/users/wallets | jq
curl -H "Authorization: Bearer $FLW" http://localhost:3000/copy/history | jq

# Close trade (admin or cron)
TRADE=$(curl -s -H "Authorization: Bearer $FLW" http://localhost:3000/copy/history | jq -r '.[0].id')
curl -X PATCH http://localhost:3000/copy/close/$TRADE

# Check final funding balance
curl -H "Authorization: Bearer $FLW" http://localhost:3000/users/demo-balance | jq

```
