#!/usr/bin/env node

/**
 * Atlas Setup Helper for PostCrossing Mock
 *
 * This script helps you:
 * 1. URL-encode your Atlas password
 * 2. Test the Atlas connection
 * 3. Update the .env file automatically
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('🚀 PostCrossing Atlas Setup Helper\n');

  try {
    // Get Atlas credentials
    const username = await question('Enter your Atlas DB username (e.g., alishasib): ');
    const password = await question('Enter your Atlas DB password: ');

    // URL encode the password
    const encodedPassword = encodeURIComponent(password);
    console.log(`\n✅ Encoded password: ${encodedPassword}\n`);

    // Build the connection URI
    const mongoUri = `mongodb+srv://${username}:${encodedPassword}@postcrossing.wss5qpm.mongodb.net/postcrossing_mock?retryWrites=true&w=majority&appName=postcrossing`;

    // Create .env content
    const envContent = `NODE_ENV=development
MONGODB_URI=${mongoUri}
PORT=4000
CORS_ORIGIN=*
`;

    // Write to server/.env
    const serverDir = path.join(__dirname, 'server');
    const envPath = path.join(serverDir, '.env');

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created ${envPath}`);

    // Test connection
    console.log('\n🔄 Testing Atlas connection...');

    try {
      const mongoose = await import('mongoose');
      await mongoose.default.connect(mongoUri);
      console.log('✅ Atlas connection successful!');
      await mongoose.default.disconnect();
    } catch (error) {
      console.log('❌ Atlas connection failed:');
      console.log(error.message);

      if (error.message.includes('authentication failed')) {
        console.log('\n💡 Tip: Check your username and password in Atlas Database Access');
      } else if (error.message.includes('server selection timeout')) {
        console.log('\n💡 Tip: Check your IP is allowed in Atlas Network Access (try 0.0.0.0/0 for testing)');
      }
    }

    console.log('\n🎯 Next steps:');
    console.log('  cd server');
    console.log('  npm run seed');
    console.log('  npm start');
    console.log('\n  Then open: http://localhost:4000');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
