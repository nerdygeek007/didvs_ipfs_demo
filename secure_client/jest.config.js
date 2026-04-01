module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'core_engine.js',
    'crypto_module/**/*.js',
    'ipfs_bridge/**/*.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  maxWorkers: 1,
  testTimeout: 30000
};
