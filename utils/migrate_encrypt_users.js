/**
 * Migration script to encrypt existing user data
 * 
 * Run with: AES_KEY=<your-key> node scripts/migrate_encrypt_users.js
 * 
 * Options:
 *   --dry-run    Preview changes without modifying database
 *   --batch=100  Number of users to process per batch (default: 100)
 */

require('dotenv').config()

const { executeQuery } = require('../utils/dbHelpers')
const { encryptField, isEncrypted } = require('../utils/encryption')

// Fields to encrypt
const FIELDS_TO_ENCRYPT = [
    'telefono',
    'direccionNombre',
    'direccionNumero',
    'direccionPiso',
    'direccionApartamento',
    'mp_access_token',
    'mp_refresh_token'
]

// Parse command line args
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '100')

async function migrateUsers() {
    console.log('='.repeat(60))
    console.log('  User Data Encryption Migration')
    console.log('='.repeat(60))
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log()

    // Get total count
    const [{ total }] = await executeQuery('SELECT COUNT(*) as total FROM usuario')
    console.log(`Total users: ${total}`)
    console.log()

    let processed = 0
    let encrypted = 0
    let skipped = 0
    let errors = 0

    // Process in batches
    while (processed < total) {
        const users = await executeQuery(
            `SELECT idUsuario, ${FIELDS_TO_ENCRYPT.join(', ')} FROM usuario LIMIT ? OFFSET ?`,
            [BATCH_SIZE, processed]
        )

        for (const user of users) {
            try {
                const updates = {}

                for (const field of FIELDS_TO_ENCRYPT) {
                    const value = user[field]

                    // Skip null/undefined/empty
                    if (!value) continue

                    // Skip already encrypted
                    if (isEncrypted(value)) continue

                    // Encrypt the field
                    updates[field] = encryptField(value)
                }

                if (Object.keys(updates).length > 0) {
                    if (!DRY_RUN) {
                        const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ')
                        await executeQuery(
                            `UPDATE usuario SET ${setClause} WHERE idUsuario = ?`,
                            [...Object.values(updates), user.idUsuario]
                        )
                    }
                    encrypted++
                    console.log(`  ✓ User ${user.idUsuario}: encrypted ${Object.keys(updates).length} fields`)
                } else {
                    skipped++
                }
            } catch (error) {
                errors++
                console.error(`  ✗ User ${user.idUsuario}: ${error.message}`)
            }
        }

        processed += users.length
        console.log(`Progress: ${processed}/${total} (${Math.round(processed / total * 100)}%)`)
    }

    console.log()
    console.log('='.repeat(60))
    console.log('  Summary')
    console.log('='.repeat(60))
    console.log(`  Total processed: ${processed}`)
    console.log(`  Encrypted: ${encrypted}`)
    console.log(`  Skipped (already encrypted or empty): ${skipped}`)
    console.log(`  Errors: ${errors}`)
    console.log()

    if (DRY_RUN) {
        console.log('  ⚠️  This was a DRY RUN. No changes were made.')
        console.log('  Run without --dry-run to apply changes.')
    }
}

// Main
migrateUsers()
    .then(() => {
        console.log('Migration complete.')
        process.exit(0)
    })
    .catch(error => {
        console.error('Migration failed:', error)
        process.exit(1)
    })