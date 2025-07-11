# RWA1155 API Documentation

## 🚀 Endpoints

### Contract Info
- `GET /` - Health check
- `GET /contract/info` - Get contract information

### Tokens
- `POST /mint` - Mint new RWA token
- `GET /balance/:address/:tokenId` - Get balance
- `POST /balances/batch` - Get batch balances
- `GET /rwa/:tokenId` - Get RWA data
- `GET /uri/:tokenId` - Get token URI
- `GET /user/:address/tokens` - Get all user tokens

### Transfers
- `POST /transfer` - Transfer tokens

## 📝 Examples

### Mint Token
```bash
curl -X POST http://localhost:3001/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "amount": 100,
    "rwaType": "fan_token_revenue",
    "percent": 25,
    "metadataURI": "ipfs://QmYourCID/metadata.json"
  }'
```

### Get Balance
```bash
curl http://localhost:3001/balance/0x.../1
```

### Get User Tokens
```bash
curl http://localhost:3001/user/0x.../tokens
```