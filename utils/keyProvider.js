/**
 * Key Provider Interface
 * 
 * Abstraction layer for key management. Supports multiple backends:
 * - LocalKeyProvider: Keys from environment variables
 * - AWSKMSKeyProvider: Keys from AWS KMS (envelope encryption)
 * 
 * Usage:
 *   const provider = createKeyProvider();
 *   const key = await provider.getKey('v1');
 */

/**
 * Abstract base class for key providers.
 * All providers must implement these methods.
 */
class KeyProvider {
  /**
   * Gets a key for a specific version.
   * @param {string} version - Key version (e.g., "v1")
   * @returns {Promise<string>} - The 32-character key
   */
  async getKey(version) {
    throw new Error('getKey must be implemented by subclass');
  }

  /**
   * Gets the current version for new encryptions.
   * @returns {Promise<string>} - Current version
   */
  async getCurrentVersion() {
    throw new Error('getCurrentVersion must be implemented by subclass');
  }

  /**
   * Gets all available key versions.
   * @returns {Promise<string[]>} - Array of versions
   */
  async getAvailableVersions() {
    throw new Error('getAvailableVersions must be implemented by subclass');
  }

  /**
   * Checks if a specific version is available.
   * @param {string} version - Version to check
   * @returns {Promise<boolean>} - True if available
   */
  async hasVersion(version) {
    const versions = await this.getAvailableVersions();
    return versions.includes(version);
  }

  /**
   * Provider type identifier.
   * @returns {string} - Provider type (e.g., "local", "aws-kms")
   */
  getType() {
    throw new Error('getType must be implemented by subclass');
  }
}

/**
 * Local key provider - reads keys from environment variables.
 * 
 * Environment variables:
 * - AES_KEY or AES_KEY_V1, AES_KEY_V2, etc.
 * - AES_CURRENT_VERSION (optional, defaults to highest)
 */
class LocalKeyProvider extends KeyProvider {
  constructor() {
    super();
    this.keys = {};
    this.currentVersion = null;
    this._loadKeys();
  }

  _loadKeys() {
    const KEY_PATTERN = /^AES_KEY(?:_V(\d+))?$/;

    for (const [envName, value] of Object.entries(process.env)) {
      const match = envName.match(KEY_PATTERN);
      if (match && value && value.length === 32) {
        const version = match[1] ? `v${match[1]}` : "v1";
        this.keys[version] = value;
      }
    }

    // Determine current version
    this.currentVersion = process.env.AES_CURRENT_VERSION ||
      Object.keys(this.keys).sort().pop() || "v1";
  }

  async getKey(version) {
    const key = this.keys[version];
    if (!key) {
      throw new Error(`LocalKeyProvider: No key found for version ${version}`);
    }
    return key;
  }

  async getCurrentVersion() {
    return this.currentVersion;
  }

  async getAvailableVersions() {
    return Object.keys(this.keys).sort();
  }

  getType() {
    return 'local';
  }
}

/**
 * AWS KMS key provider placeholder.
 * Actual implementation in providers/awsKmsProvider.js
 */
class AWSKMSKeyProvider extends KeyProvider {
  constructor(config = {}) {
    super();
    this.config = {
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      keyId: config.keyId || process.env.AWS_KMS_KEY_ID,
      ...config
    };
    this.dataKeys = new Map(); // Cache for data keys
  }

  async getKey(version) {
    // This will be implemented in awsKmsProvider.js
    throw new Error('AWSKMSKeyProvider: Use the full implementation from providers/awsKmsProvider.js');
  }

  async getCurrentVersion() {
    return process.env.AES_CURRENT_VERSION || 'v1';
  }

  async getAvailableVersions() {
    // KMS manages versions differently
    return ['v1'];
  }

  getType() {
    return 'aws-kms';
  }
}

/**
 * Creates a key provider based on environment configuration.
 * 
 * Environment variable KEY_PROVIDER:
 * - "local" (default): LocalKeyProvider
 * - "aws-kms": AWSKMSKeyProvider
 * 
 * @param {object} options - Provider-specific options
 * @returns {KeyProvider} - The configured provider
 */
function createKeyProvider(options = {}) {
  const providerType = process.env.KEY_PROVIDER || 'local';

  switch (providerType) {
    case 'local':
      return new LocalKeyProvider();

    case 'aws-kms':
      // Use dynamic import for AWS provider to avoid loading AWS SDK when not needed
      try {
        const { AWSKMSKeyProvider: FullKMSProvider } = require('./providers/awsKmsProvider');
        return new FullKMSProvider(options);
      } catch (error) {
        console.error('Failed to load AWS KMS provider:', error.message);
        console.error('Falling back to local provider');
        return new LocalKeyProvider();
      }

    default:
      console.warn(`Unknown KEY_PROVIDER: ${providerType}, using local`);
      return new LocalKeyProvider();
  }
}

/**
 * Singleton instance for the default provider.
 * Initialized lazily on first use.
 */
let defaultProvider = null;

/**
 * Gets the default key provider instance.
 * @returns {KeyProvider} - The default provider
 */
function getDefaultProvider() {
  if (!defaultProvider) {
    defaultProvider = createKeyProvider();
  }
  return defaultProvider;
}

/**
 * Resets the default provider (useful for testing).
 */
function resetDefaultProvider() {
  defaultProvider = null;
}

module.exports = {
  // Classes
  KeyProvider,
  LocalKeyProvider,
  AWSKMSKeyProvider,

  // Factory functions
  createKeyProvider,
  getDefaultProvider,
  resetDefaultProvider
};




