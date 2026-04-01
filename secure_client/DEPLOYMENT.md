# Deployment Guide: Vercel + IPFS + EVM

## Overview
This guide walks you through deploying the Zero-Trust Document Verification Engine to Vercel.

---

## Prerequisites
1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Pinata Account** - Create account at [pinata.cloud](https://app.pinata.cloud)
4. **Pinata API Key** - Generate scoped key with proper permissions

### Pinata API Permissions (Required)
Navigate to **Pinata Dashboard → Developers → API Keys → Create Key**:
- **V3 Resources → Files:** Write
- **Legacy Endpoints → Pinning:** `pinFileToIPFS`, `hashMetadata`
- **Data:** `pinList`

Save the following:
- `PINATA_JWT` (JWT Token)
- API Key
- API Secret

---

## Step 1: Configure Environment Variables

### Local Development
```bash
cd secure_client
cp .env.example .env
```

Edit `.env`:
```
PINATA_JWT="your_pinata_jwt_token_here"
GATEWAY_URL="https://gateway.pinata.cloud/ipfs/"
NODE_ENV="development"
ALLOWED_ORIGINS="*"
```

### Test Local Server
```bash
npm install
npm start
```

Visit: `http://localhost:3000`

Expected response:
```json
{
  "service": "Decentralized Document Verification Engine",
  "status": "ONLINE"
}
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project
cd secure_client

# Deploy
vercel --prod
```

When prompted:
- **Project Name:** `didvs-secure-client`
- **Framework:** Select "Other"
- **Environment Variables:** Add during deployment

### Option B: GitHub Integration (Automatic)
1. Push code to GitHub
2. Go to [vercel.com/import](https://vercel.com/import)
3. Select your GitHub repository
4. Configure environment variables before deploy
5. Click "Deploy"

---

## Step 3: Add Environment Variables on Vercel

### Via Vercel Dashboard
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add the following:

| Variable | Value | Scope |
|----------|-------|-------|
| `PINATA_JWT` | Your Pinata JWT | Production, Preview, Development |
| `GATEWAY_URL` | `https://gateway.pinata.cloud/ipfs/` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `ALLOWED_ORIGINS` | Your frontend domain | Production |

### Via CLI
```bash
vercel env add PINATA_JWT
# Enter the JWT token when prompted
```

---

## Step 4: Verify Deployment

Once deployed, Vercel will provide a URL (e.g., `https://didvs-secure-client.vercel.app`)

### Health Check
```bash
curl https://didvs-secure-client.vercel.app/api/health -X POST
```

Expected response:
```json
{
  "status": "SYSTEM_READY",
  "timestamp": "2026-04-01T10:00:00.000Z",
  "pinataConfigured": true
}
```

---

## Step 5: Test API Endpoints

### 1. Encrypt Document Locally
```bash
curl -X POST https://didvs-secure-client.vercel.app/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "data": "SGVsbG8gV29ybGQgLSBNQUhBUlNISV9UUklWRURJX0QyNURDRTE2Nw=="
  }'
```

### 2. Secure Document (Full Pipeline)
```bash
curl -X POST https://didvs-secure-client.vercel.app/api/secure-document \
  -H "Content-Type: application/json" \
  -d '{
    "content": "VGhpcyBpcyBhIHRlc3QgZG9jdW1lbnQgZm9yIElQRlMgV2ViMyBkZWNlbnRyYWxpemF0aW9u",
    "fileName": "transcript.pdf",
    "metadata": {
      "studentId": "D25DCE167",
      "university": "CHARUSAT"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "status": "ZERO_TRUST_BRIDGE_COMPLETE",
  "encryption": {
    "algorithm": "AES-256-CBC",
    "status": "CLIENT_SIDE_ONLY"
  },
  "storage": {
    "cid": "QmXxxx...",
    "provider": "Pinata/IPFS",
    "immutable": true
  },
  "evm_anchor": {
    "contentHash": "0x...",
    "algorithm": "SHA-256"
  }
}
```

---

## Troubleshooting

### Issue: "MISSING_CREDENTIALS"
**Solution:** Verify environment variables are set in Vercel dashboard:
```bash
vercel env list
```

### Issue: "IPFS upload failed"
**Solution:** Check Pinata credentials and permissions:
1. Verify JWT token in Pinata dashboard
2. Ensure API key has "Files: Write" permission
3. Check Pinata account status (quota/limits)

### Issue: CORS Errors
**Solution:** Update `ALLOWED_ORIGINS` environment variable:
```bash
vercel env add ALLOWED_ORIGINS "https://your-frontend-domain.com"
```

### Issue: Timeout (>30 seconds)
**Solution:** Break large uploads into chunks or optimize encryption:
- Vercel functions have 30-second timeout by default
- Upgrade to higher tier for longer timeouts

---

## Monitoring & Logs

### View Real-time Logs
```bash
vercel logs <project-identifier>
```

### View Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View deployments, logs, and performance metrics

---

## Architecture Deployed

```
┌─────────────────────────────────────────┐
│      VERCEL (Serverless Functions)      │
├─────────────────────────────────────────┤
│  POST /api/encrypt                      │
│  POST /api/upload                       │
│  POST /api/secure-document              │
│  GET  /api/retrieve/:cid                │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐    ┌─────────────┐
        │ AES-256-CBC │    │  Pinata/    │
        │ Encryption  │───▶│   IPFS      │
        └─────────────┘    └─────┬───────┘
                                 │
                          ┌──────▼────────┐
                          │  Immutable    │
                          │  CID         │
                          └───────────────┘
```

---

## Security Considerations

✅ **Implemented:**
- Client-side AES-256-CBC encryption
- No plaintext data transmitted
- Immutable IPFS content addressing
- Minimal EVM on-chain footprint

⚠️ **Recommendations:**
- Implement API authentication (JWT, OAuth)
- Add rate limiting to prevent abuse
- Monitor Pinata quota usage
- Rotate Pinata API keys regularly
- Use HTTPS only (Vercel provides automatic)

---

## Next Steps

1. **Frontend Integration** - Build UI to call these endpoints
2. **Smart Contract** - Deploy `DocRegistry.sol` to testnet
3. **EVM Anchoring** - Integrate smart contract calls
4. **Production Hardening** - Add auth, logging, monitoring

---

**Architect:** Maharshi Trivedi (D25DCE167)  
**Last Updated:** April 1, 2026
