-- Ghost Legion MariaDB dump
-- Database: ghos_t_legion_online
-- Import in phpMyAdmin / CyberPanel SQL importer (select the database first),
-- or: mysql -u ghos_t_legion_online -p ghos_t_legion_online < database/ghostlegion-mariadb-full.sql
--
-- Default admin login after import:
--   email:    admin@ghostlegion.online
--   password: ChangeMe!GhostLegion
-- CHANGE THIS PASSWORD immediately after first login.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Create the database in CyberPanel first (name: ghos_t_legion_online).
-- Uncomment the next line only if your MySQL user is allowed to create databases:
-- CREATE DATABASE IF NOT EXISTS `ghos_t_legion_online` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ghos_t_legion_online`;

DROP TABLE IF EXISTS `Account`;
DROP TABLE IF EXISTS `Session`;
DROP TABLE IF EXISTS `People`;
DROP TABLE IF EXISTS `VerificationToken`;
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Location`;
DROP TABLE IF EXISTS `EvacuationRoute`;
DROP TABLE IF EXISTS `Resource`;
DROP TABLE IF EXISTS `Alert`;
DROP TABLE IF EXISTS `MapElement`;
DROP TABLE IF EXISTS `User`;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'COMMANDER', 'OFFICER', 'MEDICAL', 'LOGISTICS', 'COMMUNICATION', 'SECURITY', 'VOLUNTEER', 'USER') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'ALERT', 'EMERGENCY', 'SYSTEM') NOT NULL DEFAULT 'INFO',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `targetUsers` JSON NOT NULL,
    `readByUsers` JSON NOT NULL,
    `readByIPs` JSON NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('BUNKER', 'FORTRESS', 'HIDING_PLACE', 'EVACUATION_CENTER', 'MEDICAL_FACILITY', 'COMMAND_CENTER', 'SUPPLY_DEPOT') NOT NULL,
    `coordinates` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `capacity` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DAMAGED', 'UNDER_CONSTRUCTION') NOT NULL DEFAULT 'ACTIVE',
    `facilities` JSON NOT NULL,
    `contact` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `People` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('SOLDIER', 'COMMANDER', 'INTELLIGENCE_ANALYST', 'EOD_SPECIALIST', 'SNIPER', 'TANK_CREW', 'PILOT', 'NAVAL_FORCE', 'MILITARY_MEDIC', 'LOGISTICS_MANAGER', 'CYBERSECURITY_EXPERT', 'MILITARY_POLICE', 'PSYOPS_SPECIALIST', 'WEAPONS_ENGINEER', 'GOVERNMENT_LEADER', 'EMERGENCY_COORDINATOR', 'CIVIL_DEFENSE', 'EVACUATION_PLANNER', 'DIPLOMATIC_PERSONNEL', 'UN_PERSONNEL', 'RED_CROSS_WORKER', 'NGO_STAFF', 'REFUGEE_COORDINATOR', 'FIELD_MEDIC', 'TRAUMA_COUNSELOR', 'VOLUNTEER', 'TRANSLATOR', 'SOCIAL_WORKER', 'CHILD_PROTECTION', 'DOCTOR', 'SURGEON', 'PARAMEDIC', 'NURSE', 'PHARMACIST', 'MENTAL_HEALTH_PROFESSIONAL', 'TRUCK_DRIVER', 'PILOT_CIVILIAN', 'WAREHOUSE_MANAGER', 'CONSTRUCTION_WORKER', 'JOURNALIST', 'IT_SPECIALIST', 'COMMUNICATION_OPERATOR', 'LIBRARIAN', 'POLICE_OFFICER', 'SECURITY_GUARD', 'BORDER_GUARD', 'COUNTERINTELLIGENCE', 'TEACHER', 'RELIGIOUS_LEADER', 'BUSINESS_OWNER', 'DEVELOPER', 'FARMER') NOT NULL,
    `department` ENUM('MILITARY', 'GOVERNMENT', 'HUMANITARIAN', 'MEDICAL', 'LOGISTICS', 'COMMUNICATION', 'LAW_ENFORCEMENT', 'CIVILIAN', 'VOLUNTEER') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DEPLOYED', 'INJURED', 'MISSING') NOT NULL DEFAULT 'ACTIVE',
    `location` VARCHAR(191) NULL,
    `skills` JSON NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `clearanceLevel` ENUM('PUBLIC', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET') NOT NULL DEFAULT 'PUBLIC',
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `People_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvacuationRoute` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startLocation` VARCHAR(191) NOT NULL,
    `endLocation` VARCHAR(191) NOT NULL,
    `waypoints` JSON NOT NULL,
    `estimatedTime` INTEGER NOT NULL,
    `capacity` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'CLOSED', 'CONGESTED', 'DANGEROUS') NOT NULL DEFAULT 'OPEN',
    `transportType` ENUM('FOOT', 'VEHICLE', 'PUBLIC_TRANSPORT', 'MILITARY_VEHICLE') NOT NULL,
    `priority` ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `enableNotifications` BOOLEAN NOT NULL DEFAULT false,
    `isPriorityRoute` BOOLEAN NOT NULL DEFAULT false,
    `allowReverseDirection` BOOLEAN NOT NULL DEFAULT false,
    `requiresEscort` BOOLEAN NOT NULL DEFAULT false,
    `showDemoOverlay` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FOOD', 'WATER', 'MEDICAL', 'FUEL', 'AMMUNITION', 'EQUIPMENT', 'TRANSPORT') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'DAMAGED') NOT NULL DEFAULT 'AVAILABLE',
    `expiryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `type` ENUM('SECURITY', 'EVACUATION', 'MEDICAL', 'LOGISTICS', 'GENERAL') NOT NULL,
    `location` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `acknowledgedBy` JSON NOT NULL,
    `notifyUsers` BOOLEAN NOT NULL DEFAULT false,
    `isUrgent` BOOLEAN NOT NULL DEFAULT false,
    `autoResolve` BOOLEAN NOT NULL DEFAULT false,
    `requiresAcknowledgment` BOOLEAN NOT NULL DEFAULT false,
    `showDemoOverlay` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MapElement` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('POLYGON', 'POLYLINE', 'CIRCLE', 'MARKER') NOT NULL,
    `coordinates` JSON NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `size` INTEGER NULL,
    `label` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `risk` ENUM('HIGH', 'MEDIUM', 'LOW') NULL DEFAULT 'LOW',
    `category` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `People` ADD CONSTRAINT `People_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed data
INSERT INTO `User` (`id`, `name`, `email`, `emailVerified`, `image`, `password`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
('admin-ghost-legion', 'System Administrator', 'admin@ghostlegion.online', NULL, NULL, '$2b$12$WTxE/gkOMsdGtc88z2MWq.QKRsm0GqFK5tvRz5MrWcKmrh.DgIr.W', 'ADMIN', 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `Location` (`id`, `name`, `type`, `coordinates`, `description`, `capacity`, `status`, `facilities`, `contact`, `isPublic`, `createdAt`, `updatedAt`) VALUES
('loc-fort-pampus', 'Fort Pampus', 'FORTRESS', '[52.4567,5.1234]', 'Historic fort in the IJmeer, suitable as command center and evacuation point', 200, 'ACTIVE', '["Communications","Medical Post","Storage","Sleeping Quarters"]', '+31 20 1234567', 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('loc-den-haag-bunker', 'The Hague Bunker Complex', 'BUNKER', '[52.0705,4.3007]', 'Underground complex under the Binnenhof, protected against nuclear attacks', 500, 'ACTIVE', '["Command Center","Communications","Medical Facilities","Storage"]', '+31 70 1234567', 0, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('loc-amsterdam-rai', 'Amsterdam RAI Evacuation Center', 'EVACUATION_CENTER', '[52.3364,4.8903]', 'Large exhibition hall suitable for mass evacuation', 5000, 'ACTIVE', '["Medical Post","Dining Hall","Sleeping Quarters","Sanitary Facilities"]', '+31 20 5492222', 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('loc-utrecht-medical', 'Utrecht Medical Center', 'MEDICAL_FACILITY', '[52.0907,5.1214]', 'Specialized trauma center for war casualties', 1000, 'ACTIVE', '["Operating Rooms","ICU","X-Ray","Pharmacy","Helipad"]', '+31 88 7555555', 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('loc-maastricht-bunker', 'Maastricht Bunker', 'BUNKER', '[50.8514,5.691]', 'Strategic location near German border', 150, 'ACTIVE', '["Communications","Storage","Sleeping Quarters"]', '+31 43 1234567', 0, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `People` (`id`, `name`, `role`, `department`, `status`, `location`, `skills`, `contact`, `clearanceLevel`, `userId`, `createdAt`, `updatedAt`) VALUES
('ppl-van-der-berg', 'General van der Berg', 'COMMANDER', 'MILITARY', 'ACTIVE', 'Fort Pampus', '["Strategy","Leadership","Crisis Management"]', '+31 6 12345678', 'TOP_SECRET', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('ppl-janssen', 'Dr. Sarah Janssen', 'DOCTOR', 'MEDICAL', 'ACTIVE', 'Utrecht Medical Center', '["Trauma Surgery","Emergency Medicine","Mass Casualty"]', '+31 6 23456789', 'CONFIDENTIAL', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('ppl-pietersen', 'Captain Pietersen', 'SOLDIER', 'MILITARY', 'DEPLOYED', 'The Hague Bunker Complex', '["Infantry","EOD","Communications"]', '+31 6 34567890', 'SECRET', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('ppl-van-dijk', 'Lisa van Dijk', 'VOLUNTEER', 'HUMANITARIAN', 'ACTIVE', 'Amsterdam RAI Evacuation Center', '["Logistics","Communications","First Aid"]', '+31 6 45678901', 'PUBLIC', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `EvacuationRoute` (`id`, `name`, `startLocation`, `endLocation`, `waypoints`, `estimatedTime`, `capacity`, `status`, `transportType`, `priority`, `enableNotifications`, `isPriorityRoute`, `allowReverseDirection`, `requiresEscort`, `showDemoOverlay`, `createdAt`, `updatedAt`) VALUES
('rte-ams-utrecht', 'Amsterdam to Utrecht', 'Amsterdam Centraal', 'Utrecht Centraal', '[[52.3791,4.9003],[52.0907,5.1214]]', 30, 1000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-denhaag-rotterdam', 'The Hague to Rotterdam', 'Den Haag Centraal', 'Rotterdam Centraal', '[[52.0705,4.3007],[51.9244,4.4777]]', 25, 800, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-groningen-germany', 'Groningen to Germany Border', 'Groningen Centraal', 'Bad Nieuweschans Border Crossing', '[[53.2194,6.5665],[53.1694,7.0165],[53.1194,7.1665]]', 45, 15000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-friesland-denmark', 'Friesland to Denmark Ferry', 'Leeuwarden Central', 'Harlingen Ferry Port', '[[53.2012,5.8081],[53.175,5.425],[53.1747,5.425]]', 60, 8000, 'OPEN', 'PUBLIC_TRANSPORT', 'MEDIUM', 1, 0, 1, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-eindhoven-belgium', 'Eindhoven to Belgium Border', 'Eindhoven Central Station', 'Valkenswaard Border Crossing', '[[51.4416,5.4697],[51.35,5.35],[51.3,5.2]]', 35, 12000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-maastricht-germany', 'Maastricht to Germany Border', 'Maastricht Central', 'Aachen Border Crossing', '[[50.8514,5.691],[50.8,5.6],[50.75,5.5]]', 25, 10000, 'OPEN', 'PUBLIC_TRANSPORT', 'MEDIUM', 1, 0, 1, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-amsterdam-germany', 'Amsterdam to Germany Border', 'Amsterdam Centraal', 'Arnhem Border Crossing', '[[52.3676,4.9041],[52.2,5],[52,5.2]]', 90, 25000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('rte-rotterdam-belgium', 'Rotterdam to Belgium Border', 'Rotterdam Centraal', 'Roosendaal Border Crossing', '[[51.9244,4.4777],[51.8,4.5],[51.6,4.4]]', 75, 20000, 'OPEN', 'PUBLIC_TRANSPORT', 'HIGH', 1, 1, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `Resource` (`id`, `name`, `type`, `quantity`, `unit`, `location`, `status`, `expiryDate`, `createdAt`, `updatedAt`) VALUES
('0001', 'Emergency Food Rations', 'FOOD', 5000, 'packages', 'Central Warehouse, Amsterdam', 'AVAILABLE', '2025-12-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0002', 'Drinking Water', 'WATER', 10000, 'liters', 'Distribution Center, Rotterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0003', 'Canned Food', 'FOOD', 2000, 'cans', 'Fort Pampus', 'AVAILABLE', '2026-06-30 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0004', 'MRE (Meals Ready to Eat)', 'FOOD', 1500, 'meals', 'Military Supply Depot, Den Haag', 'AVAILABLE', '2027-03-15 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0005', 'Water Purification Tablets', 'WATER', 50000, 'tablets', 'Medical Supply Depot, Utrecht', 'AVAILABLE', '2026-12-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0006', 'Energy Bars', 'FOOD', 3000, 'bars', 'Central Warehouse, Amsterdam', 'AVAILABLE', '2025-08-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0007', 'Dehydrated Meals', 'FOOD', 800, 'meals', 'Military Supply Depot, Den Haag', 'AVAILABLE', '2028-12-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0008', 'Water Storage Tanks', 'WATER', 50, 'tanks', 'Distribution Center, Rotterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0009', 'First Aid Kits', 'MEDICAL', 500, 'kits', 'Medical Supply Depot, Utrecht', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0010', 'Painkillers (Morphine)', 'MEDICAL', 2000, 'vials', 'Utrecht Medical Center', 'AVAILABLE', '2025-12-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0011', 'Antibiotics', 'MEDICAL', 1000, 'packages', 'Utrecht Medical Center', 'AVAILABLE', '2025-08-15 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0012', 'Blood Plasma', 'MEDICAL', 100, 'units', 'Utrecht Medical Center', 'LOW_STOCK', '2024-12-31 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0013', 'Surgical Instruments', 'MEDICAL', 50, 'sets', 'Utrecht Medical Center', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0014', 'Bandages & Dressings', 'MEDICAL', 10000, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0015', 'IV Fluids', 'MEDICAL', 500, 'bags', 'Utrecht Medical Center', 'AVAILABLE', '2025-06-30 00:00:00.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0016', 'Defibrillators', 'MEDICAL', 25, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0017', 'Oxygen Tanks', 'MEDICAL', 100, 'tanks', 'Utrecht Medical Center', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0018', 'Stretchers', 'MEDICAL', 75, 'units', 'Medical Supply Depot, Utrecht', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0019', 'Diesel Fuel', 'FUEL', 5000, 'liters', 'Fuel Storage, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0020', 'Gasoline', 'FUEL', 3000, 'liters', 'The Hague Bunker Complex', 'LOW_STOCK', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0021', 'Portable Generators', 'EQUIPMENT', 25, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0022', 'Batteries (AA/AAA)', 'EQUIPMENT', 10000, 'packs', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0023', 'Solar Panels', 'EQUIPMENT', 100, 'panels', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0024', 'Power Banks', 'EQUIPMENT', 200, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0025', 'Fuel Cans (20L)', 'FUEL', 500, 'cans', 'Fuel Storage, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0026', 'Radio Communication Sets', 'EQUIPMENT', 100, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0027', 'Satellite Phones', 'EQUIPMENT', 20, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0028', 'Protective Gear Sets', 'EQUIPMENT', 200, 'sets', 'Safety Equipment Store, Tilburg', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0029', 'Gas Masks', 'EQUIPMENT', 500, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0030', 'Body Armor', 'EQUIPMENT', 150, 'sets', 'Safety Equipment Store, Tilburg', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0031', 'Helmets', 'EQUIPMENT', 300, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0032', 'Night Vision Goggles', 'EQUIPMENT', 50, 'pairs', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0033', 'Tactical Radios', 'EQUIPMENT', 75, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0034', 'GPS Devices', 'EQUIPMENT', 100, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0035', 'Emergency Vehicles', 'TRANSPORT', 15, 'vehicles', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0036', 'Military Trucks', 'TRANSPORT', 8, 'vehicles', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0037', 'Ambulances', 'TRANSPORT', 12, 'vehicles', 'Medical Supply Depot, Utrecht', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0038', 'Motorcycles', 'TRANSPORT', 20, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0039', 'ATVs (All-Terrain Vehicles)', 'TRANSPORT', 15, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0040', 'Boats (Rescue)', 'TRANSPORT', 8, 'boats', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0041', 'Helicopters', 'TRANSPORT', 3, 'units', 'Vehicle Depot, Groningen', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0042', 'Rifle Ammunition (5.56mm)', 'AMMUNITION', 50000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0043', 'Pistol Ammunition (9mm)', 'AMMUNITION', 25000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0044', 'Grenades (Hand)', 'AMMUNITION', 500, 'units', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0045', 'Shotgun Shells', 'AMMUNITION', 10000, 'shells', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0046', 'Sniper Rifle Ammunition', 'AMMUNITION', 5000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0047', 'Machine Gun Ammunition', 'AMMUNITION', 75000, 'rounds', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0048', 'Explosives (C4)', 'AMMUNITION', 100, 'blocks', 'Military Supply Depot, Den Haag', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0049', 'Emergency Blankets', 'EQUIPMENT', 2000, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0050', 'Tents (4-person)', 'EQUIPMENT', 100, 'tents', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0051', 'Sleeping Bags', 'EQUIPMENT', 500, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0052', 'Portable Toilets', 'EQUIPMENT', 50, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0053', 'Shower Units', 'EQUIPMENT', 25, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0054', 'Heating Units', 'EQUIPMENT', 30, 'units', 'Central Warehouse, Amsterdam', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0055', 'Tool Kits (Complete)', 'EQUIPMENT', 50, 'kits', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0056', 'Rope & Cables', 'EQUIPMENT', 1000, 'meters', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0057', 'Flashlights', 'EQUIPMENT', 200, 'units', 'Safety Equipment Store, Tilburg', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0058', 'Welding Equipment', 'EQUIPMENT', 15, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0059', 'Cutting Tools', 'EQUIPMENT', 100, 'sets', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('0060', 'Measuring Equipment', 'EQUIPMENT', 75, 'units', 'Tech Warehouse, Eindhoven', 'AVAILABLE', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `Alert` (`id`, `title`, `message`, `severity`, `type`, `location`, `expiresAt`, `acknowledgedBy`, `notifyUsers`, `isUrgent`, `autoResolve`, `requiresAcknowledgment`, `showDemoOverlay`, `createdAt`, `updatedAt`) VALUES
('alert-001', 'Demo Alert: Security Threat Level Elevated', 'Security threat level has been elevated to HIGH across all military installations. All personnel are advised to maintain heightened awareness and follow security protocols. Report any suspicious activities immediately to command centers.', 'HIGH', 'SECURITY', 'All Military Installations', '2025-09-15 18:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-002', 'Demo Alert: Evacuation Route Status Update', 'Primary evacuation route A1 (Amsterdam to Utrecht) is currently experiencing heavy traffic. Alternative route B2 via Den Haag is recommended. All civilians should follow official evacuation instructions and avoid panic.', 'MEDIUM', 'EVACUATION', 'Amsterdam-Utrecht Corridor', '2025-09-12 12:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-003', 'Demo Alert: Medical Supply Shortage', 'Critical shortage of medical supplies reported at Utrecht Medical Center. Blood plasma and surgical instruments are running low. All medical personnel are requested to prioritize essential treatments and coordinate with supply chain management.', 'HIGH', 'MEDICAL', 'Utrecht Medical Center', '2025-09-13 08:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-004', 'Demo Alert: Fuel Distribution Disruption', 'Fuel distribution network has been disrupted due to infrastructure damage. Emergency fuel reserves are being activated. All vehicles should conserve fuel and use only essential transportation. Military convoys have priority access.', 'CRITICAL', 'LOGISTICS', 'National Fuel Distribution Network', '2025-09-14 20:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-005', 'Demo Alert: Communication System Maintenance', 'Scheduled maintenance on primary communication systems will occur from 02:00 to 04:00. Backup communication channels will be active. All personnel should test backup systems and report any issues to IT support.', 'LOW', 'GENERAL', 'All Communication Centers', '2025-09-11 06:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-006', 'Demo Alert: Border Infiltration Warning', 'Intelligence reports indicate potential infiltration attempts along the German border. All border checkpoints are on high alert. Civilians should avoid border areas and report any suspicious activities immediately.', 'HIGH', 'SECURITY', 'German Border Region', '2025-09-16 10:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-007', 'Demo Alert: Emergency Shelter Capacity', 'Emergency shelters in Amsterdam and Rotterdam are approaching maximum capacity. Additional shelters are being prepared in Utrecht and Den Haag. Priority will be given to families with children and elderly citizens.', 'MEDIUM', 'EVACUATION', 'Major Cities', '2025-09-13 15:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-008', 'Demo Alert: Water Treatment Plant Status', 'Water treatment facilities are operating at reduced capacity due to power fluctuations. Water rationing may be necessary. All citizens are advised to conserve water and boil water before consumption as a precaution.', 'MEDIUM', 'GENERAL', 'National Water Treatment Network', '2025-09-12 18:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-009', 'Demo Alert: Military Convoy Movement', 'Large military convoy will be moving through major highways from 14:00 to 16:00. Civilian traffic will be redirected. Please plan your travel accordingly and follow traffic control instructions. Delays are expected.', 'LOW', 'LOGISTICS', 'A2, A4, A12 Highways', '2025-09-11 18:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-010', 'Demo Alert: Emergency Medical Response', 'Emergency medical response teams are on standby across all regions. In case of medical emergencies, call 112 immediately. Ambulance services are operating with military escort for security. Response times may be extended.', 'HIGH', 'MEDICAL', 'All Regions', '2025-09-15 12:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-011', 'Demo Alert: Power Grid Stabilization', 'Power grid is being stabilized after recent disruptions. Rolling blackouts may occur in some areas. Critical infrastructure has priority power access. Citizens are advised to conserve electricity and use generators if available.', 'MEDIUM', 'GENERAL', 'National Power Grid', '2025-09-12 22:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-012', 'Demo Alert: Food Distribution Update', 'Emergency food distribution centers are now operational in all major cities. Ration cards are required for collection. Distribution schedule: 08:00-12:00 and 14:00-18:00 daily. Bring valid identification.', 'LOW', 'LOGISTICS', 'All Major Cities', '2025-09-14 20:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-013', 'Demo Alert: Intelligence Briefing Required', 'All intelligence personnel are required to attend emergency briefing at 16:00. Classified information regarding current threat assessment will be discussed. Security clearance level 3 or higher required.', 'HIGH', 'SECURITY', 'Command Center, Den Haag', '2025-09-11 20:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-014', 'Demo Alert: Evacuation Protocol Activation', 'Evacuation protocols are now active for Zone 1 (Amsterdam city center). All civilians should proceed to designated assembly points. Follow evacuation routes marked with blue signs. Do not use private vehicles.', 'CRITICAL', 'EVACUATION', 'Amsterdam City Center', '2025-09-16 08:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-015', 'Demo Alert: Medical Personnel Mobilization', 'All medical personnel are requested to report to their assigned stations immediately. Emergency medical teams are being mobilized for field operations. Bring personal protective equipment and medical supplies.', 'HIGH', 'MEDICAL', 'All Medical Facilities', '2025-09-13 10:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-016', 'Demo Alert: Transportation Network Status', 'Public transportation is operating on emergency schedule. Train services are limited to essential routes only. Bus services are suspended in affected areas. Military transport is available for essential personnel.', 'MEDIUM', 'LOGISTICS', 'National Transportation Network', '2025-09-12 16:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-017', 'Demo Alert: Civilian Safety Advisory', 'All civilians are advised to stay indoors during night hours (22:00-06:00) unless absolutely necessary. Curfew is in effect for security reasons. Essential workers should carry identification and travel permits.', 'MEDIUM', 'GENERAL', 'All Civilian Areas', '2025-09-14 06:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-018', 'Demo Alert: Military Base Lockdown', 'All military bases are now on lockdown status. Only authorized personnel with valid credentials will be granted access. Family members should contact base command for information. Lockdown will be reviewed every 6 hours.', 'HIGH', 'SECURITY', 'All Military Bases', '2025-09-15 14:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-019', 'Demo Alert: Emergency Communication Protocol', 'Emergency communication protocol is now active. Use designated radio frequencies for official communications. Personal mobile devices should be used sparingly to preserve battery life. Report communication failures immediately.', 'LOW', 'GENERAL', 'All Communication Networks', '2025-09-11 23:59:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000'),
('alert-020', 'Demo Alert: Resource Allocation Priority', 'Resource allocation priority has been established. Medical supplies and food have highest priority, followed by fuel and ammunition. All resource requests must be approved by logistics command. Unauthorized resource usage will be penalized.', 'MEDIUM', 'LOGISTICS', 'All Resource Distribution Centers', '2025-09-13 18:00:00.000', '[]', 0, 0, 0, 0, 1, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000');

INSERT INTO `Notification` (`id`, `title`, `message`, `type`, `priority`, `isRead`, `isPublic`, `targetUsers`, `readByUsers`, `readByIPs`, `expiresAt`, `createdAt`, `updatedAt`, `isApproved`, `approvedBy`, `approvedAt`, `createdBy`, `status`) VALUES
('ntf-welcome', 'Welcome to Ghost Legion', 'Welcome to the Ghost Legion emergency management system. This platform provides real-time alerts, evacuation plans, and resource management tools. Explore the different sections to familiarize yourself with the available features.', 'INFO', 'LOW', 0, 1, '[]', '[]', '[]', NULL, '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000', 1, 'admin-ghost-legion', '2026-01-15 12:00:00.000', 'admin-ghost-legion', 'APPROVED'),
('ntf-maintenance', 'System Maintenance Scheduled', 'The Ghost Legion system will undergo scheduled maintenance. During this time, some features may be temporarily unavailable. We apologize for any inconvenience.', 'SYSTEM', 'MEDIUM', 0, 1, '[]', '[]', '[]', '2026-12-31 23:59:59.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000', 1, 'admin-ghost-legion', '2026-01-15 12:00:00.000', 'admin-ghost-legion', 'APPROVED'),
('ntf-weather', 'Emergency Alert: Severe Weather Warning', 'A severe weather warning has been issued for Northern Netherlands. High winds and heavy rainfall are expected. Please stay indoors and avoid unnecessary travel. Emergency services are on standby.', 'EMERGENCY', 'CRITICAL', 0, 1, '[]', '[]', '[]', '2026-12-31 23:59:59.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000', 1, 'admin-ghost-legion', '2026-01-15 12:00:00.000', 'admin-ghost-legion', 'APPROVED'),
('ntf-routes', 'New Evacuation Routes Available', 'New evacuation routes have been added to the system, including Amsterdam to Germany Border and Rotterdam to Belgium Border. These routes are now active and available for use.', 'INFO', 'MEDIUM', 0, 1, '[]', '[]', '[]', '2026-12-31 23:59:59.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000', 1, 'admin-ghost-legion', '2026-01-15 12:00:00.000', 'admin-ghost-legion', 'APPROVED'),
('ntf-security', 'Security Update Required', 'All users are required to update their passwords. This is a mandatory security update to ensure the safety of our systems. Please log in and follow the password update prompts.', 'WARNING', 'HIGH', 0, 1, '[]', '[]', '[]', '2026-12-31 23:59:59.000', '2026-01-15 12:00:00.000', '2026-01-15 12:00:00.000', 1, 'admin-ghost-legion', '2026-01-15 12:00:00.000', 'admin-ghost-legion', 'APPROVED');

SET FOREIGN_KEY_CHECKS = 1;
