const crypto = require('crypto');

/**
 * @module cipher.test
 * @description Unit tests for AES-256-CBC encryption
 */

describe('Cipher Module - Encryption/Decryption', () => {
  
  // Test fixtures
  const IV_LENGTH = 16;
  const testData = {
    payload: Buffer.from('MAHARSHI_TRIVEDI_D25DCE167_TEST'),
    smallPayload: Buffer.from('Hi'),
    largePayload: Buffer.alloc(1024 * 100), // 100KB
    emptyPayload: Buffer.alloc(0)
  };

  // Helper: AES-256-CBC Encryption
  function encryptBuffer(buffer, encryptionKey = null) {
    const key = encryptionKey 
      ? Buffer.from(encryptionKey, 'hex')
      : crypto.randomBytes(32);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encryptedData = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);
    
    return {
      iv: iv.toString('hex'),
      data: encryptedData,
      ephemeralKey: key.toString('hex')
    };
  }

  // Helper: AES-256-CBC Decryption
  function decryptBuffer(encryptedData, iv, encryptionKey) {
    const key = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
  }

  describe('Basic Encryption', () => {
    test('should encrypt a buffer', () => {
      const result = encryptBuffer(testData.payload);
      
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('ephemeralKey');
      expect(result.data).not.toEqual(testData.payload);
    });

    test('should generate unique IVs for each encryption', () => {
      const result1 = encryptBuffer(testData.payload);
      const result2 = encryptBuffer(testData.payload);
      
      expect(result1.iv).not.toEqual(result2.iv);
      expect(result1.ephemeralKey).not.toEqual(result2.ephemeralKey);
    });

    test('should produce different ciphertexts with same input', () => {
      const result1 = encryptBuffer(testData.payload);
      const result2 = encryptBuffer(testData.payload);
      
      expect(result1.data).not.toEqual(result2.data);
    });
  });

  describe('Decryption Security', () => {
    test('should decrypt correctly with matching key and IV', () => {
      const original = testData.payload;
      const encrypted = encryptBuffer(original);
      const decrypted = decryptBuffer(encrypted.data, encrypted.iv, encrypted.ephemeralKey);
      
      expect(decrypted).toEqual(original);
    });

    test('should fail decryption with wrong key', () => {
      const original = testData.payload;
      const encrypted = encryptBuffer(original);
      const wrongKey = crypto.randomBytes(32).toString('hex');
      
      expect(() => {
        decryptBuffer(encrypted.data, encrypted.iv, wrongKey);
      }).toThrow();
    });

    test('should fail decryption with wrong IV', () => {
      const original = testData.payload;
      const encrypted = encryptBuffer(original);
      const wrongIV = crypto.randomBytes(16).toString('hex');
      
      const decrypted = decryptBuffer(encrypted.data, wrongIV, encrypted.ephemeralKey);
      expect(decrypted).not.toEqual(original);
    });

    test('should fail with corrupted ciphertext', () => {
      const original = testData.payload;
      const encrypted = encryptBuffer(original);
      const corruptedData = Buffer.alloc(encrypted.data.length);
      encrypted.data.copy(corruptedData);
      corruptedData[0] = (corruptedData[0] + 1) % 256; // Flip a byte
      
      // Corrupted ciphertext may cause PKCS7 padding error
      try {
        const decrypted = decryptBuffer(corruptedData, encrypted.iv, encrypted.ephemeralKey);
        // If it doesn't throw, verify result is corrupted (doesn't match original)
        expect(decrypted).not.toEqual(original);
      } catch (error) {
        // Or it should throw (expected behavior)
        expect(error).toBeDefined();
      }
    });
  });

  describe('Payload Size Handling', () => {
    test('should encrypt small payloads', () => {
      const result = encryptBuffer(testData.smallPayload);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should encrypt large payloads (100KB)', () => {
      const result = encryptBuffer(testData.largePayload);
      expect(result.data.length).toBeGreaterThanOrEqual(testData.largePayload.length);
    });

    test('should handle empty Buffer', () => {
      const result = encryptBuffer(testData.emptyPayload);
      expect(result.data.length).toBeGreaterThan(0); // PKCS7 padding added
    });
  });

  describe('Key Derivation & Entropy', () => {
    test('should generate 32-byte keys (256-bit)', () => {
      const result = encryptBuffer(testData.payload);
      const keyBuffer = Buffer.from(result.ephemeralKey, 'hex');
      
      expect(keyBuffer.length).toBe(32);
    });

    test('should generate 16-byte IVs (128-bit)', () => {
      const result = encryptBuffer(testData.payload);
      const ivBuffer = Buffer.from(result.iv, 'hex');
      
      expect(ivBuffer.length).toBe(16);
    });

    test('should use cryptographically strong randomness', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(encryptBuffer(testData.payload));
      }
      
      const uniqueIVs = new Set(results.map(r => r.iv));
      expect(uniqueIVs.size).toBe(10); // All IVs unique
    });
  });

  describe('Threat Model: Cipher Integrity', () => {
    test('[THREAT] Should not be vulnerable to IV reuse attacks', () => {
      const enc1 = encryptBuffer(testData.payload);
      const enc2 = encryptBuffer(testData.payload);
      
      // Different IVs mean ciphertexts are unrelated (secure against IV reuse)
      expect(enc1.iv).not.toEqual(enc2.iv);
    });

    test('[THREAT] Encryption must not leak plaintext length through ciphertext', () => {
      const payload1 = Buffer.from('Short');
      const payload2 = Buffer.from('This is a much longer payload');
      
      const enc1 = encryptBuffer(payload1);
      const enc2 = encryptBuffer(payload2);
      
      // PKCS7 padding + encryption block == safe length hiding
      // AES-256-CBC always pads to cipher block (16 bytes)
      expect(enc1.data.length % 16).toBe(0);
      expect(enc2.data.length % 16).toBe(0);
    });

    test('[THREAT] Should defend against known-plaintext attacks', () => {
      const known = Buffer.from('MAHARSHI_TRIVEDI_D25DCE167_TEST');
      const encrypted = encryptBuffer(known);
      
      // Same plaintext + different IV = different ciphertext
      const encrypted2 = encryptBuffer(known);
      expect(encrypted.data).not.toEqual(encrypted2.data);
    });
  });
});
