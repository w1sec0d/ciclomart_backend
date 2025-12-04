#!/usr/bin/env node
/**
 * KMS Re-encryption Script
 * 
 * Forces re-encryption of all KMS-encrypted data with the current (latest) key material.
 * Useful after AWS KMS automatic key rotation to ensure all data uses the newest key.
 * 
 * Usage:
 *   node scripts/reencrypt_kms.js [--dry-run] [--batch=100] [--table=usuario]
 * 
 * Prerequisites:
 *   - AWS credentials configured (env vars or IAM role)
 *   - AWS_KMS_KEY_ID set in .env
 * 
 * Options:
 *   --dry-run     Preview changes without modifying database
 *   --batch=100   Number of records to process per batch (default: 100)
 *   --table=X     Process only specific table
 *   --force       Re-encrypt even non-KMS encrypted data
 * 
 * How it works:
 *   1. Reads KMS-encrypted data from database
 *   2. Decrypts using KMS (any key material version)
 *   3. Re-encrypts using KMS (current/latest key material)
 *   4. Updates database with fresh encryption
 * 
 * This ensures all data is encrypted with the most recent key material
 * after AWS performs automatic annual key rotation.
 */

require('dotenv').config();

const { executeQuery } = require('../utils/dbHelpers');
const { AWSKMSKeyProvider } = require('../utils/providers/awsKmsProvider');
const { SENSITIVE_FIELDS } = require('../utils/sensitiveFields');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : null;
};

const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const BATCH_SIZE = parseInt(getArg('batch') || '100');
const TARGET_TABLE = getArg('table');

// Stats tracking
const stats = {
    tables: 0,
    records: 0,
    fields: 0,
    reencrypted: 0,
    skipped: 0,
    errors: 0,
    startTime: Date.now()
};

/**
 * Gets the primary key column name for a table
 */
function getPrimaryKeyColumn(table) {
    // Convention: idTableName (e.g., idUsuario for usuario)
    return `id${table.charAt(0).toUpperCase() + table.slice(1)}`;
}

/**
 * Main re-encryption function
 */
async function reencryptKMS() {
    console.log('='.repeat(70));
    console.log('  KMS Re-encryption: Update to Latest Key Material');
    console.log('='.repeat(70));
    console.log();

    // Validate AWS configuration
    if (!process.env.AWS_KMS_KEY_ID) {
        console.error('❌ Error: AWS_KMS_KEY_ID not set in environment.');
        console.error('');
        console.error('Required configuration:');
        console.error('  AWS_KMS_KEY_ID=arn:aws:kms:region:account:key/key-id');
        console.error('  AWS_REGION=us-east-1 (optional)');
        console.error('  AWS_ACCESS_KEY_ID=... (if not using IAM role)');
        console.error('  AWS_SECRET_ACCESS_KEY=... (if not using IAM role)');
        process.exit(1);
    }

    console.log('Configuration:');
    console.log(`  AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`  KMS Key ID: ${process.env.AWS_KMS_KEY_ID.slice(0, 50)}...`);
    console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '🔴 LIVE'}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    console.log(`  Force non-KMS: ${FORCE ? 'Yes' : 'No'}`);
    if (TARGET_TABLE) {
        console.log(`  Target table: ${TARGET_TABLE}`);
    }
    console.log();

    // Initialize KMS provider
    let kmsProvider;
    try {
        kmsProvider = new AWSKMSKeyProvider();

        // Test KMS connection
        console.log('Testing KMS connection...');
        const testData = `test-${Date.now()}`;
        const testEncrypted = await kmsProvider.encrypt(testData);
        const testDecrypted = await kmsProvider.decrypt(testEncrypted);
        if (testDecrypted !== testData) {
            throw new Error('KMS encrypt/decrypt verification failed');
        }
        console.log('✅ KMS connection successful');
        console.log();
    } catch (error) {
        console.error('❌ Failed to initialize KMS:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('  1. Check AWS credentials');
        console.error('  2. Verify KMS key ID is valid');
        console.error('  3. Ensure IAM has kms:GenerateDataKey and kms:Decrypt permissions');
        process.exit(1);
    }

    // Determine tables to process
    const tablesToProcess = TARGET_TABLE
        ? { [TARGET_TABLE]: SENSITIVE_FIELDS[TARGET_TABLE] || [] }
        : SENSITIVE_FIELDS;

    // Process each table
    for (const [table, fields] of Object.entries(tablesToProcess)) {
        if (fields.length === 0) {
            console.log(`⏭️  Skipping ${table}: no sensitive fields defined`);
            continue;
        }

        await processTable(table, fields, kmsProvider);
    }

    // Print summary
    printSummary();
}

/**
 * Process a single table
 */
async function processTable(table, fields, kmsProvider) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📋 Table: ${table}`);
    console.log(`   Fields: ${fields.join(', ')}`);
    stats.tables++;

    const pkColumn = getPrimaryKeyColumn(table);

    try {
        // Get total count
        const [{ total }] = await executeQuery(`SELECT COUNT(*) as total FROM ${table}`);
        console.log(`   Records: ${total}`);

        if (total === 0) {
            console.log('   ⏭️  No records to process');
            return;
        }

        let processed = 0;
        let tableReencrypted = 0;
        let tableSkipped = 0;
        let tableErrors = 0;

        // Process in batches
        while (processed < total) {
            const records = await executeQuery(
                `SELECT ${pkColumn}, ${fields.join(', ')} FROM ${table} LIMIT ? OFFSET ?`,
                [BATCH_SIZE, processed]
            );

            for (const record of records) {
                stats.records++;
                const recordId = record[pkColumn];
                const updates = {};
                let recordHasChanges = false;

                for (const field of fields) {
                    stats.fields++;
                    const value = record[field];

                    // Skip null/empty
                    if (!value || value === '') {
                        stats.skipped++;
                        tableSkipped++;
                        continue;
                    }

                    // Check if KMS encrypted
                    const isKmsEncrypted = kmsProvider.isEncrypted(value);
                    
                    if (!isKmsEncrypted && !FORCE) {
                        // Not KMS encrypted and not forcing - skip
                        stats.skipped++;
                        tableSkipped++;
                        continue;
                    }

                    try {
                        let plaintext;

                        if (isKmsEncrypted) {
                            // Decrypt with KMS (uses appropriate key material version)
                            plaintext = await kmsProvider.decryptField(value);
                        } else if (FORCE) {
                            // --force flag: treat as plaintext or try local decryption
                            const { decryptFieldAsync } = require('../utils/encryption');
                            try {
                                plaintext = await decryptFieldAsync(value);
                            } catch {
                                plaintext = value; // Assume plaintext
                            }
                        }

                        // Re-encrypt with current key material
                        if (!DRY_RUN) {
                            const newEncrypted = await kmsProvider.encryptField(plaintext);
                            
                            // Only update if actually changed (different ciphertext)
                            if (newEncrypted !== value) {
                                updates[field] = newEncrypted;
                                recordHasChanges = true;
                            }
                        } else {
                            recordHasChanges = true;
                        }

                        stats.reencrypted++;
                        tableReencrypted++;

                    } catch (error) {
                        console.error(`   ❌ ${table}.${field} (id=${recordId}): ${error.message}`);
                        stats.errors++;
                        tableErrors++;
                    }
                }

                // Apply updates for this record
                if (recordHasChanges && Object.keys(updates).length > 0 && !DRY_RUN) {
                    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
                    await executeQuery(
                        `UPDATE ${table} SET ${setClause} WHERE ${pkColumn} = ?`,
                        [...Object.values(updates), recordId]
                    );
                }
            }

            processed += records.length;

            // Progress update every 500 records or at the end
            if (processed % 500 === 0 || processed >= total) {
                const pct = Math.round(processed / total * 100);
                console.log(`   Progress: ${processed}/${total} (${pct}%) - Re-encrypted: ${tableReencrypted}`);
            }
        }

        console.log(`   ✅ Complete: ${tableReencrypted} re-encrypted, ${tableSkipped} skipped, ${tableErrors} errors`);

    } catch (error) {
        console.error(`   ❌ Error processing table ${table}: ${error.message}`);
        stats.errors++;
    }
}

/**
 * Print final summary
 */
function printSummary() {
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('  Summary');
    console.log('='.repeat(70));
    console.log(`  Tables processed:    ${stats.tables}`);
    console.log(`  Records scanned:     ${stats.records}`);
    console.log(`  Fields checked:      ${stats.fields}`);
    console.log(`  Fields re-encrypted: ${stats.reencrypted}`);
    console.log(`  Fields skipped:      ${stats.skipped}`);
    console.log(`  Errors:              ${stats.errors}`);
    console.log(`  Duration:            ${duration}s`);
    console.log();

    if (DRY_RUN) {
        console.log('⚠️  This was a DRY RUN. No changes were made to the database.');
        console.log('   Run without --dry-run to apply changes:');
        console.log('   node scripts/reencrypt_kms.js');
    } else if (stats.reencrypted > 0) {
        console.log('✅ Re-encryption complete!');
        console.log('   All sensitive data is now encrypted with the latest KMS key material.');
    } else if (stats.errors > 0) {
        console.log('⚠️  Completed with errors. Review the log above.');
    } else {
        console.log('ℹ️  No data required re-encryption.');
    }
}

// Run
reencryptKMS()
    .then(() => {
        process.exit(stats.errors > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

