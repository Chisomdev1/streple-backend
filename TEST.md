# Register users
Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"pro@streple.com","password":"Pro123"}'
Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"follower@streple.com","password":"Follow123"}'

# Login and save tokens
$proLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"pro@streple.com","password":"Pro123"}'
$flwLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"follower@streple.com","password":"Follow123"}'

$PRO = $proLogin.access_token
$FLW = $flwLogin.access_token

# Upgrade pro to PRO_TRADER
Invoke-RestMethod -Uri "http://localhost:3000/users/toggle-role" -Method PATCH `
  -Headers @{ Authorization = "Bearer $PRO"; "Content-Type" = "application/json" } `
  -Body '{"role":"PRO_TRADER"}'

# Follower top up balance
Invoke-RestMethod -Uri "http://localhost:3000/users/demo-balance/top-up" -Method PATCH `
  -Headers @{ Authorization = "Bearer $FLW"; "Content-Type" = "application/json" } `
  -Body '{"amount":1000}'

# Get Pro ID
$me = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Headers @{ Authorization = "Bearer $PRO" }
$PRO_ID = $me.id

# Subscribe follower to Pro
Invoke-RestMethod -Uri "http://localhost:3000/copy/subscribe" -Method POST `
  -Headers @{ Authorization = "Bearer $FLW"; "Content-Type" = "application/json" } `
  -Body "{ \"proTraderId\": \"$PRO_ID\", \"allocate\": 500 }"

# Pro publishes a signal
$signal = Invoke-RestMethod -Uri "http://localhost:3000/copy/signals" -Method POST `
  -Headers @{ Authorization = "Bearer $PRO"; "Content-Type" = "application/json" } `
  -Body '{"symbol":"BTCUSDT","direction":"buy","amount":0.1,"stopLoss":58000,"takeProfit":62000}'
$SIG = $signal.id

# Follower executes signal
Invoke-RestMethod -Uri "http://localhost:3000/copy/execute" -Method POST `
  -Headers @{ Authorization = "Bearer $FLW"; "Content-Type" = "application/json" } `
  -Body "{ \"signalId\": \"$SIG\" }"

# View follower wallet and trade history
Invoke-RestMethod -Uri "http://localhost:3000/users/wallets" -Headers @{ Authorization = "Bearer $FLW" } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "http://localhost:3000/copy/history" -Headers @{ Authorization = "Bearer $FLW" } | ConvertTo-Json -Depth 10

# Close trade (use first trade ID)
$history = Invoke-RestMethod -Uri "http://localhost:3000/copy/history" -Headers @{ Authorization = "Bearer $FLW" }
$TRADE = $history[0].id

Invoke-RestMethod -Uri "http://localhost:3000/copy/close/$TRADE" -Method PATCH

# Final balance check
Invoke-RestMethod -Uri "http://localhost:3000/users/demo-balance" -Headers @{ Authorization = "Bearer $FLW" } | ConvertTo-Json -Depth 10

# For login as a pro
$proLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"pro@streple.com","password":"Protader"}'

$PRO = $proLogin.access_token

# For posting signals
$signal = Invoke-RestMethod -Uri "http://localhost:3000/copy/signals" -Method POST `
  -Headers @{ Authorization = "Bearer $PRO"; "Content-Type" = "application/json" } `
  -Body '{"symbol":"BTCUSDT","direction":"buy","amount":0.1,"stopLoss":58000,"takeProfit":62000}'
