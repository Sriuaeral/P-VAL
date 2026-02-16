#!/usr/bin/env node

/**
 * Setup Script for RAL Solar Intelligence Authentication System
 * 
 * This script helps set up the development environment
 * Run with: node scripts/setup.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up RAL Solar Intelligence Authentication System');
console.log('========================================================');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.log('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

// Check if client auth context exists
if (!fs.existsSync('client/contexts/AuthContext.tsx')) {
  console.log('❌ Auth context not found. Please ensure the authentication files are in place.');
  process.exit(1);
}

// Check if client directory exists
if (!fs.existsSync('client')) {
  console.log('❌ Client directory not found. Please ensure the client files are in place.');
  process.exit(1);
}

console.log('\n🔧 Environment Check');
console.log('===================');

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  'client/contexts/AuthContext.tsx',
  'client/components/auth/LoginForm.tsx',
  'client/components/auth/LoginPage.tsx',
  'client/components/auth/LogoutButton.tsx',
  'client/components/auth/ProtectedRoute.tsx',
  'client/components/auth/ProtectedRoutes.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all authentication files are in place.');
  process.exit(1);
}

console.log('\n🎯 Available Commands');
console.log('====================');
console.log('npm run dev          - Start the application (port 8080)');
console.log('npm run build        - Build for production');
console.log('npm run validate-auth - Validate authentication setup');

console.log('\n🔐 Login Credentials');
console.log('===================');
console.log('Username: admin     Password: admin!23$     Role: admin');

console.log('\n🌐 URLs');
console.log('=======');
console.log('Application: http://localhost:8080');

console.log('\n✅ Setup complete! You can now start the development servers.');
console.log('\n💡 To start the application, run: npm run dev');
