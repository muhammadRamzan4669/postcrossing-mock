/**
 * Seed script for the PostCrossing mock backend.
 *
 * Usage:
 *   MONGODB_URI="mongodb://localhost:27017/postcrossing_mock" node seed.js
 *
 * This will:
 *  - Wipe Users, Addresses, Postcards, Counters, and ReceivePool collections
 *  - Create a few users with primary addresses
 *  - Preload some receive credits so /api/postcards/request can match recipients immediately
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User } from './models/User.js';
import { Address } from './models/Address.js';
import { Postcard } from './models/Postcard.js';
import { Counter } from './models/Counter.js';
import { ReceivePool } from './models/ReceivePool.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/postcrossing_mock';

async function createUserWithPrimaryAddress({
  username,
  email,
  countryCode,
  fullName,
  line1,
  line2 = '',
  city,
  postalCode,
  stats = {}
}) {
  const user = await User.create({
    username,
    email,
    countryCode,
    stats
  });

  await Address.create({
    userId: user._id,
    fullName,
    line1,
    line2,
    city,
    postalCode,
    countryCode,
    isPrimary: true,
    validated: true
  });

  return user;
}

async function run() {
  console.log('[seed] Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log('[seed] Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Address.deleteMany({}),
    Postcard.deleteMany({}),
    Counter.deleteMany({}),
    ReceivePool.deleteMany({})
  ]);

  console.log('[seed] Creating users and addresses...');
  const alice = await createUserWithPrimaryAddress({
    username: 'alice',
    email: 'alice@example.com',
    countryCode: 'US',
    fullName: 'Alice A',
    line1: '1 Main St',
    city: 'Seattle',
    postalCode: '98101',
    stats: { sent: 0, received: 0, traveling: 0, expired: 0 }
  });

  const bruno = await createUserWithPrimaryAddress({
    username: 'bruno',
    email: 'bruno@example.com',
    countryCode: 'CN',
    fullName: 'Bruno B',
    line1: '99 Xicheng',
    line2: 'Block A',
    city: 'Beijing',
    postalCode: '100000',
    stats: { sent: 5, received: 13, traveling: 1, expired: 0 }
  });

  const cami = await createUserWithPrimaryAddress({
    username: 'cami',
    email: 'cami@example.com',
    countryCode: 'CL',
    fullName: 'Cami C',
    line1: 'Calle 9',
    line2: 'Depto 1',
    city: 'Santiago',
    postalCode: '7500000',
    stats: { sent: 2, received: 2, traveling: 0, expired: 0 }
  });

  const dave = await createUserWithPrimaryAddress({
    username: 'dave',
    email: 'dave@example.com',
    countryCode: 'DE',
    fullName: 'Dave D',
    line1: 'Alexanderplatz',
    city: 'Berlin',
    postalCode: '10178',
    stats: { sent: 4, received: 40, traveling: 3, expired: 1 }
  });

  console.log('[seed] Preloading receive credits (ReceivePool)...');
  // Insert some credits so the first few requests will pop from the pool.
  await ReceivePool.insertMany([
    { userId: bruno._id, countryCode: 'CN' },
    { userId: cami._id, countryCode: 'CL' },
    { userId: dave._id, countryCode: 'DE' },
    { userId: dave._id, countryCode: 'DE' } // Dave has 2 credits
  ]);

  console.log('[seed] Done.');
  console.log('[seed] Users created:');
  console.log(`  alice: ${alice._id.toString()} (US)`);
  console.log(`  bruno: ${bruno._id.toString()} (CN)`);
  console.log(`  cami : ${cami._id.toString()} (CL)`);
  console.log(`  dave : ${dave._id.toString()} (DE)`);

  console.log('\nNext steps:');
  console.log('  1) Start the server: cd server && npm install && npm start');
  console.log('  2) Use x-user-id header with one of the above IDs to call /api/postcards/request');
  console.log('  3) Then register a received postcard with /api/postcards/register-received');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  // Try to cleanup connection before exit
  mongoose.connection.readyState && mongoose.disconnect().catch(() => {});
  process.exit(1);
});
