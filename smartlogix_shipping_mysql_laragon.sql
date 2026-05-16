-- SmartLogix shipping database bootstrap for Laragon MySQL/MariaDB.
-- Run this script from HeidiSQL before starting envios-service.
--
-- Default connection used by envios:
-- jdbc:mysql://localhost:3306/smartlogix_shipping?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
--
-- This script creates the database. Tables are created by Flyway from:
-- envios/src/main/resources/db/migration/V1__create_shipping_schema.sql

CREATE DATABASE IF NOT EXISTS smartlogix_shipping
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartlogix_shipping;

-- Verification query: it should return one row named smartlogix_shipping.
SELECT SCHEMA_NAME AS database_name
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'smartlogix_shipping';
