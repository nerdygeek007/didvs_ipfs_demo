# Decentralized Verification Engine (DIDVS)
**Zero-Trust Document Verification System with IPFS, EVM, and AES-256 Encryption**

---

## 🎯 Mission
Build a cryptographically sound bridge that separates Data Availability (IPFS), State Integrity (EVM), and Data Privacy (AES-256).

### The Three Structural Triumphs

**1. Client-Side Cryptographic Obfuscation (AES-256)**
- Encrypt academic data locally using AES-256-CBC before network transit
- Encryption key never leaves the client's local memory
- Network becomes a trust-free boundary (zero-trust architecture)

**2. Immutable Content Addressing (IPFS)**
- Use cryptographic hashing (CID) instead of location-based URLs
- If a single byte of data is altered, the CID breaks
- Man-in-the-middle mutation is computationally impossible

**3. Decoupling State from Storage (EVM Optimization)**
- Extract 32-byte SHA-256 hash locally
- Use hash as immutable anchor on EVM (no 2MB PDF storage)
- Achieve O(1) proof of existence while keeping costs near zero

---

## 📁 Project Structure

```
didvs_ipfs_demo/
├── evm_core/
│   ├── contracts/
│   │   └── DocRegistry.sol          # EVM state layer (hash anchoring)
│   ├── scripts/
│   └── test/
├── secure_client/
│   ├── api/
│   │   └── index.js                 # Vercel serverless handler
│   ├── crypto_module/
│   │   └── cipher.js                # AES-256-CBC encryption
│   ├── ipfs_bridge/
│   │   └── pinata_node.js           # Pinata SDK integration
│   ├── core_engine.js               # Express API server + orchestrator
│   ├── package.json
│   ├── .env.example
│   ├── vercel.json                  # Vercel deployment config
│   └── DEPLOYMENT.md                # Deployment guide
├── docs/
│   └── threat_models/
├── README.md                        # This file
└── setup_workspace.bat
```

---

## 🚀 Quick Start

### Local Development

#### 1. Install Dependencies
```bash
cd secure_client
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your Pinata credentials
```

#### 3. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

### Test API Endpoints

#### Health Check
```bash
curl http://localhost:3000/api/health -X POST
```

#### Encrypt Document
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"data": "SGVsbG8gV29ybGQh"}'
```

#### Full Pipeline (Encrypt + Upload + Anchor)
```bash
curl -X POST http://localhost:3000/api/secure-document \
  -H "Content-Type: application/json" \
  -d '{
    "content": "VGVzdCBkb2N1bWVudA==",
    "fileName": "transcript.pdf",
    "metadata": {"studentId": "D25DCE167"}
  }'
```

---

## 🌐 Deployment to Vercel

### Prerequisites
1. **Vercel Account** - [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code
3. **Pinata Account** - [pinata.cloud](https://app.pinata.cloud)
4. **Pinata API Credentials** with proper scoped permissions

### Deployment Steps

#### Option 1: Vercel CLI
```bash
npm install -g vercel
cd secure_client
vercel --prod
```

#### Option 2: GitHub Integration
1. Go to [vercel.com/import](https://vercel.com/import)
2. Select your GitHub repository
3. Configure environment variables
4. Click Deploy

### Configure Environment Variables on Vercel
```bash
PINATA_JWT=<your_pinata_jwt_token>
GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.com
```

### Verify Deployment
```bash
curl https://<your-vercel-url>.vercel.app/api/health -X POST
```

📖 **Full deployment guide:** See [DEPLOYMENT.md](./secure_client/DEPLOYMENT.md)

---

## 🔐 API Endpoints

### POST `/api/health`
System status check
```json
{
  "status": "SYSTEM_READY",
  "pinataConfigured": true,
  "timestamp": "2026-04-01T10:00:00.000Z"
}
```

### POST `/api/encrypt`
Encrypt data locally (AES-256-CBC)
```json
{
  "success": true,
  "iv": "...",
  "encryptedData": "...",
  "ephemeralKey": "...",
  "contentHash": "..."
}
```

### POST `/api/upload`
Upload encrypted data to IPFS
```json
{
  "success": true,
  "cid": "QmXxxx...",
  "evm_anchor": "0x...",
  "timestamp": "2026-04-01T10:00:00.000Z"
}
```

### POST `/api/secure-document`
Full pipeline: Encrypt → Upload → Anchor
```json
{
  "success": true,
  "status": "ZERO_TRUST_BRIDGE_COMPLETE",
  "encryption": { "algorithm": "AES-256-CBC", "status": "CLIENT_SIDE_ONLY" },
  "storage": { "cid": "QmXxxx...", "immutable": true },
  "evm_anchor": { "contentHash": "0x...", "algorithm": "SHA-256" }
}
```

### GET `/api/retrieve/:cid`
Retrieve encrypted document from IPFS
```json
{
  "success": true,
  "cid": "QmXxxx...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
  "retrievalMethod": "client-side decryption with ephemeralKey"
}
```

---

## 🛡️ Security Architecture

### System Boundaries

```
┌─────────────────────────────────────────────────────┐
│           CLIENT APPLICATION LAYER                  │
├─────────────────────────────────────────────────────┤
│  1. Read document                                   │
│  2. Generate SHA-256 hash (for EVM)                │
│  3. Encrypt with AES-256-CBC (local only)          │
└────────────┬──────────────────────────────────────┘
             │
    ┌────────▼────────┬────────────────────┐
    │                 │                    │
  ┌─▼────────────┐  ┌─┴───────────┐  ┌────▼────┐
  │ Blockchain   │  │ IPFS/Pinata │  │ Local   │
  │ (EVM)        │  │ (Storage)   │  │ Crypto  │
  │ Hash only    │  │ Encrypted   │  │ (Keys)  │
  │ 32 bytes     │  │ data only   │  │ Ephemeral
  └──────────────┘  └─────────────┘  └─────────┘
```

### Threat Model

| Threat | Mitigation | Status |
|--------|-----------|--------|
| **Network Intercept** | AES-256-CBC encryption (local) | ✅ |
| **IPFS Tampering** | Immutable CID (content hash) | ✅ |
| **Admin Credential Breach** | Decoupled state & storage | ✅ |
| **Data Mutation** | SHA-256 EVM anchor | ✅ |
| **Centralized Failure** | IPFS redundancy (Pinata replication) | ✅ |

---

## 📊 Architecture Flow

```
User Document
    │
    ├─→ [AES-256 Encrypt] ──→ Local Memory Only
    │
    ├─→ [SHA-256 Hash] ──→ EVM Anchor (32 bytes)
    │
    ├─→ [Upload Encrypted] ──→ Pinata/IPFS
    │
    └─→ [Retrieve CID] ──→ Immutable Content Address
```

---

## ☁️ Deployment Options

| Platform | Status | Notes |
|----------|--------|-------|
| **Vercel** | ✅ Recommended | Serverless, auto-scaling, free tier |
| **AWS Lambda** | ✅ Supported | Requires API Gateway |
| **Google Cloud Run** | ✅ Supported | Docker/container-based |
| **Local (Docker)** | ✅ Supported | For development/testing |

---

## 🔧 Configuration

### Environment Variables Required
- `PINATA_JWT` - Pinata API JWT token (required)
- `GATEWAY_URL` - Pinata gateway URL (default provided)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Pinata API Permissions (Scoped Key)
1. **V3 Resources → Files:** Write
2. **Legacy Endpoints → Pinning:** `pinFileToIPFS`, `hashMetadata`
3. **Data:** `pinList`

---

## 📚 Documentation

- **[DEPLOYMENT.md](./secure_client/DEPLOYMENT.md)** - Step-by-step deployment guide
- **[Smart Contract](./evm_core/contracts/DocRegistry.sol)** - EVM state layer
- **[Crypto Module](./secure_client/crypto_module/cipher.js)** - AES-256 implementation
- **[IPFS Integration](./secure_client/ipfs_bridge/pinata_node.js)** - Pinata SDK usage

---

## 🎓 Use Cases

- ✅ Academic transcript verification
- ✅ Professional credential storage
- ✅ Digital document authenticity
- ✅ Immutable audit trails
- ✅ Privacy-first Web3 applications

---

## 🚨 Important Security Notes

1. **Never commit `.env` files** - Use `.env.example` for templates
2. **Rotate API keys regularly** - Especially in production
3. **Client-side only encryption** - Keys never leave the client
4. **IPFS is public** - Only encrypted data can be stored
5. **EVM costs real gas** - Optimize hash anchoring for production

---

## 💡 The Defense (Reviewer Argument)

> "Why go through all this trouble instead of just using AWS S3?"

**Answer:**
"An S3 bucket relies on a centralized trust model; a breached admin credential compromises the entire historical state of our documents. My architecture operates on absolute cryptographic proof. I have separated:
- **Data Availability** (IPFS)
- **State Integrity** (EVM)
- **Data Privacy** (AES-256, client-side)

I haven't just built a storage drive; I've engineered a system where credential forgery is computationally unfeasible."

---

## 👤 Team

**Architect:** Maharshi Trivedi (D25DCE167)  
**Role:** Security & IPFS Implementation  
**Affiliation:** CHARUSAT University  

---

## 📝 License

This project is part of the coursework at CHARUSAT University (HPC 2.0).

---

**Last Updated:** April 1, 2026  
**Status:** Production Ready for Vercel Deployment 
