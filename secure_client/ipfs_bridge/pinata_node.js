// Content-Addressable Storage Logic 
const { PinataSDK } = require("pinata");
require("dotenv").config();

/**
 * @module pinata_node
 * @description Interfacing with IPFS Distributed Hash Table (DHT)
 */

// Initialize the external node connection
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

/**
 * Pushes an encrypted buffer to the IPFS network.
 * @param {Buffer} encryptedBuffer - The AES-256 ciphertext.
 * @param {string} fileName - The identifier for the IPFS metadata.
 * @returns {Promise<string>} The immutable Content Identifier (CID).
 */
async function pushToNetwork(encryptedBuffer, fileName = "secure_payload.bin") {
    try {
        // Convert Node.js Buffer to standard Blob for the SDK boundary
        const blob = new Blob([encryptedBuffer]);
        const file = new File([blob], fileName, { type: "application/octet-stream" });
        
        // Execute network egress
        const upload = await pinata.upload.public.file(file);
        
        return upload.cid;
    } catch (error) {
        throw new Error(`[NETWORK_FAULT] Egress to IPFS node failed: ${error.message}`);
    }
}

module.exports = { pushToNetwork };