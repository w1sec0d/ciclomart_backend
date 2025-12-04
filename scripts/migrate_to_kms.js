#!/usr/bin/env node
/**
 * Migration Script: Local Encryption to AWS KMS
 * 
 * Migrates encrypted data from local AES keys to AWS KMS envelope encryption.
 * 
 * Usage:
 *   node scripts/migrate_to_kms.js [--dry-run] [--batch=100]
 * 
 * Prerequisites:
 *   - AWS credentials configured (env vars or IAM role)
 *   - AWS_KMS_KEY_ID set in .env
 *   - Local AES keys still available for decryption
 * 
 * Options:
 *   --dry-run    Preview changes without modifying database
 *   --batch=100  Number of records to process per batch
 *   --table=X    Process only specific table
 */

require('dotenv').config();

const { executeQuery } = require('../utils/dbHelpers');
const { decryptField, isEncrypted, extractVersion } = require('../utils/encryption');
const { AWSKMSKeyProvider } = require('../utils/providers/awsKmsProvider');
const { SENSITIVE_FIELDS } = require('../utils/sensitiveFields');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : null;
};

const DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = parseInt(getArg('batch') || '100');
const TARGET_TABLE = getArg('table');

async function migrateToKMS() {
    console.log('='.repeat(70));
    console.log('  Migration: Local Encryption → AWS KMS');
    console.log('='.repeat(70));
    console.log();

    // Validate AWS configuration
    if (!process.env.AWS_KMS_KEY_ID) {
        console.error('Error: AWS_KMS_KEY_ID not set in environment.');
        console.error('');
        console.error('Required configuration:');
        console.error('  AWS_KMS_KEY_ID=arn:aws:kms:region:account:key/key-id');
        console.error('  AWS_REGION=us-east-1 (optional, defaults to us-east-1)');
        console.error('  AWS_ACCESS_KEY_ID=... (if not using IAM role)');
        console.error('  AWS_SECRET_ACCESS_KEY=... (if not using IAM role)');
        process.exit(1);
    }

    console.log('AWS Configuration:');
    console.log(`  Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`  KMS Key ID: ${process.env.AWS_KMS_KEY_ID.slice(0, 50)}...`);
    console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    console.log();

    // Initialize KMS provider
    let kmsProvider;
    try {
        kmsProvider = new AWSKMSKeyProvider();

        // Test KMS connection
        if (!DRY_RUN) {
            console.log('Testing KMS connection...');
            const testEncrypted = await kmsProvider.encrypt('test');
            const testDecrypted = await kmsProvider.decrypt(testEncrypted);
            if (testDecrypted !== 'test') {
                throw new Error('KMS encrypt/decrypt test failed');
            }
            console.log('✓ KMS connection successful\n');
        }
    } catch (error) {
        console.error('Failed to initialize KMS provider:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('  1. Verify AWS credentials are set correctly');
        console.error('  2. Check KMS key ID is valid');
        console.error('  3. Ensure IAM permissions include kms:GenerateDataKey and kms:Decrypt');
        process.exit(1);
    }

    const stats = {
        tables: 0,
        records: 0,
        fields: 0,
        migrated: 0,
        skipped: 0,
        errors: 0
    };

    // Determine tables to process
    const tablesToProcess = TARGET_TABLE
        ? { [TARGET_TABLE]: SENSITIVE_FIELDS[TARGET_TABLE] || [] }
        : SENSITIVE_FIELDS;

    // Process each table
    for (const [table, fields] of Object.entries(tablesToProcess)) {
        if (fields.length === 0) {
            console.log(`\n⏭️  Skipping table: ${table} (no sensitive fields)`);
            continue;
        }

        console.log(`\n📋 Processing table: ${table}`);
        console.log(`   Fields: ${fields.join(', ')}`);
        stats.tables++;

        try {
            const pkColumn = `id${table.charAt(0).toUpperCase() + table.slice(1)}`;

            const [{ total }] = await executeQuery(`SELECT COUNT(*) as total FROM ${table}`);
            console.log(`   Total records: ${total}`);

            let processed = 0;
            let tableMigrated = 0;

            while (processed < total) {
                const records = await executeQuery(
                    `SELECT ${pkColumn}, ${fields.join(', ')} FROM ${table} LIMIT ? OFFSET ?`,
                    [BATCH_SIZE, processed]
                );

                for (const record of records) {
                    stats.records++;
                    const updates = {};

                    for (const field of fields) {
                        stats.fields++;
                        const value = record[field];

                        // Skip null/empty
                        if (!value) {
                            stats.skipped++;
                            continue;
                        }

                        // Skip already KMS encrypted
                        if (kmsProvider.isEncrypted(value)) {
                            stats.skipped++;
                            continue;
                        }

                        try {
                            let plaintext;

                            // If locally encrypted, decrypt first
                            if (isEncrypted(value)) {
                                plaintext = decryptField(value);
                            } else {
                                // Not encrypted at all, use as-is
                                plaintext = value;
                            }

                            // Encrypt with KMS
                            if (!DRY_RUN) {
                                const kmsEncrypted = await kmsProvider.encryptField(plaintext);
                                updates[field] = kmsEncrypted;
                            }
                            stats.migrated++;

                        } catch (error) {
                            console.error(`   ✗ Error migrating ${table}.${field} (id=${record[pkColumn]}): ${error.message}`);
                            stats.errors++;
                        }
                    }

                    // Apply updates
                    if (Object.keys(updates).length > 0 && !DRY_RUN) {
                        tableMigrated++;
                        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
                        await executeQuery(
                            `UPDATE ${table} SET ${setClause} WHERE ${pkColumn} = ?`,
                            [...Object.values(updates), record[pkColumn]]
                        );
                        console.log(`   ✓ Record ${record[pkColumn]}: ${Object.keys(updates).length} fields migrated`);
                    } else if (Object.keys(updates).length > 0) {
                        tableMigrated++;
                        console.log(`   [DRY] Record ${record[pkColumn]}: ${Object.keys(updates).length} fields would be migrated`);
                    }
                }

                processed += records.length;
                if (processed % 500 === 0 || processed >= total) {
                    console.log(`   Progress: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
                }
            }

            console.log(`   Table complete: ${tableMigrated} records ${DRY_RUN ? 'would be ' : ''}updated`);

        } catch (error) {
            console.error(`   ✗ Error processing table ${table}: ${error.message}`);
            stats.errors++;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('  Summary');
    console.log('='.repeat(70));
    console.log(`  Tables processed: ${stats.tables}`);
    console.log(`  Records scanned: ${stats.records}`);
    console.log(`  Fields checked: ${stats.fields}`);
    console.log(`  Fields migrated: ${stats.migrated}`);
    console.log(`  Fields skipped: ${stats.skipped}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log();

    if (DRY_RUN) {
        console.log('⚠️  This was a DRY RUN. No changes were made.');
        console.log('   Run without --dry-run to apply changes.');
    } else if (stats.migrated > 0) {
        console.log('✅ Migration to KMS complete.');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Update .env: KEY_PROVIDER=aws-kms');
        console.log('  2. Verify application works with KMS');
        console.log('  3. After verification, local AES keys can be removed');
    }
}

// Main
migrateToKMS()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });




