#!/usr/bin/env node
/**
 * Key Rotation Script
 * 
 * Re-encrypts all encrypted data from old key version to new key version.
 * 
 * Usage:
 *   node scripts/rotate_key.js --from=v1 --to=v2 [--dry-run] [--batch=100]
 * 
 * Prerequisites:
 *   - Both keys must be configured in .env:
 *     AES_KEY_V1=old_key_32_chars
 *     AES_KEY_V2=new_key_32_chars
 * 
 * Options:
 *   --from=v1      Source key version
 *   --to=v2        Target key version
 *   --dry-run      Preview changes without modifying database
 *   --batch=100    Number of records to process per batch
 */

require('dotenv').config();

const { executeQuery } = require('../utils/dbHelpers');
const {
  reEncryptField,
  extractVersion,
  getAvailableVersions,
  getCurrentVersion
} = require('../utils/encryption');
const { SENSITIVE_FIELDS } = require('../utils/sensitiveFields');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const FROM_VERSION = getArg('from');
const TO_VERSION = getArg('to') || getCurrentVersion();
const DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = parseInt(getArg('batch') || '100');

async function rotateKeys() {
  console.log('='.repeat(70));
  console.log('  Key Rotation Script');
  console.log('='.repeat(70));
  console.log();

  // Validate configuration
  const availableVersions = getAvailableVersions();
  console.log('Available key versions:', availableVersions.join(', '));
  console.log('Current version:', getCurrentVersion());
  console.log();

  if (!FROM_VERSION) {
    console.log('Usage: node scripts/rotate_key.js --from=v1 --to=v2 [--dry-run]');
    console.log();
    console.log('Options:');
    console.log('  --from=v1    Source key version (required)');
    console.log('  --to=v2      Target key version (default: current)');
    console.log('  --dry-run    Preview changes without modifying');
    console.log('  --batch=100  Records per batch');
    process.exit(1);
  }

  if (!availableVersions.includes(FROM_VERSION)) {
    console.error(`Error: Source version '${FROM_VERSION}' not available.`);
    console.error(`Set AES_KEY_${FROM_VERSION.toUpperCase()} in .env`);
    process.exit(1);
  }

  if (!availableVersions.includes(TO_VERSION)) {
    console.error(`Error: Target version '${TO_VERSION}' not available.`);
    console.error(`Set AES_KEY_${TO_VERSION.toUpperCase()} in .env`);
    process.exit(1);
  }

  console.log(`Rotating: ${FROM_VERSION} → ${TO_VERSION}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log();

  const stats = {
    tables: 0,
    records: 0,
    fields: 0,
    rotated: 0,
    skipped: 0,
    errors: 0
  };

  // Process each table with sensitive fields
  for (const [table, fields] of Object.entries(SENSITIVE_FIELDS)) {
    console.log(`\n📋 Processing table: ${table}`);
    console.log(`   Fields: ${fields.join(', ')}`);
    stats.tables++;

    try {
      // Get primary key column (assume id or idTable format)
      const pkColumn = `id${table.charAt(0).toUpperCase() + table.slice(1)}`;

      // Get total count
      const [{ total }] = await executeQuery(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`   Total records: ${total}`);

      let processed = 0;
      let tableRotated = 0;

      while (processed < total) {
        // Fetch batch
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

            // Check if it's encrypted with source version
            const version = extractVersion(value);
            if (version !== FROM_VERSION) {
              stats.skipped++;
              continue;
            }

            // Re-encrypt with target version
            try {
              const newValue = reEncryptField(value, TO_VERSION);
              if (newValue !== value) {
                updates[field] = newValue;
                stats.rotated++;
              }
            } catch (error) {
              console.error(`   ✗ Error rotating ${table}.${field} (id=${record[pkColumn]}): ${error.message}`);
              stats.errors++;
            }
          }

          // Apply updates
          if (Object.keys(updates).length > 0) {
            tableRotated++;
            if (!DRY_RUN) {
              const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
              await executeQuery(
                `UPDATE ${table} SET ${setClause} WHERE ${pkColumn} = ?`,
                [...Object.values(updates), record[pkColumn]]
              );
            }
            console.log(`   ✓ Record ${record[pkColumn]}: ${Object.keys(updates).length} fields rotated`);
          }
        }

        processed += records.length;
        if (processed % 500 === 0 || processed >= total) {
          console.log(`   Progress: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
        }
      }

      console.log(`   Table complete: ${tableRotated} records updated`);

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
  console.log(`  Fields rotated: ${stats.rotated}`);
  console.log(`  Fields skipped: ${stats.skipped}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log();

  if (DRY_RUN) {
    console.log('⚠️  This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.');
  } else if (stats.rotated > 0) {
    console.log('✅ Key rotation complete.');
    console.log(`   Update AES_CURRENT_VERSION=${TO_VERSION} in .env`);
    console.log('   You can now remove the old key after verification.');
  }
}

// Generate new key helper
function generateNewKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64').slice(0, 32);
}

// Main
if (args.includes('--generate-key')) {
  console.log('Generated new 32-character key:');
  console.log(generateNewKey());
  process.exit(0);
}

rotateKeys()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Key rotation failed:', error);
    process.exit(1);
  });




