/**
 * Test utilities and helper functions
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class TestUtils {
  /**
   * Generate random hex string
   */
  static generateRandomHex(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate SHA-256 hash
   */
  static sha256(data) {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Encrypt buffer using AES-256-CBC
   */
  static encryptAES256CBC(buffer, key = null, iv = null) {
    const encKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(32);
    const encIv = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', encKey, encIv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
      iv: encIv.toString('hex'),
      data: encrypted,
      key: encKey.toString('hex')
    };
  }

  /**
   * Decrypt buffer using AES-256-CBC
   */
  static decryptAES256CBC(encryptedData, iv, key) {
    const encKey = Buffer.from(key, 'hex');
    const encIv = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, encIv);
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }

  /**
   * Generate IPFS-like CID
   */
  static generateCID() {
    return `Qm${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
  }

  /**
   * Validate hex string
   */
  static isValidHex(str, expectedLength = null) {
    if (!/^[0-9a-f]*$/.test(str.toLowerCase())) return false;
    if (expectedLength && str.length !== expectedLength * 2) return false;
    return true;
  }

  /**
   * Create mock document
   */
  static createMockDocument(content, timestamp = Date.now()) {
    return {
      id: this.generateRandomHex(8),
      content: content || 'MAHARSHI_TRIVEDI_D25DCE167',
      timestamp,
      metadata: {
        size: content ? Buffer.byteLength(content) : 32,
        format: 'binary'
      }
    };
  }

  /**
   * Measure function execution time
   */
  static async measurePerformance(fn, label = 'Operation') {
    const start = performance.now();
    const result = await fn();
    const elapsed = performance.now() - start;

    console.log(`[PERF] ${label}: ${elapsed.toFixed(2)}ms`);
    return { result, elapsed };
  }

  /**
   * Compare buffers with detailed diff
   */
  static compareBuffers(buffer1, buffer2) {
    if (buffer1.length !== buffer2.length) {
      return {
        match: false,
        reason: `Length mismatch: ${buffer1.length} vs ${buffer2.length}`
      };
    }

    let firstDiff = -1;
    for (let i = 0; i < buffer1.length; i++) {
      if (buffer1[i] !== buffer2[i]) {
        firstDiff = i;
        break;
      }
    }

    if (firstDiff === -1) {
      return { match: true, reason: 'Buffers are identical' };
    }

    return {
      match: false,
      reason: `Buffers differ at byte ${firstDiff}`,
      expected: buffer1[firstDiff],
      actual: buffer2[firstDiff]
    };
  }

  /**
   * Generate test data of specified size
   */
  static generateTestData(sizeKB) {
    return crypto.randomBytes(sizeKB * 1024);
  }

  /**
   * Validate architectural boundaries
   */
  static validateArchitecture(component) {
    const checks = {
      cipher: {
        keySize: 32, // 256-bit
        ivSize: 16,  // 128-bit
        algorithm: 'aes-256-cbc'
      },
      hash: {
        algorithm: 'sha256',
        outputSize: 32 // bytes
      },
      ipfs: {
        cidPrefix: 'Qm',
        addressingType: 'content-based'
      }
    };

    return checks[component];
  }

  /**
   * Create test report
   */
  static generateReport(testResults) {
    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const total = testResults.length;

    return {
      summary: {
        total,
        passed,
        failed,
        percentage: ((passed / total) * 100).toFixed(2) + '%'
      },
      timestamp: new Date().toISOString(),
      results: testResults
    };
  }
}

module.exports = TestUtils;
