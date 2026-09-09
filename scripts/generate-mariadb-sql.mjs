#!/usr/bin/env node
/**
 * Generates database/ghostlegion-mariadb-full.sql from the Prisma schema + seed data.
 * Run: node scripts/generate-mariadb-sql.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'database', 'ghostlegion-mariadb-full.sql');

function sqlStr(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return sqlStr(JSON.stringify(value));
}

function sqlDate(value) {
  if (!value) return 'NULL';
  const iso = value instanceof Date ? value.toISOString() : String(value);
  return sqlStr(iso.replace('T', ' ').replace('Z', ''));
}

const now = '2026-01-15 12:00:00.000';
const adminId = 'admin-ghost-legion';
const adminHash = '$2b$12$WTxE/gkOMsdGtc88z2MWq.QKRsm0GqFK5tvRz5MrWcKmrh.DgIr.W';

const schema = execFileSync(
  'npx',
  ['prisma', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'],
  { cwd: root, encoding: 'utf8' }
);

const locations = [
  ['loc-fort-pampus', 'Fort Pampus', 'FORTRESS', [52.4567, 5.1234], 'Historic fort in the IJmeer, suitable as command center and evacuation point', 200, 'ACTIVE', ['Communications', 'Medical Post', 'Storage', 'Sleeping Quarters'], '+31 20 1234567', 1],
  ['loc-den-haag-bunker', 'The Hague Bunker Complex', 'BUNKER', [52.0705, 4.3007], 'Underground complex under the Binnenhof, protected against nuclear attacks', 500, 'ACTIVE', ['Command Center', 'Communications', 'Medical Facilities', 'Storage'], '+31 70 1234567', 0],
  ['loc-amsterdam-rai', 'Amsterdam RAI Evacuation Center', 'EVACUATION_CENTER', [52.3364, 4.8903], 'Large exhibition hall suitable for mass evacuation', 5000, 'ACTIVE', ['Medical Post', 'Dining Hall', 'Sleeping Quarters', 'Sanitary Facilities'], '+31 20 5492222', 1],
  ['loc-utrecht-medical', 'Utrecht Medical Center', 'MEDICAL_FACILITY', [52.0907, 5.1214], 'Specialized trauma center for war casualties', 1000, 'ACTIVE', ['Operating Rooms', 'ICU', 'X-Ray', 'Pharmacy', 'Helipad'], '+31 88 7555555', 1],
  ['loc-maastricht-bunker', 'Maastricht Bunker', 'BUNKER', [50.8514, 5.691], 'Strategic location near German border', 150, 'ACTIVE', ['Communications', 'Storage', 'Sleeping Quarters'], '+31 43 1234567', 0],
];

const people = [
  ['ppl-van-der-berg', 'General van der Berg', 'COMMANDER', 'MILITARY', 'ACTIVE', 'Fort Pampus', ['Strategy', 'Leadership', 'Crisis Management'], '+31 6 12345678', 'TOP_SECRET', null],
  ['ppl-janssen', 'Dr. Sarah Janssen', 'DOCTOR', 'MEDICAL', 'ACTIVE', 'Utrecht Medical Center', ['Trauma Surgery', 'Emergency Medicine', 'Mass Casualty'], '+31 6 23456789', 'CONFIDENTIAL', null],
  ['ppl-pietersen', 'Captain Pietersen', 'SOLDIER', 'MILITARY', 'DEPLOYED', 'The Hague Bunker Complex', ['Infantry', 'EOD', 'Communications'], '+31 6 34567890', 'SECRET', null],
  ['ppl-van-dijk', 'Lisa van Dijk', 'VOLUNTEER', 'HUMANITARIAN', 'ACTIVE', 'Amsterdam RAI Evacuation Center', ['Logistics', 'Communications', 'First Aid'], '+31 6 45678901', 'PUBLIC', null],
];

const routes = [
  ['rte-ams-utrecht', 'Amsterdam to Utrecht', 'Amsterdam Centraal', 'Utrecht Centraal', [[52.3791, 4.9003], [52.0907, 5.1214]], 30, 1000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
  ['rte-denhaag-rotterdam', 'The Hague to Rotterdam', 'Den Haag Centraal', 'Rotterdam Centraal', [[52.0705, 4.3007], [51.9244, 4.4777]], 25, 800, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
  ['rte-groningen-germany', 'Groningen to Germany Border', 'Groningen Centraal', 'Bad Nieuweschans Border Crossing', [[53.2194, 6.5665], [53.1694, 7.0165], [53.1194, 7.1665]], 45, 15000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
  ['rte-friesland-denmark', 'Friesland to Denmark Ferry', 'Leeuwarden Central', 'Harlingen Ferry Port', [[53.2012, 5.8081], [53.175, 5.425], [53.1747, 5.425]], 60, 8000, 'OPEN', 'PUBLIC_TRANSPORT', 'MEDIUM', 1, 0, 1, 0, 1],
  ['rte-eindhoven-belgium', 'Eindhoven to Belgium Border', 'Eindhoven Central Station', 'Valkenswaard Border Crossing', [[51.4416, 5.4697], [51.35, 5.35], [51.3, 5.2]], 35, 12000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
  ['rte-maastricht-germany', 'Maastricht to Germany Border', 'Maastricht Central', 'Aachen Border Crossing', [[50.8514, 5.691], [50.8, 5.6], [50.75, 5.5]], 25, 10000, 'OPEN', 'PUBLIC_TRANSPORT', 'MEDIUM', 1, 0, 1, 0, 1],
  ['rte-amsterdam-germany', 'Amsterdam to Germany Border', 'Amsterdam Centraal', 'Arnhem Border Crossing', [[52.3676, 4.9041], [52.2, 5], [52, 5.2]], 90, 25000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
  ['rte-rotterdam-belgium', 'Rotterdam to Belgium Border', 'Rotterdam Centraal', 'Roosendaal Border Crossing', [[51.9244, 4.4777], [51.8, 4.5], [51.6, 4.4]], 75, 20000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1],
];

const resources = [
  ['0001', 'Emergency Food Rations', 'FOOD', 5000, 'packages', 'Central Warehouse, Amsterdam', 'AVAILABLE', '2025-12-31 00:00:00.000'],
  ['0002', 'Drinking Water', 'WATER', 10000, 'liters', 'Distribution Center, Rotterdam', 'AVAILABLE', null],
  ['0003', 'Canned Food', 'FOOD', 2000, 'cans', 'Fort Pampus', 'AVAILABLE', '2026-06-30 00:00:00.000'],
  ['0004', 'MRE (Meals Ready to Eat)', 'FOOD', 1500, 'meals', 'Military Supply Depot, Den Haag', 'AVAILABLE', '2027-03-15 00:00:00.000'],
  ['0005', 'Water Purification Tablets', 'WATER', 50000, 'tablets', 'Medical Supply Depot, Utrecht', 'AVAILABLE', '2026-12-31 00:00:00.000'],
  ['0006', 'Energy Bars', 'FOOD', 3000, 'bars', 'Central Warehouse, Amsterdam', 'AVAILABLE', '2025-08-31 00:00:00.000'],
  ['0007', 'Dehydrated Meals', 'FOOD', 800, 'meals', 'Military Supply Depot, Den Haag', 'AVAILABLE', '2028-12-31 00:00:00.000'],
  ['0008', 'Water Storage Tanks', 'WATER', 50, 'tanks', 'Distribution Center, Rotterdam', 'AVAILABLE', null],
  ['0009', 'First Aid Kits', 'MEDICAL', 500, 'kits', 'Medical Supply Depot, Utrecht', 'AVAILABLE', null],
  ['0010', 'Painkillers (Morphine)', 'MEDICAL', 2000, 'vials', 'Utrecht Medical Center', 'AVAILABLE', '2025-12-31 00:00:00.000'],
  ['0011', 'Antibiotics', 'MEDICAL', 1000, 'packages', 'Utrecht Medical Center', 'AVAILABLE', '2025-08-15 00:00:00.000'],
  ['0012', 'Blood Plasma', 'MEDICAL', 100, 'units', 'Utrecht Medical Center', 'LOW_STOCK', '2024-12-31 00:00:00.000'],
  ['0013', 'Surgical Instruments', 'MEDICAL', 50, 'sets', 'Utrecht Medical Center', 'AVAILABLE', null],
  ['0014', 'Bandages & Dressings', 'MEDICAL', 10000, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', null],
  ['0015', 'IV Fluids', 'MEDICAL', 500, 'bags', 'Utrecht Medical Center', 'AVAILABLE', '2025-06-30 00:00:00.000'],
  ['0016', 'Defibrillators', 'MEDICAL', 25, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', null],
  ['0017', 'Oxygen Tanks', 'MEDICAL', 100, 'tanks', 'Utrecht Medical Center', 'AVAILABLE', null],
  ['0018', 'Stretchers', 'MEDICAL', 75, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', null],
  ['0019', 'Diesel Fuel', 'FUEL', 5000, 'liters', 'Fuel Storage, Den Haag', 'AVAILABLE', null],
  ['0020', 'Gasoline', 'FUEL', 3000, 'liters', 'The Hague Bunker Complex', 'LOW_STOCK', null],
  ['0021', 'Portable Generators', 'EQUIPMENT', 25, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0022', 'Batteries (AA/AAA)', 'EQUIPMENT', 10000, 'packs', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0023', 'Solar Panels', 'EQUIPMENT', 100, 'panels', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0024', 'Power Banks', 'EQUIPMENT', 200, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0025', 'Fuel Cans (20L)', 'FUEL', 500, 'cans', 'Fuel Storage, Den Haag', 'AVAILABLE', null],
  ['0026', 'Radio Communication Sets', 'EQUIPMENT', 100, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0027', 'Satellite Phones', 'EQUIPMENT', 20, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0028', 'Protective Gear Sets', 'EQUIPMENT', 200, 'sets', 'Safety Equipment Store, Tilburg', 'AVAILABLE', null],
  ['0029', 'Gas Masks', 'EQUIPMENT', 500, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', null],
  ['0030', 'Body Armor', 'EQUIPMENT', 150, 'sets', 'Safety Equipment Store, Tilburg', 'AVAILABLE', null],
  ['0031', 'Helmets', 'EQUIPMENT', 300, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', null],
  ['0032', 'Night Vision Goggles', 'EQUIPMENT', 50, 'pairs', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0033', 'Tactical Radios', 'EQUIPMENT', 75, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0034', 'GPS Devices', 'EQUIPMENT', 100, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0035', 'Emergency Vehicles', 'TRANSPORT', 15, 'vehicles', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0036', 'Military Trucks', 'TRANSPORT', 8, 'vehicles', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0037', 'Ambulances', 'TRANSPORT', 12, 'vehicles', 'Medical Supply Depot, Utrecht', 'AVAILABLE', null],
  ['0038', 'Motorcycles', 'TRANSPORT', 20, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0039', 'ATVs (All-Terrain Vehicles)', 'TRANSPORT', 15, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0040', 'Boats (Rescue)', 'TRANSPORT', 8, 'boats', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0041', 'Helicopters', 'TRANSPORT', 3, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', null],
  ['0042', 'Rifle Ammunition (5.56mm)', 'AMMUNITION', 50000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0043', 'Pistol Ammunition (9mm)', 'AMMUNITION', 25000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0044', 'Grenades (Hand)', 'AMMUNITION', 500, 'units', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0045', 'Shotgun Shells', 'AMMUNITION', 10000, 'shells', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0046', 'Sniper Rifle Ammunition', 'AMMUNITION', 5000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0047', 'Machine Gun Ammunition', 'AMMUNITION', 75000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0048', 'Explosives (C4)', 'AMMUNITION', 100, 'blocks', 'Military Supply Depot, Den Haag', 'AVAILABLE', null],
  ['0049', 'Emergency Blankets', 'EQUIPMENT', 2000, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0050', 'Tents (4-person)', 'EQUIPMENT', 100, 'tents', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0051', 'Sleeping Bags', 'EQUIPMENT', 500, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0052', 'Portable Toilets', 'EQUIPMENT', 50, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0053', 'Shower Units', 'EQUIPMENT', 25, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0054', 'Heating Units', 'EQUIPMENT', 30, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', null],
  ['0055', 'Tool Kits (Complete)', 'EQUIPMENT', 50, 'kits', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0056', 'Rope & Cables', 'EQUIPMENT', 1000, 'meters', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0057', 'Flashlights', 'EQUIPMENT', 200, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', null],
  ['0058', 'Welding Equipment', 'EQUIPMENT', 15, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0059', 'Cutting Tools', 'EQUIPMENT', 100, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
  ['0060', 'Measuring Equipment', 'EQUIPMENT', 75, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', null],
];

const alerts = [
  ['alert-001', 'Demo Alert: Security Threat Level Elevated', 'Security threat level has been elevated to HIGH across all military installations. All personnel are advised to maintain heightened awareness and follow security protocols. Report any suspicious activities immediately to command centers.', 'HIGH', 'SECURITY', 'All Military Installations', '2025-09-15 18:00:00.000'],
  ['alert-002', 'Demo Alert: Evacuation Route Status Update', 'Primary evacuation route A1 (Amsterdam to Utrecht) is currently experiencing heavy traffic. Alternative route B2 via Den Haag is recommended. All civilians should follow official evacuation instructions and avoid panic.', 'MEDIUM', 'EVACUATION', 'Amsterdam-Utrecht Corridor', '2025-09-12 12:00:00.000'],
  ['alert-003', 'Demo Alert: Medical Supply Shortage', 'Critical shortage of medical supplies reported at Utrecht Medical Center. Blood plasma and surgical instruments are running low. All medical personnel are requested to prioritize essential treatments and coordinate with supply chain management.', 'HIGH', 'MEDICAL', 'Utrecht Medical Center', '2025-09-13 08:00:00.000'],
  ['alert-004', 'Demo Alert: Fuel Distribution Disruption', 'Fuel distribution network has been disrupted due to infrastructure damage. Emergency fuel reserves are being activated. All vehicles should conserve fuel and use only essential transportation. Military convoys have priority access.', 'CRITICAL', 'LOGISTICS', 'National Fuel Distribution Network', '2025-09-14 20:00:00.000'],
  ['alert-005', 'Demo Alert: Communication System Maintenance', 'Scheduled maintenance on primary communication systems will occur from 02:00 to 04:00. Backup communication channels will be active. All personnel should test backup systems and report any issues to IT support.', 'LOW', 'GENERAL', 'All Communication Centers', '2025-09-11 06:00:00.000'],
  ['alert-006', 'Demo Alert: Border Infiltration Warning', 'Intelligence reports indicate potential infiltration attempts along the German border. All border checkpoints are on high alert. Civilians should avoid border areas and report any suspicious activities immediately.', 'HIGH', 'SECURITY', 'German Border Region', '2025-09-16 10:00:00.000'],
  ['alert-007', 'Demo Alert: Emergency Shelter Capacity', 'Emergency shelters in Amsterdam and Rotterdam are approaching maximum capacity. Additional shelters are being prepared in Utrecht and Den Haag. Priority will be given to families with children and elderly citizens.', 'MEDIUM', 'EVACUATION', 'Major Cities', '2025-09-13 15:00:00.000'],
  ['alert-008', 'Demo Alert: Water Treatment Plant Status', 'Water treatment facilities are operating at reduced capacity due to power fluctuations. Water rationing may be necessary. All citizens are advised to conserve water and boil water before consumption as a precaution.', 'MEDIUM', 'GENERAL', 'National Water Treatment Network', '2025-09-12 18:00:00.000'],
  ['alert-009', 'Demo Alert: Military Convoy Movement', 'Large military convoy will be moving through major highways from 14:00 to 16:00. Civilian traffic will be redirected. Please plan your travel accordingly and follow traffic control instructions. Delays are expected.', 'LOW', 'LOGISTICS', 'A2, A4, A12 Highways', '2025-09-11 18:00:00.000'],
  ['alert-010', 'Demo Alert: Emergency Medical Response', 'Emergency medical response teams are on standby across all regions. In case of medical emergencies, call 112 immediately. Ambulance services are operating with military escort for security. Response times may be extended.', 'HIGH', 'MEDICAL', 'All Regions', '2025-09-15 12:00:00.000'],
  ['alert-011', 'Demo Alert: Power Grid Stabilization', 'Power grid is being stabilized after recent disruptions. Rolling blackouts may occur in some areas. Critical infrastructure has priority power access. Citizens are advised to conserve electricity and use generators if available.', 'MEDIUM', 'GENERAL', 'National Power Grid', '2025-09-12 22:00:00.000'],
  ['alert-012', 'Demo Alert: Food Distribution Update', 'Emergency food distribution centers are now operational in all major cities. Ration cards are required for collection. Distribution schedule: 08:00-12:00 and 14:00-18:00 daily. Bring valid identification.', 'LOW', 'LOGISTICS', 'All Major Cities', '2025-09-14 20:00:00.000'],
  ['alert-013', 'Demo Alert: Intelligence Briefing Required', 'All intelligence personnel are required to attend emergency briefing at 16:00. Classified information regarding current threat assessment will be discussed. Security clearance level 3 or higher required.', 'HIGH', 'SECURITY', 'Command Center, Den Haag', '2025-09-11 20:00:00.000'],
  ['alert-014', 'Demo Alert: Evacuation Protocol Activation', 'Evacuation protocols are now active for Zone 1 (Amsterdam city center). All civilians should proceed to designated assembly points. Follow evacuation routes marked with blue signs. Do not use private vehicles.', 'CRITICAL', 'EVACUATION', 'Amsterdam City Center', '2025-09-16 08:00:00.000'],
  ['alert-015', 'Demo Alert: Medical Personnel Mobilization', 'All medical personnel are requested to report to their assigned stations immediately. Emergency medical teams are being mobilized for field operations. Bring personal protective equipment and medical supplies.', 'HIGH', 'MEDICAL', 'All Medical Facilities', '2025-09-13 10:00:00.000'],
  ['alert-016', 'Demo Alert: Transportation Network Status', 'Public transportation is operating on emergency schedule. Train services are limited to essential routes only. Bus services are suspended in affected areas. Military transport is available for essential personnel.', 'MEDIUM', 'LOGISTICS', 'National Transportation Network', '2025-09-12 16:00:00.000'],
  ['alert-017', 'Demo Alert: Civilian Safety Advisory', 'All civilians are advised to stay indoors during night hours (22:00-06:00) unless absolutely necessary. Curfew is in effect for security reasons. Essential workers should carry identification and travel permits.', 'MEDIUM', 'GENERAL', 'All Civilian Areas', '2025-09-14 06:00:00.000'],
  ['alert-018', 'Demo Alert: Military Base Lockdown', 'All military bases are now on lockdown status. Only authorized personnel with valid credentials will be granted access. Family members should contact base command for information. Lockdown will be reviewed every 6 hours.', 'HIGH', 'SECURITY', 'All Military Bases', '2025-09-15 14:00:00.000'],
  ['alert-019', 'Demo Alert: Emergency Communication Protocol', 'Emergency communication protocol is now active. Use designated radio frequencies for official communications. Personal mobile devices should be used sparingly to preserve battery life. Report communication failures immediately.', 'LOW', 'GENERAL', 'All Communication Networks', '2025-09-11 23:59:00.000'],
  ['alert-020', 'Demo Alert: Resource Allocation Priority', 'Resource allocation priority has been established. Medical supplies and food have highest priority, followed by fuel and ammunition. All resource requests must be approved by logistics command. Unauthorized resource usage will be penalized.', 'MEDIUM', 'LOGISTICS', 'All Resource Distribution Centers', '2025-09-13 18:00:00.000'],
];

const notifications = [
  ['ntf-welcome', 'Welcome to Ghost Legion', 'Welcome to the Ghost Legion emergency management system. This platform provides real-time alerts, evacuation plans, and resource management tools. Explore the different sections to familiarize yourself with the available features.', 'INFO', 'LOW', null],
  ['ntf-maintenance', 'System Maintenance Scheduled', 'The Ghost Legion system will undergo scheduled maintenance. During this time, some features may be temporarily unavailable. We apologize for any inconvenience.', 'SYSTEM', 'MEDIUM', '2026-12-31 23:59:59.000'],
  ['ntf-weather', 'Emergency Alert: Severe Weather Warning', 'A severe weather warning has been issued for Northern Netherlands. High winds and heavy rainfall are expected. Please stay indoors and avoid unnecessary travel. Emergency services are on standby.', 'EMERGENCY', 'CRITICAL', '2026-12-31 23:59:59.000'],
  ['ntf-routes', 'New Evacuation Routes Available', 'New evacuation routes have been added to the system, including Amsterdam to Germany Border and Rotterdam to Belgium Border. These routes are now active and available for use.', 'INFO', 'MEDIUM', '2026-12-31 23:59:59.000'],
  ['ntf-security', 'Security Update Required', 'All users are required to update their passwords. This is a mandatory security update to ensure the safety of our systems. Please log in and follow the password update prompts.', 'WARNING', 'HIGH', '2026-12-31 23:59:59.000'],
];

const lines = [];
lines.push('-- Ghost Legion MariaDB dump');
lines.push('-- Database: ghos_t_legion_online');
lines.push('-- Import in phpMyAdmin / CyberPanel SQL importer (select the database first),');
lines.push('-- or: mysql -u ghos_t_legion_online -p ghos_t_legion_online < database/ghostlegion-mariadb-full.sql');
lines.push('--');
lines.push('-- Default admin login after import:');
lines.push('--   email:    admin@ghostlegion.online');
lines.push('--   password: ChangeMe!GhostLegion');
lines.push('-- CHANGE THIS PASSWORD immediately after first login.');
lines.push('');
lines.push('SET NAMES utf8mb4;');
lines.push('SET FOREIGN_KEY_CHECKS = 0;');
lines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
lines.push('');
lines.push('-- Create the database in CyberPanel first (name: ghos_t_legion_online).');
lines.push('-- Uncomment the next line only if your MySQL user is allowed to create databases:');
lines.push('-- CREATE DATABASE IF NOT EXISTS `ghos_t_legion_online` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
lines.push('USE `ghos_t_legion_online`;');
lines.push('');
lines.push('DROP TABLE IF EXISTS `Account`;');
lines.push('DROP TABLE IF EXISTS `Session`;');
lines.push('DROP TABLE IF EXISTS `People`;');
lines.push('DROP TABLE IF EXISTS `VerificationToken`;');
lines.push('DROP TABLE IF EXISTS `Notification`;');
lines.push('DROP TABLE IF EXISTS `Location`;');
lines.push('DROP TABLE IF EXISTS `EvacuationRoute`;');
lines.push('DROP TABLE IF EXISTS `Resource`;');
lines.push('DROP TABLE IF EXISTS `Alert`;');
lines.push('DROP TABLE IF EXISTS `MapElement`;');
lines.push('DROP TABLE IF EXISTS `User`;');
lines.push('');
lines.push(schema.trim());
lines.push('');
lines.push('-- Seed data');
lines.push(`INSERT INTO \`User\` (\`id\`, \`name\`, \`email\`, \`emailVerified\`, \`image\`, \`password\`, \`role\`, \`isActive\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(`(${sqlStr(adminId)}, ${sqlStr('System Administrator')}, ${sqlStr('admin@ghostlegion.online')}, NULL, NULL, ${sqlStr(adminHash)}, 'ADMIN', 1, ${sqlStr(now)}, ${sqlStr(now)});`);
lines.push('');

lines.push(`INSERT INTO \`Location\` (\`id\`, \`name\`, \`type\`, \`coordinates\`, \`description\`, \`capacity\`, \`status\`, \`facilities\`, \`contact\`, \`isPublic\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(
  locations
    .map(
      ([id, name, type, coords, desc, cap, status, fac, contact, pub], i) =>
        `(${sqlStr(id)}, ${sqlStr(name)}, '${type}', ${sqlJson(coords)}, ${sqlStr(desc)}, ${cap}, '${status}', ${sqlJson(fac)}, ${sqlStr(contact)}, ${pub}, ${sqlStr(now)}, ${sqlStr(now)})${i === locations.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');

lines.push(`INSERT INTO \`People\` (\`id\`, \`name\`, \`role\`, \`department\`, \`status\`, \`location\`, \`skills\`, \`contact\`, \`clearanceLevel\`, \`userId\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(
  people
    .map(
      ([id, name, role, dept, status, loc, skills, contact, clear, userId], i) =>
        `(${sqlStr(id)}, ${sqlStr(name)}, '${role}', '${dept}', '${status}', ${sqlStr(loc)}, ${sqlJson(skills)}, ${sqlStr(contact)}, '${clear}', ${sqlStr(userId)}, ${sqlStr(now)}, ${sqlStr(now)})${i === people.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');

lines.push(`INSERT INTO \`EvacuationRoute\` (\`id\`, \`name\`, \`startLocation\`, \`endLocation\`, \`waypoints\`, \`estimatedTime\`, \`capacity\`, \`status\`, \`transportType\`, \`priority\`, \`enableNotifications\`, \`isPriorityRoute\`, \`allowReverseDirection\`, \`requiresEscort\`, \`showDemoOverlay\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(
  routes
    .map(
      ([id, name, start, end, wp, time, cap, status, transport, prio, notif, prioR, rev, escort, demo], i) =>
        `(${sqlStr(id)}, ${sqlStr(name)}, ${sqlStr(start)}, ${sqlStr(end)}, ${sqlJson(wp)}, ${time}, ${cap}, '${status}', '${transport}', '${prio}', ${notif}, ${prioR}, ${rev}, ${escort}, ${demo}, ${sqlStr(now)}, ${sqlStr(now)})${i === routes.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');

lines.push(`INSERT INTO \`Resource\` (\`id\`, \`name\`, \`type\`, \`quantity\`, \`unit\`, \`location\`, \`status\`, \`expiryDate\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(
  resources
    .map(
      ([id, name, type, qty, unit, loc, status, expiry], i) =>
        `(${sqlStr(id)}, ${sqlStr(name)}, '${type}', ${qty}, ${sqlStr(unit)}, ${sqlStr(loc)}, '${status}', ${sqlDate(expiry)}, ${sqlStr(now)}, ${sqlStr(now)})${i === resources.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');

lines.push(`INSERT INTO \`Alert\` (\`id\`, \`title\`, \`message\`, \`severity\`, \`type\`, \`location\`, \`expiresAt\`, \`acknowledgedBy\`, \`notifyUsers\`, \`isUrgent\`, \`autoResolve\`, \`requiresAcknowledgment\`, \`showDemoOverlay\`, \`createdAt\`, \`updatedAt\`) VALUES`);
lines.push(
  alerts
    .map(
      ([id, title, message, sev, type, loc, exp], i) =>
        `(${sqlStr(id)}, ${sqlStr(title)}, ${sqlStr(message)}, '${sev}', '${type}', ${sqlStr(loc)}, ${sqlDate(exp)}, ${sqlJson([])}, 0, 0, 0, 0, 1, ${sqlStr(now)}, ${sqlStr(now)})${i === alerts.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');

lines.push(`INSERT INTO \`Notification\` (\`id\`, \`title\`, \`message\`, \`type\`, \`priority\`, \`isRead\`, \`isPublic\`, \`targetUsers\`, \`readByUsers\`, \`readByIPs\`, \`expiresAt\`, \`createdAt\`, \`updatedAt\`, \`isApproved\`, \`approvedBy\`, \`approvedAt\`, \`createdBy\`, \`status\`) VALUES`);
lines.push(
  notifications
    .map(
      ([id, title, message, type, prio, exp], i) =>
        `(${sqlStr(id)}, ${sqlStr(title)}, ${sqlStr(message)}, '${type}', '${prio}', 0, 1, ${sqlJson([])}, ${sqlJson([])}, ${sqlJson([])}, ${sqlDate(exp)}, ${sqlStr(now)}, ${sqlStr(now)}, 1, ${sqlStr(adminId)}, ${sqlStr(now)}, ${sqlStr(adminId)}, 'APPROVED')${i === notifications.length - 1 ? ';' : ','}`
    )
    .join('\n')
);
lines.push('');
lines.push('SET FOREIGN_KEY_CHECKS = 1;');
lines.push('');

mkdirSync(join(root, 'database'), { recursive: true });
writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${outFile}`);
