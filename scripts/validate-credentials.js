#!/usr/bin/env node

/**
 * Credential Validation Script
 * 
 * This script validates that the authentication system is configured
 * with the correct static credentials.
 * Run with: node scripts/validate-credentials.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Authentication Credentials');
console.log('======================================');

// Check if client auth context exists
const authFile = path.join(__dirname, '..', 'client', 'contexts', 'AuthContext.tsx');

if (!fs.existsSync(authFile)) {
  console.log('❌ Auth context file not found:', authFile);
  process.exit(1);
}

// Read the auth context file
const authContent = fs.readFileSync(authFile, 'utf8');

// Check for the correct credentials
const expectedUsername = 'admin';
const expectedPassword = 'admin!23$';

const hasCorrectUsername = authContent.includes(`username === '${expectedUsername}'`);
const hasCorrectPassword = authContent.includes(`password === '${expectedPassword}'`);

console.log('\n📋 Validation Results:');
console.log('======================');

if (hasCorrectUsername) {
  console.log('✅ Username configured correctly: admin');
} else {
  console.log('❌ Username not found or incorrect');
}

if (hasCorrectPassword) {
  console.log('✅ Password configured correctly: admin!23$');
} else {
  console.log('❌ Password not found or incorrect');
}

if (hasCorrectUsername && hasCorrectPassword) {
  console.log('\n🎉 SUCCESS: Authentication system is configured with correct credentials!');
  console.log('\n📝 Login Details:');
  console.log('=================');
  console.log('Username: admin');
  console.log('Password: admin!23$');
  console.log('Role: admin');
  console.log('Email: admin@ral.com');
  
  console.log('\n🚀 Next Steps:');
  console.log('==============');
  console.log('1. Start the application: npm run dev');
  console.log('2. Visit: http://localhost:8080');
  console.log('3. Login with the credentials above');
  
  console.log('\n✅ Authentication system is ready to use!');
} else {
  console.log('\n❌ FAILED: Authentication system needs to be configured correctly.');
  console.log('Please check the client/contexts/AuthContext.tsx file.');
  process.exit(1);
}
