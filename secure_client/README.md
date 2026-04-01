# Simple IPFS Document Uploader

A minimal MetaMask + IPFS document uploader that hashes files with SHA256 and stores them on IPFS.

## Features
- 🔗 MetaMask wallet connection
- 📄 File upload to IPFS
- 🔒 SHA256 hashing
- 🌐 IPFS storage via Pinata
- 🚀 Simple Express server

## Quick Start

1. **Install dependencies:**
   ```bash
   cd secure_client
   npm install
   ```

2. **Set up environment:**
   Create a `.env` file with your Pinata JWT:
   ```
   PINATA_JWT=your_pinata_jwt_here
   PORT=3000
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Open the uploader:**
   Open `index.html` in your browser

5. **Connect MetaMask and upload:**
   - Click "Connect MetaMask"
   - Choose a file
   - Click "Upload to IPFS"

## API

### POST /upload
Upload a document to IPFS with SHA256 hash.

**Request:**
```json
{
  "fileName": "document.pdf",
  "content": "base64_encoded_file_content"
}
```

**Response:**
```json
{
  "success": true,
  "cid": "Qm...",
  "sha256Hash": "a665a459...",
  "fileName": "document.pdf",
  "fileSize": 12345,
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

## Requirements
- Node.js
- MetaMask browser extension
- Pinata account with JWT token