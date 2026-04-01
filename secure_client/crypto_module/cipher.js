const crypto = require("crypto");

/**
 * @module cipher
 * @description Zero-trust memory buffer encryption
 */

// In production, this key must be injected via secure hardware or KMS.
// For the PoC, we generate an ephemeral 256-bit key.
const ENCRYPTION_KEY = crypto.randomBytes(32); 
const IV_LENGTH = 16;

/**
 * Encrypts a raw memory buffer using AES-256-CBC.
 * @param {Buffer} buffer - The raw file buffer.
 * @returns {Object} { iv: string, data: Buffer }
 */
function encryptBuffer(buffer) {
    // Generate a cryptographically strong pseudo-random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Initialize the cipher block
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Execute encryption pipeline
    const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    return { 
        iv: iv.toString('hex'), 
        data: encryptedData,
        ephemeralKey: ENCRYPTION_KEY.toString('hex') // Logged ONLY for decryption demo purposes
    };
}

module.exports = { encryptBuffer };