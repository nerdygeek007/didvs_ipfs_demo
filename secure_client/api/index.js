/**
 * @file api/index.js
 * @description Vercel Serverless Function Handler
 * Entry point for all API requests to the Zero-Trust Document Verification Engine
 */

const app = require("../core_engine");

// Export for Vercel
module.exports = app;
