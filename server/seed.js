/**
 * Seed script for the PostCrossing mock backend.
 * Creates 100+ realistic users from around the world with simple names.
 *
 * Usage:
 *   MONGODB_URI="mongodb://localhost:27017/postcrossing_mock" node seed.js
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

// 100+ unique users with simple names from around the world
const realWorldUsers = [
  // United States (25 users)
  { username: 'alice', email: 'alice@example.com', countryCode: 'US', fullName: 'Alice Johnson', line1: '1234 Main Street', city: 'Seattle', postalCode: '98101', stats: { sent: 15, received: 18, traveling: 2, expired: 1 } },
  { username: 'michael', email: 'michael@example.com', countryCode: 'US', fullName: 'Michael Chen', line1: '567 Pine Avenue', city: 'Seattle', postalCode: '98102', stats: { sent: 22, received: 25, traveling: 3, expired: 2 } },
  { username: 'sarah', email: 'sarah@example.com', countryCode: 'US', fullName: 'Sarah Williams', line1: '789 Broadway', line2: 'Apt 4B', city: 'New York', postalCode: '10001', stats: { sent: 33, received: 29, traveling: 4, expired: 1 } },
  { username: 'david', email: 'david@example.com', countryCode: 'US', fullName: 'David Martinez', line1: '321 Sunset Blvd', city: 'Los Angeles', postalCode: '90028', stats: { sent: 18, received: 22, traveling: 2, expired: 0 } },
  { username: 'emma_us', email: 'emma@example.com', countryCode: 'US', fullName: 'Emma Thompson', line1: '456 Michigan Ave', line2: 'Suite 12', city: 'Chicago', postalCode: '60601', stats: { sent: 25, received: 30, traveling: 4, expired: 2 } },
  { username: 'james', email: 'james@example.com', countryCode: 'US', fullName: 'James Rodriguez', line1: '789 Ocean Drive', city: 'Miami', postalCode: '33139', stats: { sent: 12, received: 16, traveling: 1, expired: 0 } },
  { username: 'lisa', email: 'lisa@example.com', countryCode: 'US', fullName: 'Lisa Chang', line1: '123 Commonwealth Ave', city: 'Boston', postalCode: '02116', stats: { sent: 28, received: 24, traveling: 3, expired: 1 } },
  { username: 'robert', email: 'robert@example.com', countryCode: 'US', fullName: 'Robert Taylor', line1: '654 South Lamar', city: 'Austin', postalCode: '78704', stats: { sent: 19, received: 26, traveling: 2, expired: 1 } },
  { username: 'jessica_us', email: 'jessica@example.com', countryCode: 'US', fullName: 'Jessica Miller', line1: '890 Market Street', city: 'San Francisco', postalCode: '94102', stats: { sent: 31, received: 27, traveling: 5, expired: 2 } },
  { username: 'christopher', email: 'christopher@example.com', countryCode: 'US', fullName: 'Christopher Davis', line1: '456 Pennsylvania Ave', city: 'Washington', postalCode: '20001', stats: { sent: 14, received: 19, traveling: 1, expired: 0 } },
  { username: 'ashley', email: 'ashley@example.com', countryCode: 'US', fullName: 'Ashley Brown', line1: '123 Pearl Street', city: 'Denver', postalCode: '80202', stats: { sent: 21, received: 23, traveling: 3, expired: 1 } },
  { username: 'matthew', email: 'matthew@example.com', countryCode: 'US', fullName: 'Matthew Wilson', line1: '789 Peachtree St', city: 'Atlanta', postalCode: '30309', stats: { sent: 17, received: 20, traveling: 2, expired: 0 } },
  { username: 'amanda', email: 'amanda@example.com', countryCode: 'US', fullName: 'Amanda Garcia', line1: '321 Las Vegas Blvd', city: 'Las Vegas', postalCode: '89101', stats: { sent: 24, received: 21, traveling: 4, expired: 2 } },
  { username: 'joshua', email: 'joshua@example.com', countryCode: 'US', fullName: 'Joshua Anderson', line1: '567 Broadway', city: 'Nashville', postalCode: '37201', stats: { sent: 13, received: 17, traveling: 1, expired: 0 } },
  { username: 'megan', email: 'megan@example.com', countryCode: 'US', fullName: 'Megan Thomas', line1: '890 Liberty Ave', city: 'Pittsburgh', postalCode: '15222', stats: { sent: 26, received: 24, traveling: 3, expired: 1 } },
  { username: 'andrew', email: 'andrew@example.com', countryCode: 'US', fullName: 'Andrew Jackson', line1: '234 Bourbon Street', city: 'New Orleans', postalCode: '70112', stats: { sent: 20, received: 25, traveling: 2, expired: 1 } },
  { username: 'brittany', email: 'brittany@example.com', countryCode: 'US', fullName: 'Brittany Lee', line1: '678 Fremont Street', city: 'Portland', postalCode: '97201', stats: { sent: 18, received: 22, traveling: 2, expired: 0 } },
  { username: 'daniel', email: 'daniel@example.com', countryCode: 'US', fullName: 'Daniel White', line1: '912 State Street', city: 'Milwaukee', postalCode: '53202', stats: { sent: 22, received: 19, traveling: 3, expired: 1 } },
  { username: 'samantha', email: 'samantha@example.com', countryCode: 'US', fullName: 'Samantha Martin', line1: '345 Grand Ave', city: 'Phoenix', postalCode: '85003', stats: { sent: 15, received: 21, traveling: 1, expired: 0 } },
  { username: 'ryan_us', email: 'ryan.us@example.com', countryCode: 'US', fullName: 'Ryan Thompson', line1: '678 Main Street', city: 'Salt Lake City', postalCode: '84101', stats: { sent: 27, received: 23, traveling: 4, expired: 2 } },
  { username: 'nicole', email: 'nicole@example.com', countryCode: 'US', fullName: 'Nicole Martinez', line1: '123 River Walk', city: 'San Antonio', postalCode: '78205', stats: { sent: 16, received: 20, traveling: 2, expired: 0 } },
  { username: 'brandon', email: 'brandon@example.com', countryCode: 'US', fullName: 'Brandon Harris', line1: '456 Beale Street', city: 'Memphis', postalCode: '38103', stats: { sent: 24, received: 26, traveling: 3, expired: 1 } },
  { username: 'rachel', email: 'rachel@example.com', countryCode: 'US', fullName: 'Rachel Clark', line1: '789 Capitol Hill', city: 'Little Rock', postalCode: '72201', stats: { sent: 11, received: 18, traveling: 1, expired: 0 } },
  { username: 'justin', email: 'justin@example.com', countryCode: 'US', fullName: 'Justin Rodriguez', line1: '321 Elm Street', city: 'Dallas', postalCode: '75201', stats: { sent: 29, received: 31, traveling: 5, expired: 2 } },
  { username: 'stephanie', email: 'stephanie@example.com', countryCode: 'US', fullName: 'Stephanie Lewis', line1: '567 Fifth Avenue', city: 'Minneapolis', postalCode: '55401', stats: { sent: 19, received: 24, traveling: 2, expired: 1 } },

  // Germany (15 users)
  { username: 'bruno', email: 'bruno@example.com', countryCode: 'DE', fullName: 'Bruno Müller', line1: 'Alexanderplatz 1', city: 'Berlin', postalCode: '10178', stats: { sent: 35, received: 40, traveling: 6, expired: 3 } },
  { username: 'anna', email: 'anna@example.com', countryCode: 'DE', fullName: 'Anna Schmidt', line1: 'Unter den Linden 15', city: 'Berlin', postalCode: '10117', stats: { sent: 28, received: 32, traveling: 4, expired: 2 } },
  { username: 'hans', email: 'hans@example.com', countryCode: 'DE', fullName: 'Hans Weber', line1: 'Marienplatz 8', city: 'München', postalCode: '80331', stats: { sent: 24, received: 28, traveling: 3, expired: 1 } },
  { username: 'petra', email: 'petra@example.com', countryCode: 'DE', fullName: 'Petra Fischer', line1: 'Speicherstadt 12', city: 'Hamburg', postalCode: '20457', stats: { sent: 32, received: 27, traveling: 5, expired: 2 } },
  { username: 'klaus', email: 'klaus@example.com', countryCode: 'DE', fullName: 'Klaus Becker', line1: 'Domplatz 3', city: 'Köln', postalCode: '50667', stats: { sent: 16, received: 23, traveling: 2, expired: 0 } },
  { username: 'greta', email: 'greta@example.com', countryCode: 'DE', fullName: 'Greta Hoffmann', line1: 'Zeil 42', city: 'Frankfurt am Main', postalCode: '60313', stats: { sent: 26, received: 31, traveling: 4, expired: 1 } },
  { username: 'wolfgang', email: 'wolfgang@example.com', countryCode: 'DE', fullName: 'Wolfgang Braun', line1: 'Königsallee 5', city: 'Düsseldorf', postalCode: '40212', stats: { sent: 21, received: 25, traveling: 3, expired: 1 } },
  { username: 'sabine', email: 'sabine@example.com', countryCode: 'DE', fullName: 'Sabine Wagner', line1: 'Residenzplatz 1', city: 'Würzburg', postalCode: '97070', stats: { sent: 18, received: 22, traveling: 2, expired: 0 } },
  { username: 'thomas_de', email: 'thomas@example.com', countryCode: 'DE', fullName: 'Thomas Richter', line1: 'Schlossplatz 7', city: 'Stuttgart', postalCode: '70173', stats: { sent: 30, received: 26, traveling: 4, expired: 2 } },
  { username: 'monika', email: 'monika@example.com', countryCode: 'DE', fullName: 'Monika Klein', line1: 'Altstadt 14', city: 'Nürnberg', postalCode: '90403', stats: { sent: 14, received: 19, traveling: 1, expired: 0 } },
  { username: 'frank', email: 'frank@example.com', countryCode: 'DE', fullName: 'Frank Lange', line1: 'Breite Straße 23', city: 'Magdeburg', postalCode: '39104', stats: { sent: 22, received: 24, traveling: 3, expired: 1 } },
  { username: 'ingrid', email: 'ingrid@example.com', countryCode: 'DE', fullName: 'Ingrid Krüger', line1: 'Marktplatz 6', city: 'Leipzig', postalCode: '04109', stats: { sent: 17, received: 21, traveling: 2, expired: 0 } },
  { username: 'helmut', email: 'helmut@example.com', countryCode: 'DE', fullName: 'Helmut Schulz', line1: 'Augustusplatz 9', city: 'Dresden', postalCode: '01067', stats: { sent: 25, received: 29, traveling: 4, expired: 2 } },
  { username: 'gudrun', email: 'gudrun@example.com', countryCode: 'DE', fullName: 'Gudrun Zimmermann', line1: 'Holstenstraße 18', city: 'Kiel', postalCode: '24103', stats: { sent: 12, received: 17, traveling: 1, expired: 0 } },
  { username: 'dave', email: 'dave@example.com', countryCode: 'DE', fullName: 'Dave Schmidt', line1: 'Potsdamer Platz 21', city: 'Berlin', postalCode: '10785', stats: { sent: 40, received: 55, traveling: 8, expired: 4 } },

  // Japan (15 users)
  { username: 'yuki', email: 'yuki@example.com', countryCode: 'JP', fullName: 'Yuki Tanaka', line1: '1-1-1 Shibuya', city: 'Tokyo', postalCode: '150-0002', stats: { sent: 45, received: 38, traveling: 7, expired: 3 } },
  { username: 'hiroshi', email: 'hiroshi@example.com', countryCode: 'JP', fullName: 'Hiroshi Sato', line1: '2-3-4 Namba', city: 'Osaka', postalCode: '542-0076', stats: { sent: 31, received: 35, traveling: 5, expired: 2 } },
  { username: 'sakura', email: 'sakura@example.com', countryCode: 'JP', fullName: 'Sakura Yamamoto', line1: '5-6-7 Gion', city: 'Kyoto', postalCode: '605-0073', stats: { sent: 28, received: 33, traveling: 4, expired: 2 } },
  { username: 'takeshi', email: 'takeshi@example.com', countryCode: 'JP', fullName: 'Takeshi Suzuki', line1: '8-9-10 Minato Mirai', city: 'Yokohama', postalCode: '220-0012', stats: { sent: 22, received: 25, traveling: 3, expired: 1 } },
  { username: 'mai', email: 'mai@example.com', countryCode: 'JP', fullName: 'Mai Watanabe', line1: '11-12-13 Sakae', city: 'Nagoya', postalCode: '460-0008', stats: { sent: 37, received: 41, traveling: 6, expired: 3 } },
  { username: 'akira', email: 'akira@example.com', countryCode: 'JP', fullName: 'Akira Nakamura', line1: '14-15-16 Susukino', city: 'Sapporo', postalCode: '064-0804', stats: { sent: 19, received: 23, traveling: 2, expired: 0 } },
  { username: 'kenji', email: 'kenji@example.com', countryCode: 'JP', fullName: 'Kenji Kobayashi', line1: '17-18-19 Tenjin', city: 'Fukuoka', postalCode: '810-0001', stats: { sent: 25, received: 29, traveling: 4, expired: 1 } },
  { username: 'reiko', email: 'reiko@example.com', countryCode: 'JP', fullName: 'Reiko Ito', line1: '20-21-22 Kokusai-dori', city: 'Naha', postalCode: '900-0013', stats: { sent: 16, received: 21, traveling: 2, expired: 1 } },
  { username: 'masato', email: 'masato@example.com', countryCode: 'JP', fullName: 'Masato Kato', line1: '23-24-25 Honcho', city: 'Sendai', postalCode: '980-0014', stats: { sent: 33, received: 30, traveling: 5, expired: 2 } },
  { username: 'naomi', email: 'naomi@example.com', countryCode: 'JP', fullName: 'Naomi Yoshida', line1: '26-27-28 Chuo-ku', city: 'Niigata', postalCode: '950-0088', stats: { sent: 14, received: 18, traveling: 1, expired: 0 } },
  { username: 'ryota', email: 'ryota@example.com', countryCode: 'JP', fullName: 'Ryota Sasaki', line1: '29-30-31 Motomachi', city: 'Hakodate', postalCode: '040-0053', stats: { sent: 21, received: 24, traveling: 3, expired: 1 } },
  { username: 'yui', email: 'yui@example.com', countryCode: 'JP', fullName: 'Yui Yamada', line1: '32-33-34 Kawaramachi', city: 'Kyoto', postalCode: '604-8005', stats: { sent: 27, received: 31, traveling: 4, expired: 2 } },
  { username: 'tetsuya', email: 'tetsuya@example.com', countryCode: 'JP', fullName: 'Tetsuya Mori', line1: '35-36-37 Dotonbori', city: 'Osaka', postalCode: '542-0071', stats: { sent: 18, received: 22, traveling: 2, expired: 0 } },
  { username: 'ayako', email: 'ayako@example.com', countryCode: 'JP', fullName: 'Ayako Shimizu', line1: '38-39-40 Ginza', city: 'Tokyo', postalCode: '104-0061', stats: { sent: 35, received: 32, traveling: 6, expired: 3 } },
  { username: 'shinji', email: 'shinji@example.com', countryCode: 'JP', fullName: 'Shinji Hayashi', line1: '41-42-43 Kamakura', city: 'Kamakura', postalCode: '248-0006', stats: { sent: 12, received: 16, traveling: 1, expired: 0 } },

  // United Kingdom (12 users)
  { username: 'oliver', email: 'oliver@example.com', countryCode: 'GB', fullName: 'Oliver Smith', line1: '10 Downing Street', city: 'London', postalCode: 'SW1A 2AA', stats: { sent: 30, received: 27, traveling: 4, expired: 2 } },
  { username: 'charlotte', email: 'charlotte@example.com', countryCode: 'GB', fullName: 'Charlotte Brown', line1: '15 Royal Mile', city: 'Edinburgh', postalCode: 'EH1 2PB', stats: { sent: 23, received: 29, traveling: 3, expired: 1 } },
  { username: 'william', email: 'william@example.com', countryCode: 'GB', fullName: 'William Davis', line1: '22 Deansgate', city: 'Manchester', postalCode: 'M1 1AA', stats: { sent: 26, received: 24, traveling: 4, expired: 1 } },
  { username: 'sophie', email: 'sophie@example.com', countryCode: 'GB', fullName: 'Sophie Wilson', line1: '8 Mathew Street', city: 'Liverpool', postalCode: 'L2 6RE', stats: { sent: 19, received: 26, traveling: 2, expired: 0 } },
  { username: 'harry', email: 'harry@example.com', countryCode: 'GB', fullName: 'Harry Johnson', line1: '33 Princes Street', city: 'Edinburgh', postalCode: 'EH2 2BY', stats: { sent: 32, received: 28, traveling: 5, expired: 2 } },
  { username: 'emily', email: 'emily@example.com', countryCode: 'GB', fullName: 'Emily Taylor', line1: '45 Oxford Street', city: 'London', postalCode: 'W1C 1DX', stats: { sent: 21, received: 25, traveling: 3, expired: 1 } },
  { username: 'george', email: 'george@example.com', countryCode: 'GB', fullName: 'George Miller', line1: '67 High Street', city: 'Cardiff', postalCode: 'CF10 1PT', stats: { sent: 17, received: 22, traveling: 2, expired: 0 } },
  { username: 'amelia', email: 'amelia@example.com', countryCode: 'GB', fullName: 'Amelia Jones', line1: '89 Union Street', city: 'Glasgow', postalCode: 'G1 3TA', stats: { sent: 28, received: 31, traveling: 4, expired: 2 } },
  { username: 'jack', email: 'jack@example.com', countryCode: 'GB', fullName: 'Jack Anderson', line1: '12 Church Lane', city: 'Birmingham', postalCode: 'B2 5QR', stats: { sent: 15, received: 19, traveling: 1, expired: 0 } },
  { username: 'isabella', email: 'isabella@example.com', countryCode: 'GB', fullName: 'Isabella White', line1: '34 Market Square', city: 'Leicester', postalCode: 'LE1 5DR', stats: { sent: 24, received: 27, traveling: 3, expired: 1 } },
  { username: 'noah_gb', email: 'noah@example.com', countryCode: 'GB', fullName: 'Noah Thompson', line1: '56 Castle Street', city: 'Canterbury', postalCode: 'CT1 2QD', stats: { sent: 20, received: 23, traveling: 2, expired: 1 } },
  { username: 'mia', email: 'mia@example.com', countryCode: 'GB', fullName: 'Mia Garcia', line1: '78 Park Lane', city: 'London', postalCode: 'W1K 1QA', stats: { sent: 33, received: 29, traveling: 5, expired: 2 } },

  // France (10 users)
  { username: 'pierre', email: 'pierre@example.com', countryCode: 'FR', fullName: 'Pierre Dubois', line1: '12 Champs-Élysées', city: 'Paris', postalCode: '75008', stats: { sent: 34, received: 31, traveling: 5, expired: 2 } },
  { username: 'marie', email: 'marie@example.com', countryCode: 'FR', fullName: 'Marie Martin', line1: '34 Rue de la République', city: 'Lyon', postalCode: '69002', stats: { sent: 25, received: 28, traveling: 3, expired: 1 } },
  { username: 'antoine', email: 'antoine@example.com', countryCode: 'FR', fullName: 'Antoine Bernard', line1: '56 Vieux Port', city: 'Marseille', postalCode: '13001', stats: { sent: 22, received: 30, traveling: 4, expired: 1 } },
  { username: 'isabelle', email: 'isabelle@example.com', countryCode: 'FR', fullName: 'Isabelle Moreau', line1: '78 Promenade des Anglais', city: 'Nice', postalCode: '06000', stats: { sent: 29, received: 25, traveling: 3, expired: 2 } },
  { username: 'jean', email: 'jean@example.com', countryCode: 'FR', fullName: 'Jean Leroy', line1: '90 Place Bellecour', city: 'Lyon', postalCode: '69002', stats: { sent: 16, received: 23, traveling: 2, expired: 0 } },
  { username: 'camille', email: 'camille@example.com', countryCode: 'FR', fullName: 'Camille Roux', line1: '12 Rue du Faubourg', city: 'Strasbourg', postalCode: '67000', stats: { sent: 31, received: 27, traveling: 4, expired: 2 } },
  { username: 'nicolas', email: 'nicolas@example.com', countryCode: 'FR', fullName: 'Nicolas Fournier', line1: '34 Place du Capitole', city: 'Toulouse', postalCode: '31000', stats: { sent: 18, received: 22, traveling: 2, expired: 1 } },
  { username: 'julie', email: 'julie@example.com', countryCode: 'FR', fullName: 'Julie Girard', line1: '56 Cours Mirabeau', city: 'Aix-en-Provence', postalCode: '13100', stats: { sent: 27, received: 24, traveling: 3, expired: 1 } },
  { username: 'louis', email: 'louis@example.com', countryCode: 'FR', fullName: 'Louis Bonnet', line1: '78 Place Kléber', city: 'Strasbourg', postalCode: '67000', stats: { sent: 20, received: 26, traveling: 3, expired: 0 } },
  { username: 'claire', email: 'claire@example.com', countryCode: 'FR', fullName: 'Claire Dupont', line1: '90 Rue Sainte-Catherine', city: 'Bordeaux', postalCode: '33000', stats: { sent: 24, received: 29, traveling: 4, expired: 2 } },

  // China (8 users)
  { username: 'wei', email: 'wei@example.com', countryCode: 'CN', fullName: 'Wei Zhang', line1: '99 Wangfujing Street', city: 'Beijing', postalCode: '100006', stats: { sent: 38, received: 42, traveling: 6, expired: 3 } },
  { username: 'li', email: 'li@example.com', countryCode: 'CN', fullName: 'Li Wang', line1: '888 Nanjing Road', city: 'Shanghai', postalCode: '200001', stats: { sent: 32, received: 36, traveling: 5, expired: 2 } },
  { username: 'ming', email: 'ming@example.com', countryCode: 'CN', fullName: 'Ming Liu', line1: '777 Tianhe Road', city: 'Guangzhou', postalCode: '510075', stats: { sent: 25, received: 29, traveling: 3, expired: 1 } },
  { username: 'xiao', email: 'xiao@example.com', countryCode: 'CN', fullName: 'Xiao Chen', line1: '666 Chunxi Road', city: 'Chengdu', postalCode: '610016', stats: { sent: 21, received: 25, traveling: 3, expired: 1 } },
  { username: 'ling', email: 'ling@example.com', countryCode: 'CN', fullName: 'Ling Wu', line1: '555 Jiefang Road', city: 'Wuhan', postalCode: '430014', stats: { sent: 18, received: 22, traveling: 2, expired: 0 } },
  { username: 'jun', email: 'jun@example.com', countryCode: 'CN', fullName: 'Jun Yang', line1: '444 Zhongshan Road', city: 'Xiamen', postalCode: '361003', stats: { sent: 29, received: 26, traveling: 4, expired: 2 } },
  { username: 'hui', email: 'hui@example.com', countryCode: 'CN', fullName: 'Hui Zhou', line1: '333 Dianchi Road', city: 'Kunming', postalCode: '650228', stats: { sent: 16, received: 20, traveling: 2, expired: 0 } },
  { username: 'lei', email: 'lei@example.com', countryCode: 'CN', fullName: 'Lei Xu', line1: '222 West Lake Road', city: 'Hangzhou', postalCode: '310007', stats: { sent: 27, received: 31, traveling: 4, expired: 1 } },

  // Other countries with 1-4 users each
  { username: 'carlos', email: 'carlos@example.com', countryCode: 'ES', fullName: 'Carlos García', line1: 'Gran Vía 400', city: 'Madrid', postalCode: '28013', stats: { sent: 25, received: 30, traveling: 4, expired: 1 } },
  { username: 'lucia', email: 'lucia@example.com', countryCode: 'ES', fullName: 'Lucía López', line1: 'Las Ramblas 500', city: 'Barcelona', postalCode: '08002', stats: { sent: 29, received: 26, traveling: 3, expired: 2 } },
  { username: 'marco', email: 'marco@example.com', countryCode: 'IT', fullName: 'Marco Rossi', line1: 'Via del Corso 100', city: 'Rome', postalCode: '00187', stats: { sent: 31, received: 27, traveling: 4, expired: 2 } },
  { username: 'sofia', email: 'sofia@example.com', countryCode: 'IT', fullName: 'Sofia Bianchi', line1: 'Via Montenapoleone 200', city: 'Milan', postalCode: '20121', stats: { sent: 28, received: 34, traveling: 3, expired: 1 } },
  { username: 'jin', email: 'jin@example.com', countryCode: 'KR', fullName: 'Jin Park', line1: 'Gangnam District 1300', city: 'Seoul', postalCode: '06292', stats: { sent: 36, received: 33, traveling: 5, expired: 2 } },
  { username: 'soo', email: 'soo@example.com', countryCode: 'KR', fullName: 'Soo Kim', line1: 'Haeundae Beach 1400', city: 'Busan', postalCode: '48094', stats: { sent: 25, received: 30, traveling: 3, expired: 1 } },
  { username: 'alex', email: 'alex@example.com', countryCode: 'CA', fullName: 'Alex MacDonald', line1: '100 Queen Street West', city: 'Toronto', postalCode: 'M5H 2N2', stats: { sent: 27, received: 32, traveling: 4, expired: 2 } },
  { username: 'ryan', email: 'ryan.ca@example.com', countryCode: 'CA', fullName: 'Ryan Tremblay', line1: '300 Rue Saint-Paul', city: 'Montréal', postalCode: 'H2Y 1H3', stats: { sent: 31, received: 29, traveling: 5, expired: 2 } },
  { username: 'jake', email: 'jake@example.com', countryCode: 'AU', fullName: 'Jake Wilson', line1: '400 George Street', city: 'Sydney', postalCode: '2000', stats: { sent: 28, received: 34, traveling: 4, expired: 2 } },
  { username: 'chloe', email: 'chloe.au@example.com', countryCode: 'AU', fullName: 'Chloe Thompson', line1: '500 Collins Street', city: 'Melbourne', postalCode: '3000', stats: { sent: 23, received: 27, traveling: 3, expired: 1 } },
  { username: 'ana', email: 'ana@example.com', countryCode: 'BR', fullName: 'Ana Santos', line1: 'Copacabana Beach 200', city: 'Rio de Janeiro', postalCode: '22070-900', stats: { sent: 24, received: 31, traveling: 3, expired: 1 } },
  { username: 'pedro', email: 'pedro@example.com', countryCode: 'BR', fullName: 'Pedro Oliveira', line1: 'Pelourinho 300', city: 'Salvador', postalCode: '40026-280', stats: { sent: 17, received: 22, traveling: 2, expired: 0 } },
  { username: 'raj', email: 'raj@example.com', countryCode: 'IN', fullName: 'Raj Patel', line1: 'Marine Drive 300', city: 'Mumbai', postalCode: '400020', stats: { sent: 27, received: 33, traveling: 4, expired: 2 } },
  { username: 'priya', email: 'priya@example.com', countryCode: 'IN', fullName: 'Priya Sharma', line1: 'Connaught Place 400', city: 'New Delhi', postalCode: '110001', stats: { sent: 22, received: 28, traveling: 3, expired: 1 } },
  { username: 'ivan', email: 'ivan@example.com', countryCode: 'RU', fullName: 'Ivan Petrov', line1: 'Red Square 1', city: 'Moscow', postalCode: '109012', stats: { sent: 35, received: 30, traveling: 5, expired: 3 } },
  { username: 'natasha', email: 'natasha@example.com', countryCode: 'RU', fullName: 'Natasha Ivanova', line1: 'Nevsky Prospect 50', city: 'St. Petersburg', postalCode: '191025', stats: { sent: 26, received: 32, traveling: 4, expired: 2 } },
  { username: 'lars', email: 'lars@example.com', countryCode: 'SE', fullName: 'Lars Andersson', line1: 'Gamla Stan 800', city: 'Stockholm', postalCode: '111 29', stats: { sent: 27, received: 24, traveling: 4, expired: 2 } },
  { username: 'astrid', email: 'astrid@example.com', countryCode: 'SE', fullName: 'Astrid Johansson', line1: 'Avenyn 900', city: 'Gothenburg', postalCode: '411 36', stats: { sent: 22, received: 29, traveling: 3, expired: 1 } },
  { username: 'jan', email: 'jan@example.com', countryCode: 'NL', fullName: 'Jan de Vries', line1: 'Dam Square 600', city: 'Amsterdam', postalCode: '1012 JS', stats: { sent: 32, received: 28, traveling: 5, expired: 2 } },
  { username: 'emma', email: 'emma.nl@example.com', countryCode: 'NL', fullName: 'Emma van der Berg', line1: 'Coolsingel 700', city: 'Rotterdam', postalCode: '3012 AD', stats: { sent: 24, received: 31, traveling: 3, expired: 1 } },
  { username: 'cami', email: 'cami@example.com', countryCode: 'CL', fullName: 'Camila Rodriguez', line1: 'Calle 9', line2: 'Depto 1', city: 'Santiago', postalCode: '7500000', stats: { sent: 21, received: 25, traveling: 3, expired: 1 } },
  { username: 'diego', email: 'diego@example.com', countryCode: 'CL', fullName: 'Diego Morales', line1: 'Cerro Alegre 1500', city: 'Valparaíso', postalCode: '2340000', stats: { sent: 18, received: 22, traveling: 2, expired: 1 } },
  { username: 'erik', email: 'erik@example.com', countryCode: 'NO', fullName: 'Erik Hansen', line1: 'Karl Johans gate 1000', city: 'Oslo', postalCode: '0154', stats: { sent: 26, received: 23, traveling: 4, expired: 2 } },
  { username: 'mads', email: 'mads@example.com', countryCode: 'DK', fullName: 'Mads Nielsen', line1: 'Nyhavn 1100', city: 'Copenhagen', postalCode: '1051', stats: { sent: 30, received: 27, traveling: 3, expired: 1 } },
  { username: 'aino', email: 'aino@example.com', countryCode: 'FI', fullName: 'Aino Virtanen', line1: 'Senate Square 1200', city: 'Helsinki', postalCode: '00170', stats: { sent: 24, received: 28, traveling: 4, expired: 1 } },
  { username: 'mehmet', email: 'mehmet@example.com', countryCode: 'TR', fullName: 'Mehmet Öztürk', line1: 'Sultanahmet 2700', city: 'Istanbul', postalCode: '34122', stats: { sent: 30, received: 26, traveling: 5, expired: 2 } },
  { username: 'ahmed', email: 'ahmed@example.com', countryCode: 'EG', fullName: 'Ahmed Hassan', line1: 'Pyramids Road 2900', city: 'Cairo', postalCode: '11511', stats: { sent: 24, received: 21, traveling: 3, expired: 2 } },
  { username: 'somchai', email: 'somchai@example.com', countryCode: 'TH', fullName: 'Somchai Rattana', line1: 'Khao San Road 3000', city: 'Bangkok', postalCode: '10200', stats: { sent: 28, received: 32, traveling: 4, expired: 2 } },
  { username: 'omar', email: 'omar@example.com', countryCode: 'AE', fullName: 'Omar Al Maktoum', line1: 'Burj Khalifa 3900', city: 'Dubai', postalCode: '00000', stats: { sent: 32, received: 29, traveling: 5, expired: 2 } }
];

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
  console.log(`[seed] Will create ${realWorldUsers.length} users from around the world...`);

  const createdUsers = [];
  for (const userData of realWorldUsers) {
    const user = await createUserWithPrimaryAddress(userData);
    createdUsers.push(user);
  }

  console.log('[seed] Preloading receive credits (ReceivePool)...');
  // Create balanced credits to ensure variety in recipient selection
  const creditPromises = [];

  // Give each user 1-3 credits randomly to create variety
  for (const user of createdUsers) {
    const userData = realWorldUsers.find(u => u.username === user.username);
    // Random credits between 1-3, with popular users getting slightly more
    const baseCredits = Math.floor(Math.random() * 3) + 1; // 1-3 credits
    const bonusCredits = userData.stats.received > 30 ? Math.floor(Math.random() * 2) : 0; // 0-1 bonus
    const creditsToGive = Math.min(baseCredits + bonusCredits, 4); // Max 4 credits per user

    for (let i = 0; i < creditsToGive; i++) {
      creditPromises.push(
        ReceivePool.create({
          userId: user._id,
          countryCode: user.countryCode
        })
      );
    }
  }

  await Promise.all(creditPromises);

  console.log('[seed] Done!');
  console.log(`[seed] Created ${createdUsers.length} users from ${new Set(realWorldUsers.map(u => u.countryCode)).size} countries`);

  // Show some popular usernames for demo
  const popularUsers = ['alice', 'bruno', 'cami', 'dave', 'yuki', 'pierre', 'oliver', 'carlos', 'wei'];
  console.log('\n[seed] Popular demo users:');
  popularUsers.forEach(username => {
    const user = createdUsers.find(u => u.username === username);
    if (user) {
      const userData = realWorldUsers.find(u => u.username === username);
      console.log(`  ${username}: ${user._id.toString()} (${userData.countryCode}) - ${userData.city}`);
    }
  });

  console.log('\n[seed] Countries represented:');
  const countries = [...new Set(realWorldUsers.map(u => u.countryCode))].sort();
  countries.forEach(country => {
    const userCount = realWorldUsers.filter(u => u.countryCode === country).length;
    console.log(`  ${country}: ${userCount} users`);
  });

  console.log(`\n[seed] Total receive pool credits: ${creditPromises.length}`);
  console.log('\nNext steps:');
  console.log('  1) Start the server: npm run dev');
  console.log('  2) Open http://localhost:4000 in your browser');
  console.log('  3) Login with simple names: alice, yuki, pierre, oliver, carlos, wei, etc.');
  console.log('  4) Each user will get different random addresses from around the world!');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  mongoose.connection.readyState && mongoose.disconnect().catch(() => {});
  process.exit(1);
});
