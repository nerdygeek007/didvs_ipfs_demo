const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { PinataSDK } = require('pinata');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static('.'));

// Initialize Pinata
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/"
});

/**
 * Generate SHA256 hash of file content
 */
function generateSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Upload file to IPFS
 */
async function uploadToIPFS(buffer, fileName) {
  try {
    const blob = new Blob([buffer]);
    const file = new File([blob], fileName, { type: 'application/octet-stream' });

    const upload = await pinata.upload.file(file);
    return upload.cid;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

// Routes

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    message: 'Simple IPFS Document Uploader',
    endpoints: {
      'POST /upload': 'Upload document to IPFS with SHA256 hash'
    }
  });
});

/**
 * POST /upload - Upload document to IPFS
 * Body: { fileName: string, content: base64_string }
 */
app.post('/upload', async (req, res) => {
  try {
    const { fileName, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(content, 'base64');

    // Generate SHA256 hash
    const sha256Hash = generateSHA256(buffer);

    // Upload to IPFS
    const cid = await uploadToIPFS(buffer, fileName || 'document.bin');

    res.json({
      success: true,
      cid: cid,
      sha256Hash: sha256Hash,
      fileName: fileName,
      fileSize: buffer.length,
      timestamp: new Date().toISOString(),
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      note: "⚡ IMMEDIATE ACCESS: Use the Pinata gateway link. Other gateways may take 5-15 minutes to load as content propagates across IPFS network.",
      alternativeGateways: [
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`
      ]
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple IPFS Uploader running on http://localhost:${PORT}`);
  console.log(`📁 Upload endpoint: POST /upload`);
});