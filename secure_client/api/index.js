/**
 * @file api/index.js
 * @description Vercel Serverless Function Handler
 * Entry point for all API requests to the Zero-Trust Document Verification Engine
 */

const app = require("../core_engine");

/**
 * Handler for Vercel Serverless
 * Vercel automatically recognizes express apps in api/ folder
 */
module.exports = app;

// Also export as default handler for explicit Vercel compatibility
module.exports.default = app;
