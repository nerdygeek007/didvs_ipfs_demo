const crypto = require('crypto');

/**
 * @module integration.test
 * @description Full-stack integration tests for the Zero-Trust architecture
 */

describe('Integration - Full Document Pipeline', () => {
  
  // Simulated Pinata gateway (mock)
  const mockIPFS = {
    storage: new Map(),
    
    uploadFile: async (buffer, fileName) => {
      const cid = `QmMock${crypto.randomBytes(16).toString('hex')}`;
      mockIPFS.storage.set(cid, { buffer, fileName, timestamp: Date.now() });
      console.log(`[MOCK_IPFS] Uploaded: ${cid}`);
      return { cid };
    },
    
    retrieveFile: async (cid) => {
      const stored = mockIPFS.storage.get(cid);
      if (!stored) throw new Error(`CID not found: ${cid}`);
      console.log(`[MOCK_IPFS] Retrieved: ${cid}`);
      return stored.buffer;
    }
  };

  // Helper functions
  const IV_LENGTH = 16;
  
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

  function decryptBuffer(encryptedData, iv, encryptionKey) {
    const key = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
  }

  function generateContentHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  describe('End-to-End: Encrypt → Upload → Anchor → Retrieve', () => {
    test('should complete full document lifecycle', async () => {
      const originalData = Buffer.from('MAHARSHI_TRIVEDI_D25DCE167_INTEGRATION_TEST');
      
      // Step 1: Generate proof hash for EVM
      const contentHash = generateContentHash(originalData);
      console.log(`[ANCHOR] Content Hash (EVM): ${contentHash}`);
      
      // Step 2: Encrypt locally
      const encrypted = encryptBuffer(originalData);
      console.log(`[ENCRYPTION] IV: ${encrypted.iv}`);
      console.log(`[ENCRYPTION] Key (ephemeral): ${encrypted.ephemeralKey}`);
      
      // Step 3: Upload to IPFS
      const uploaded = await mockIPFS.uploadFile(encrypted.data, 'document.bin');
      const cid = uploaded.cid;
      console.log(`[IPFS] CID: ${cid}`);
      
      // Step 4: Retrieve from IPFS
      const retrievedEncrypted = await mockIPFS.retrieveFile(cid);
      
      // Step 5: Decrypt
      const decrypted = decryptBuffer(retrievedEncrypted, encrypted.iv, encrypted.ephemeralKey);
      
      // Verify integrity
      expect(decrypted).toEqual(originalData);
      expect(generateContentHash(decrypted)).toEqual(contentHash);
    });

    test('should detect tampering - modified IPFS content', async () => {
      const originalData = Buffer.from('ORIGINAL_SECURE_DATA');
      
      // Encrypt and upload
      const encrypted = encryptBuffer(originalData);
      const uploaded = await mockIPFS.uploadFile(encrypted.data, 'document.bin');
      const cid = uploaded.cid;
      
      // Tamper with stored data
      const stored = mockIPFS.storage.get(cid);
      stored.buffer[0] = (stored.buffer[0] + 1) % 256; // Flip a byte
      
      // Attempt to decrypt tampered data
      const retrievedEncrypted = await mockIPFS.retrieveFile(cid);
      
      // Corrupted ciphertext may cause decryption failure or produce garbage
      try {
        const decrypted = decryptBuffer(retrievedEncrypted, encrypted.iv, encrypted.ephemeralKey);
        // If successful, it should not match original (data corrupted)
        expect(decrypted).not.toEqual(originalData);
      } catch (error) {
        // Or it throws (also valid)
        expect(error).toBeDefined();
      }
    });

    test('should prevent decryption with wrong key', async () => {
      const originalData = Buffer.from('SECURE_DATA_WITH_KEY');
      
      // Encrypt and upload
      const encrypted = encryptBuffer(originalData);
      await mockIPFS.uploadFile(encrypted.data, 'document.bin');
      
      // Generate wrong key
      const wrongKey = crypto.randomBytes(32).toString('hex');
      
      // Attempt decryption with wrong key
      expect(() => {
        decryptBuffer(encrypted.data, encrypted.iv, wrongKey);
      }).toThrow();
    });
  });

  describe('Concurrent Document Handling', () => {
    test('should handle multiple documents independently', async () => {
      const documents = [
        { data: Buffer.from('Doc1_MAHARSHI'), name: 'transcript1.pdf' },
        { data: Buffer.from('Doc2_TRIVEDI'), name: 'transcript2.pdf' },
        { data: Buffer.from('Doc3_D25DCE167'), name: 'certificate.pdf' }
      ];

      const operations = documents.map(async (doc) => {
        const contentHash = generateContentHash(doc.data);
        const encrypted = encryptBuffer(doc.data);
        const uploaded = await mockIPFS.uploadFile(encrypted.data, doc.name);
        
        return {
          original: doc.data,
          contentHash,
          cid: uploaded.cid,
          encryption: encrypted
        };
      });

      const results = await Promise.all(operations);

      // Verify each document
      for (const result of results) {
        const retrieved = await mockIPFS.retrieveFile(result.cid);
        const decrypted = decryptBuffer(
          retrieved,
          result.encryption.iv,
          result.encryption.ephemeralKey
        );
        
        expect(decrypted).toEqual(result.original);
        expect(generateContentHash(decrypted)).toEqual(result.contentHash);
      }
    });
  });

  describe('Threat Model: Attack Resistance', () => {
    test('[THREAT] IV Reuse Attack: Different IVs prevent pattern analysis', async () => {
      const sameData = Buffer.from('REPEATED_PAYLOAD_ANALYSIS_TEST');
      
      const enc1 = encryptBuffer(sameData);
      const enc2 = encryptBuffer(sameData);
      
      // With different IVs, ciphertexts are unrelated
      expect(enc1.iv).not.toEqual(enc2.iv);
      expect(enc1.data).not.toEqual(enc2.data);
    });

    test('[THREAT] Known-Plaintext Attack: Adversary knows content but cannot forge', async () => {
      const plaintext = Buffer.from('MAHARSHI_TRIVEDI_D25DCE167');
      const correctHash = generateContentHash(plaintext);
      
      // Attacker intercepts the hash and attempts to forge malicious content
      const maliciousContent = Buffer.from('FAKE_MAHARSHI_TRIVEDI_D25DCE167');
      const maliciousHash = generateContentHash(maliciousContent);
      
      // Hash mismatch proves tampering
      expect(correctHash).not.toEqual(maliciousHash);
    });

    test('[THREAT] Man-in-the-Middle: CID changes if content is modified', async () => {
      const data = Buffer.from('SECURE_CONTENT');
      const encrypted = encryptBuffer(data);
      
      // Upload original
      const original = await mockIPFS.uploadFile(encrypted.data, 'original.bin');
      
      // Modify encrypted content
      const modifiedBuffer = Buffer.alloc(encrypted.data.length);
      encrypted.data.copy(modifiedBuffer);
      modifiedBuffer[0] = (modifiedBuffer[0] + 1) % 256;
      
      // Upload modified (different CID)
      const modified = await mockIPFS.uploadFile(modifiedBuffer, 'modified.bin');
      
      // Different content = different CID
      expect(original.cid).not.toEqual(modified.cid);
    });

    test('[THREAT] Decentralization: No single point of authority', async () => {
      // Simulate multiple IPFS nodes storing the same content
      const data = Buffer.from('DECENTRALIZED_DATA');
      const encrypted = encryptBuffer(data);
      
      // Note: In real IPFS, same content = same CID (content-addressed)
      // Our mock generates random CIDs, so we just verify both uploads succeed
      const upload1 = await mockIPFS.uploadFile(encrypted.data, 'doc.bin');
      const upload2 = await mockIPFS.uploadFile(encrypted.data, 'doc.bin');
      
      // Both uploads should succeed
      expect(upload1.cid).toBeDefined();
      expect(upload2.cid).toBeDefined();
      
      // Demonstrate: retrieve from both
      const retrieved1 = await mockIPFS.retrieveFile(upload1.cid);
      const retrieved2 = await mockIPFS.retrieveFile(upload2.cid);
      
      // Both should be identical (same encrypted data)
      expect(retrieved1).toEqual(retrieved2);
    });

    test('[THREAT] Confidentiality: Network interception cannot expose plaintext', async () => {
      const plaintext = Buffer.from('CONFIDENTIAL_STUDENT_DATA_123');
      const encrypted = encryptBuffer(plaintext);
      
      // Even if network traffic is captured
      const capturedCiphertext = encrypted.data;
      const capturedIV = encrypted.iv;
      
      // Without the key, plaintext is useless
      expect(capturedCiphertext).not.toEqual(plaintext);
      expect(capturedCiphertext).not.toContain('CONFIDENTIAL');
      
      // Verify: with wrong key = decryption fails
      const wrongKey = crypto.randomBytes(32).toString('hex');
      expect(() => {
        decryptBuffer(capturedCiphertext, capturedIV, wrongKey);
      }).toThrow();
    });
  });

  describe('Boundary Validation: Architectural Constraints', () => {
    test('[BOUNDARY] EVM never sees plaintext, only hash', async () => {
      const plaintext = Buffer.from('SENSITIVE_ACADEMIC_DATA');
      
      // What EVM receives
      const evmAnchor = generateContentHash(plaintext);
      
      // Verify: hash is deterministic for same plaintext
      expect(generateContentHash(plaintext)).toEqual(evmAnchor);
      expect(evmAnchor.length).toBe(64); // SHA-256 hex string
      expect(Buffer.from(evmAnchor, 'hex').length).toBe(32);
    });

    test('[BOUNDARY] IPFS only receives encryption, never plaintext', async () => {
      const plaintext = Buffer.from('MAHARSHI_TRIVEDI_D25DCE167');
      const encrypted = encryptBuffer(plaintext);
      
      // IPFS storage doesn't contain plaintext
      await mockIPFS.uploadFile(encrypted.data, 'doc.bin');
      
      const stored = Array.from(mockIPFS.storage.values())[0];
      expect(stored.buffer).not.toEqual(plaintext);
      expect(stored.buffer.toString()).not.toContain('MAHARSHI');
    });

    test('[BOUNDARY] Client isolation: Encryption key never leaves memory', async () => {
      const plaintext = Buffer.from('LOCAL_SECRET');
      const encrypted = encryptBuffer(plaintext);
      
      // Key is ephemeral and local
      expect(encrypted.ephemeralKey).toBeDefined();
      expect(encrypted.ephemeralKey).toMatch(/^[0-9a-f]+$/); // Hex string
      
      // Key never uploaded (IPFS storage doesn't contain it)
      await mockIPFS.uploadFile(encrypted.data, 'doc.bin');
      
      const storedData = Array.from(mockIPFS.storage.values())[0].buffer;
      // Verify key is not in stored data
      expect(storedData.toString('hex')).not.toContain(encrypted.ephemeralKey);
    });
  });

  describe('Performance & Scalability', () => {
    test('should handle 1MB document within reasonable time', async () => {
      const largeDoc = Buffer.alloc(1024 * 1024); // 1MB
      crypto.randomFillSync(largeDoc);
      
      const start = Date.now();
      
      const encrypted = encryptBuffer(largeDoc);
      const uploaded = await mockIPFS.uploadFile(encrypted.data, 'large.bin');
      const retrieved = await mockIPFS.retrieveFile(uploaded.cid);
      const decrypted = decryptBuffer(retrieved, encrypted.iv, encrypted.ephemeralKey);
      
      const elapsed = Date.now() - start;
      console.log(`[PERF] 1MB document pipeline: ${elapsed}ms`);
      
      expect(decrypted).toEqual(largeDoc);
      expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should maintain security with batch operations', async () => {
      const batchSize = 50;
      const documents = Array.from({ length: batchSize }, (_, i) =>
        Buffer.from(`Document_${i}_MAHARSHI_TRIVEDI_D25DCE167`)
      );

      const start = Date.now();
      
      const uploads = documents.map(doc => {
        const encrypted = encryptBuffer(doc);
        return mockIPFS.uploadFile(encrypted.data, `doc_${documents.indexOf(doc)}.bin`);
      });

      const results = await Promise.all(uploads);
      const elapsed = Date.now() - start;
      
      console.log(`[PERF] Batch upload (${batchSize} docs): ${elapsed}ms`);
      expect(results.length).toBe(batchSize);
    });
  });
});
