#!/usr/bin/env node

/**
 * Pre-Test System Validation
 * Checks all prerequisites before running test suite
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(60));
console.log('  PRE-TEST VALIDATION: Zero-Trust Architecture');
console.log('='.repeat(60) + '\n');

let passedChecks = 0;
let failedChecks = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      passedChecks++;
    } else {
      console.log(`❌ ${name}`);
      failedChecks++;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failedChecks++;
  }
}

// Check 1: Node.js version
check('Node.js installed (v18+)', () => {
  const version = execSync('node --version', { encoding: 'utf-8' }).trim();
  const major = parseInt(version.split('.')[0].substring(1));
  console.log(`   └─ ${version}`);
  return major >= 18;
});

// Check 2: npm present
check('npm installed', () => {
  const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`   └─ npm ${version}`);
  return true;
});

// Check 3: package.json exists
check('package.json exists', () => {
  return fs.existsSync(path.join(__dirname, 'package.json'));
});

// Check 4: Test files exist
check('Unit test files exist', () => {
  const testFiles = [
    '__tests__/unit/cipher.test.js',
    '__tests__/unit/core_engine.test.js'
  ];
  return testFiles.every(file => 
    fs.existsSync(path.join(__dirname, file))
  );
});

check('Integration test files exist', () => {
  return fs.existsSync(path.join(__dirname, '__tests__/integration/full_pipeline.test.js'));
});

check('Test fixtures exist', () => {
  const fixtures = [
    '__tests__/fixtures/test_data.js',
    '__tests__/fixtures/test_utils.js'
  ];
  return fixtures.every(file => 
    fs.existsSync(path.join(__dirname, file))
  );
});

// Check 5: jest config exists
check('Jest configuration (jest.config.js)', () => {
  return fs.existsSync(path.join(__dirname, 'jest.config.js'));
});

// Check 6: package.json has test scripts
check('npm test scripts configured', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
  );
  const hasScripts = packageJson.scripts && 
    packageJson.scripts.test && 
    packageJson.scripts['test:unit'] &&
    packageJson.scripts['test:integration'];
  return hasScripts;
});

// Check 7: Required dependencies in package.json
check('Test dependencies defined', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
  );
  const devDeps = packageJson.devDependencies || {};
  return devDeps.jest && devDeps.supertest;
});

// Check 8: node_modules may not exist yet (will be installed)
check('node_modules exists or can be installed', () => {
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log(`   └─ node_modules present (${fs.readdirSync(path.join(__dirname, 'node_modules')).length} packages)`);
    return true;
  }
  console.log('   └─ Will be installed via npm install');
  return true;
});

// Check 9: .env exists or .env.example exists
check('Environment configuration ready', () => {
  const envExists = fs.existsSync(path.join(__dirname, '.env'));
  const exampleExists = fs.existsSync(path.join(__dirname, '.env.example'));
  if (envExists) {
    console.log('   └─ .env configured');
  } else if (exampleExists) {
    console.log('   └─ .env.example exists (test mode)');
  }
  return envExists || exampleExists;
});

// Check 10: Crypto module availability
check('Node.js crypto module available', () => {
  try {
    require('crypto');
    return true;
  } catch {
    return false;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`  VALIDATION RESULTS: ${passedChecks} passed, ${failedChecks} failed`);
console.log('='.repeat(60) + '\n');

if (failedChecks === 0) {
  console.log('✅ System is ready for testing!\n');
  console.log('Next: Run tests with:');
  console.log('  npm test                    # Full suite with coverage');
  console.log('  npm run test:unit           # Cryptography tests only');
  console.log('  npm run test:integration    # Full pipeline tests only');
  console.log('  npm run test:watch          # Watch mode (auto-rerun)\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the failed checks above before running tests.\n');
  console.log('Common fixes:');
  console.log('  1. Install Node.js: https://nodejs.org/ (v18+)');
  console.log('  2. Install dependencies: npm install');
  console.log('  3. Create .env file from .env.example');
  console.log('  4. Run validation again: node validate_tests.js\n');
  process.exit(1);
}
