/**
 * Test fixtures and sample data
 */

module.exports = {
  // Sample payloads
  payloads: {
    studentTranscript: {
      id: 'STU_001_MAHARSHI_TRIVEDI',
      name: 'Maharshi Trivedi',
      studentId: 'D25DCE167',
      courses: [
        { code: 'CS101', grade: 'A+', credits: 4 },
        { code: 'CRYPT401', grade: 'A', credits: 3 },
        { code: 'IPFS501', grade: 'A+', credits: 4 }
      ],
      gpa: 3.95,
      timestamp: Date.now()
    },

    certificate: {
      id: 'CERT_ZERO_TRUST_2025',
      issuedTo: 'Maharshi Trivedi',
      issuer: 'CHARUSAT University',
      achievement: 'Zero-Trust Architecture Implementation',
      date: '2025-12-15',
      signature: '0x...' // Would be blockchain signature
    },

    academicRecord: {
      recordId: 'REC_D25DCE167',
      holder: 'MAHARSHI_TRIVEDI',
      institution: 'CHARUSAT',
      documents: [
        { type: 'transcript', hash: '0xabc123' },
        { type: 'certificate', hash: '0xdef456' },
        { type: 'diploma', hash: '0xghi789' }
      ]
    }
  },

  // Encryption test vectors
  encryptionVectors: {
    aes256cbc_nist: {
      plaintext: '00112233445566778899aabbccddeeff',
      key: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
      iv: 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
      expectedCiphertext: '0090537e5e0c19c12e79d0d0e9cd50be'
    },

    test_payload_1: {
      plaintext: 'MAHARSHI_TRIVEDI_D25DCE167_TEST',
      description: 'Standard test payload'
    },

    test_payload_2: {
      plaintext: 'Zero-Trust Document Verification System',
      description: 'Longer payload for AES-256-CBC test'
    },

    largePayload: {
      size: '50MB',
      description: 'Performance test - large file'
    }
  },

  // Sample API requests
  apiRequests: {
    healthCheck: {
      endpoint: 'POST /api/health',
      body: {},
      expectedStatus: 200
    },

    encryptPayload: {
      endpoint: 'POST /api/encrypt',
      body: {
        plaintext: 'MAHARSHI_TRIVEDI_D25DCE167_TEST_PAYLOAD',
        customKey: null
      },
      expectedStatus: 200
    },

    uploadDocument: {
      endpoint: 'POST /api/upload',
      body: {
        fileName: 'student_transcript.pdf',
        buffer: 'encrypted_binary_data'
      },
      expectedStatus: 200
    },

    secureDocument: {
      endpoint: 'POST /api/secure-document',
      body: {
        data: 'MAHARSHI_TRIVEDI_D25DCE167',
        fileName: 'academic_record.bin'
      },
      expectedStatus: 200
    },

    retrieveDocument: {
      endpoint: 'GET /api/retrieve/:cid',
      params: {
        cid: 'QmExample123456789',
        ephemeralKey: 'hex_key_string',
        iv: 'hex_iv_string'
      },
      expectedStatus: 200
    }
  },

  // Threat model test cases
  threatModels: {
    ivReuse: {
      name: 'IV Reuse Attack',
      description: 'Attacker intercepts same plaintext encrypted with same IV',
      mitigation: 'Generate new random IV for each encryption'
    },

    knownPlaintext: {
      name: 'Known-Plaintext Attack',
      description: 'Attacker knows plaintext and attempts to forge match',
      mitigation: 'Deterministic SHA-256 hash on plaintext for verification'
    },

    mitm: {
      name: 'Man-in-the-Middle Attack',
      description: 'Attacker intercepts and modifies IPFS content',
      mitigation: 'IPFS CID changes if any byte is modified (immutable addressing)'
    },

    passwordGuessing: {
      name: 'Decryption Key Guessing',
      description: 'Attacker attempts to brute-force AES key',
      mitigation: '256-bit key space (2^256 possibilities, cryptographically secure)'
    }
  },

  // Boundary validation test cases
  architecturalBoundaries: {
    evmState: {
      description: 'EVM sees only SHA-256 hash, never plaintext',
      maxSize: '32 bytes',
      constraint: 'O(1) gas cost on-chain'
    },

    ipfsStorage: {
      description: 'IPFS stores only encrypted ciphertext',
      keyFeature: 'Content-addressed (CID)',
      constraint: 'Deterministic for same content'
    },

    clientEncryption: {
      description: 'AES-256-CBC encryption happens locally',
      keyFeature: 'Ephemeral key never transmitted',
      constraint: 'Randomized IV for each encryption'
    }
  },

  // Performance baselines
  performanceTargets: {
    encryption_1mb: {
      operation: 'Encrypt 1MB document',
      target: '< 100ms',
      description: 'AES-256-CBC throughput'
    },

    ipfsUpload_5mb: {
      operation: 'Upload 5MB to IPFS',
      target: '< 5000ms',
      description: 'Network + pinning latency'
    },

    decryption_1mb: {
      operation: 'Decrypt 1MB document',
      target: '< 100ms',
      description: 'AES-256-CBC throughput'
    },

    fullPipeline_1mb: {
      operation: 'Full pipeline (encrypt → hash → upload)',
      target: '< 5500ms',
      description: 'Combined for 1MB document'
    }
  },

  // Error conditions
  errorCases: {
    missingKey: {
      scenario: 'POST /api/encrypt without plaintext',
      expectedError: 'Bad Request - Missing plaintext',
      statusCode: 400
    },

    invalidCID: {
      scenario: 'GET /api/retrieve/invalid_cid',
      expectedError: 'Bad Request - Invalid CID format',
      statusCode: 400
    },

    oversizedPayload: {
      scenario: 'POST /api/encrypt with 100MB payload',
      expectedError: 'Payload Too Large',
      statusCode: 413
    },

    networkTimeout: {
      scenario: 'IPFS upload with network unreachable',
      expectedError: 'Network Error - Cannot reach IPFS',
      statusCode: 503
    }
  },

  // Security compliance checklist
  securityChecklist: [
    'AES-256-CBC encryption active',
    'Random IV generated per encryption',
    'Ephemeral keys never logged',
    'SHA-256 hashing for integrity',
    'CORS headers properly configured',
    'Input validation on all endpoints',
    'No plaintext in IPFS storage',
    'No encryption keys in EVM state',
    'Rate limiting recommended for production',
    'HTTPS enforced in production'
  ]
};
