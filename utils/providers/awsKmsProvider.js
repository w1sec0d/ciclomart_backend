/**
 * AWS KMS Key Provider
 * 
 * Implements envelope encryption using AWS Key Management Service.
 * 
 * How it works:
 * 1. KMS stores a Customer Master Key (CMK) - never leaves AWS
 * 2. App requests a Data Encryption Key (DEK) from KMS
 * 3. KMS returns plaintext DEK + encrypted DEK
 * 4. App uses plaintext DEK for AES encryption
 * 5. App stores encrypted DEK alongside encrypted data
 * 6. To decrypt: KMS decrypts the DEK, app uses it for AES
 * 
 * Environment variables:
 * - AWS_REGION (default: us-east-1)
 * - AWS_KMS_KEY_ID (ARN or alias of KMS key)
 * - AWS_ACCESS_KEY_ID (if not using IAM role)
 * - AWS_SECRET_ACCESS_KEY (if not using IAM role)
 */

const { KMSClient, GenerateDataKeyCommand, DecryptCommand } = require('@aws-sdk/client-kms');
const crypto = require('crypto');

/**
 * AWS KMS Key Provider with envelope encryption.
 */
class AWSKMSKeyProvider {
    /**
     * Creates an AWS KMS key provider.
     * @param {object} config - Configuration options
     * @param {string} config.region - AWS region
     * @param {string} config.keyId - KMS key ID or ARN
     * @param {number} config.cacheTimeMs - How long to cache data keys (default: 5 min)
     */
    constructor(config = {}) {
        this.config = {
            region: config.region || process.env.AWS_REGION || 'us-east-1',
            keyId: config.keyId || process.env.AWS_KMS_KEY_ID,
            cacheTimeMs: config.cacheTimeMs || 5 * 60 * 1000, // 5 minutes
        };

        if (!this.config.keyId) {
            throw new Error('AWS KMS key ID required. Set AWS_KMS_KEY_ID environment variable.');
        }

        // Initialize KMS client
        this.client = new KMSClient({
            region: this.config.region,
            // Credentials are automatically loaded from environment or IAM role
        });

        // Cache for data keys (plaintext key -> encrypted key)
        this.keyCache = new Map();
        this.currentDataKey = null;
        this.currentKeyTimestamp = 0;
    }

    /**
     * Generates a new data encryption key from KMS.
     * @returns {Promise<{plaintext: Buffer, encrypted: Buffer}>}
     */
    async generateDataKey() {
        const command = new GenerateDataKeyCommand({
            KeyId: this.config.keyId,
            KeySpec: 'AES_256', // 256-bit key for AES-256
        });

        const response = await this.client.send(command);

        return {
            plaintext: Buffer.from(response.Plaintext),
            encrypted: Buffer.from(response.CiphertextBlob)
        };
    }

    /**
     * Decrypts an encrypted data key using KMS.
     * @param {Buffer} encryptedKey - The encrypted data key
     * @returns {Promise<Buffer>} - The plaintext key
     */
    async decryptDataKey(encryptedKey) {
        // Check cache first
        const cacheKey = encryptedKey.toString('base64');
        const cached = this.keyCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeMs) {
            return cached.plaintext;
        }

        const command = new DecryptCommand({
            CiphertextBlob: encryptedKey,
            KeyId: this.config.keyId,
        });

        const response = await this.client.send(command);
        const plaintext = Buffer.from(response.Plaintext);

        // Cache the decrypted key
        this.keyCache.set(cacheKey, {
            plaintext,
            timestamp: Date.now()
        });

        return plaintext;
    }

    /**
     * Gets the current data key for encryption.
     * Generates a new one if expired or not available.
     * @returns {Promise<{key: Buffer, encryptedKey: Buffer}>}
     */
    async getCurrentDataKey() {
        const now = Date.now();

        // Refresh key if expired or not set
        if (!this.currentDataKey || now - this.currentKeyTimestamp > this.config.cacheTimeMs) {
            const { plaintext, encrypted } = await this.generateDataKey();
            this.currentDataKey = {
                key: plaintext,
                encryptedKey: encrypted
            };
            this.currentKeyTimestamp = now;
        }

        return this.currentDataKey;
    }

    /**
     * Encrypts data using envelope encryption.
     * Returns encrypted data with the encrypted DEK embedded.
     * 
     * Format: <encrypted_key_length (4 bytes)><encrypted_key><iv><ciphertext><tag>
     * 
     * @param {string} plaintext - Data to encrypt
     * @returns {Promise<string>} - Base64 encoded encrypted package
     */
    async encrypt(plaintext) {
        if (!plaintext) return null;

        const { key, encryptedKey } = await this.getCurrentDataKey();

        // Encrypt with AES-256-GCM using the data key
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        const ciphertext = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final()
        ]);
        const tag = cipher.getAuthTag();

        // Build the envelope: keyLen + encryptedKey + iv + ciphertext + tag
        const keyLen = Buffer.alloc(4);
        keyLen.writeUInt32BE(encryptedKey.length);

        const envelope = Buffer.concat([
            keyLen,
            encryptedKey,
            iv,
            ciphertext,
            tag
        ]);

        return envelope.toString('base64');
    }

    /**
     * Decrypts envelope-encrypted data.
     * @param {string} encryptedData - Base64 encoded encrypted package
     * @returns {Promise<string>} - Decrypted plaintext
     */
    async decrypt(encryptedData) {
        if (!encryptedData) return null;

        const envelope = Buffer.from(encryptedData, 'base64');

        // Parse envelope
        let offset = 0;

        const keyLen = envelope.readUInt32BE(offset);
        offset += 4;

        const encryptedKey = envelope.subarray(offset, offset + keyLen);
        offset += keyLen;

        const iv = envelope.subarray(offset, offset + 12);
        offset += 12;

        const tag = envelope.subarray(envelope.length - 16);
        const ciphertext = envelope.subarray(offset, envelope.length - 16);

        // Decrypt the data key using KMS
        const key = await this.decryptDataKey(encryptedKey);

        // Decrypt the data using the data key
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        const plaintext = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        return plaintext.toString('utf8');
    }

    /**
     * Encrypts a field for database storage with KMS envelope encryption.
     * @param {string} value - Plaintext value
     * @returns {Promise<string>} - Encrypted value with prefix
     */
    async encryptField(value) {
        if (value === null || value === undefined) return null;
        if (value === '') return '';

        // Check if already encrypted
        if (this.isEncrypted(value)) return value;

        const encrypted = await this.encrypt(String(value));
        return `enc:kms:${encrypted}`;
    }

    /**
     * Decrypts a field from database.
     * @param {string} encryptedValue - Encrypted value from database
     * @returns {Promise<string>} - Decrypted plaintext
     */
    async decryptField(encryptedValue) {
        if (encryptedValue === null || encryptedValue === undefined) return null;
        if (encryptedValue === '') return '';

        // If not encrypted, return as-is
        if (!this.isEncrypted(encryptedValue)) return encryptedValue;

        const encrypted = encryptedValue.slice(8); // Remove 'enc:kms:'
        return this.decrypt(encrypted);
    }

    /**
     * Checks if a value is KMS encrypted.
     * @param {string} value - Value to check
     * @returns {boolean}
     */
    isEncrypted(value) {
        return typeof value === 'string' && value.startsWith('enc:kms:');
    }

    /**
     * Gets the provider type.
     * @returns {string}
     */
    getType() {
        return 'aws-kms';
    }

    /**
     * Gets the current version (KMS manages versions internally).
     * @returns {Promise<string>}
     */
    async getCurrentVersion() {
        return 'kms';
    }

    /**
     * Gets available versions.
     * @returns {Promise<string[]>}
     */
    async getAvailableVersions() {
        return ['kms'];
    }

    /**
     * Clears the key cache.
     */
    clearCache() {
        this.keyCache.clear();
        this.currentDataKey = null;
        this.currentKeyTimestamp = 0;
    }
}

module.exports = { AWSKMSKeyProvider };




