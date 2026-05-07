-- SmartLogix auth-service database bootstrap for Laragon MySQL/MariaDB.
-- Run this script from HeidiSQL before starting auth-service.
--
-- This script only creates the database used by auth-service.
-- Tables are created by Flyway from:
-- auth-service/src/main/resources/db/migration/V1__create_auth_schema.sql
--
-- Default connection used by auth-service:
-- jdbc:mysql://localhost:3306/smartlogix_auth?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC

CREATE DATABASE IF NOT EXISTS smartlogix_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartlogix_auth;

-- Verification query: it should return one row named smartlogix_auth.
SELECT SCHEMA_NAME AS database_name
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'smartlogix_auth';
