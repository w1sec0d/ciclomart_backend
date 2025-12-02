-- Migration: Expand columns for encrypted data storage
-- 
-- This migration expands VARCHAR columns to TEXT to accommodate encrypted data.
-- Encrypted data includes: prefix + base64(JSON({iv, ciphertext, tag}))
-- This typically results in ~3-4x the original data size.
--
-- Run this migration BEFORE enabling encryption on existing data.
-- 
-- Date: 2024
-- Version: 001

USE ciclomart;

-- ============================================
-- Table: usuario
-- ============================================

-- Expand telefono (was VARCHAR(60))
ALTER TABLE `usuario` MODIFY `telefono` TEXT;

-- Expand address fields (were VARCHAR(255) and VARCHAR(30))
ALTER TABLE `usuario` MODIFY `direccionNombre` TEXT;
ALTER TABLE `usuario` MODIFY `direccionNumero` TEXT;
ALTER TABLE `usuario` MODIFY `direccionPiso` TEXT;
ALTER TABLE `usuario` MODIFY `direccionApartamento` TEXT;

-- Expand MercadoPago tokens (were VARCHAR(100))
ALTER TABLE `usuario` MODIFY `mp_access_token` TEXT;
ALTER TABLE `usuario` MODIFY `mp_refresh_token` TEXT;

-- ============================================
-- Verification query (optional - run to verify)
-- ============================================
-- SELECT 
--     COLUMN_NAME, 
--     DATA_TYPE, 
--     CHARACTER_MAXIMUM_LENGTH 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'ciclomart' 
--     AND TABLE_NAME = 'usuario' 
--     AND COLUMN_NAME IN (
--         'telefono', 
--         'direccionNombre', 
--         'direccionNumero', 
--         'direccionPiso', 
--         'direccionApartamento', 
--         'mp_access_token', 
--         'mp_refresh_token'
--     );

