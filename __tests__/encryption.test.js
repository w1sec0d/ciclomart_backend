/**
 * Unit tests for encryption module
 * 
 * Run with: npm test
 * 
 * Note: These tests require AES_KEY environment variable to be set.
 * Example: AES_KEY=12345678901234567890123456789012 npm test
 */

// Set up test environment variable before requiring the module
process.env.AES_KEY = "12345678901234567890123456789012"; // 32 chars for AES-256

const {
    encrypt,
    decrypt,
    encryptField,
    decryptField,
    isEncrypted,
    getEncryptionPrefix
} = require("../utils/encryption");

const {
    SENSITIVE_FIELDS,
    getSensitiveFields,
    isSensitiveField,
    encryptSensitiveFields,
    decryptSensitiveFields,
    decryptSensitiveFieldsArray
} = require("../utils/sensitiveFields");

describe("encryption.js", () => {
    describe("encrypt/decrypt (low-level)", () => {
        test("should encrypt and decrypt a simple string", () => {
            const plaintext = "Hello, World!";
            const encrypted = encrypt(plaintext);

            expect(encrypted).toHaveProperty("iv");
            expect(encrypted).toHaveProperty("ciphertext");
            expect(encrypted).toHaveProperty("tag");

            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        test("should handle null input", () => {
            expect(encrypt(null)).toBeNull();
            expect(decrypt(null)).toBeNull();
        });

        test("should handle empty string", () => {
            expect(encrypt("")).toBeNull();
        });

        test("should produce different ciphertexts for same input (random IV)", () => {
            const plaintext = "test";
            const encrypted1 = encrypt(plaintext);
            const encrypted2 = encrypt(plaintext);

            expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
            expect(encrypted1.iv).not.toBe(encrypted2.iv);
        });

        test("should handle unicode characters", () => {
            const plaintext = "Héllo Wörld 你好 🌍";
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test("should handle long strings", () => {
            const plaintext = "A".repeat(10000);
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test("should fail decryption with tampered ciphertext", () => {
            const plaintext = "test";
            const encrypted = encrypt(plaintext);

            // Tamper with ciphertext
            encrypted.ciphertext = "tampered" + encrypted.ciphertext;

            expect(() => decrypt(encrypted)).toThrow();
        });

        test("should fail decryption with tampered tag", () => {
            const plaintext = "test";
            const encrypted = encrypt(plaintext);

            // Tamper with tag
            encrypted.tag = "AAAAAAAAAAAAAAAAAAAAAA==";

            expect(() => decrypt(encrypted)).toThrow();
        });
    });

    describe("encryptField/decryptField (high-level)", () => {
        test("should encrypt and decrypt a field value", () => {
            const plaintext = "3001234567";
            const encrypted = encryptField(plaintext);

            expect(encrypted).toContain(getEncryptionPrefix());

            const decrypted = decryptField(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        test("should handle null/undefined", () => {
            expect(encryptField(null)).toBeNull();
            expect(encryptField(undefined)).toBeNull();
            expect(decryptField(null)).toBeNull();
            expect(decryptField(undefined)).toBeNull();
        });

        test("should handle empty string", () => {
            expect(encryptField("")).toBe("");
            expect(decryptField("")).toBe("");
        });

        test("should be idempotent (not re-encrypt already encrypted values)", () => {
            const plaintext = "test";
            const encrypted1 = encryptField(plaintext);
            const encrypted2 = encryptField(encrypted1);

            // Should return the same encrypted value
            expect(encrypted2).toBe(encrypted1);

            // Should still decrypt correctly
            expect(decryptField(encrypted2)).toBe(plaintext);
        });

        test("should return unencrypted values as-is for backwards compatibility", () => {
            const unencrypted = "plain text value";
            const result = decryptField(unencrypted);

            expect(result).toBe(unencrypted);
        });

        test("should convert non-string values to string", () => {
            const encrypted = encryptField(12345);
            const decrypted = decryptField(encrypted);

            expect(decrypted).toBe("12345");
        });

        test("should throw error for corrupted encrypted data", () => {
            const corrupted = getEncryptionPrefix() + "invalid-base64-data!!!";

            expect(() => decryptField(corrupted)).toThrow("Decryption failed");
        });
    });

    describe("isEncrypted", () => {
        test("should return true for encrypted values", () => {
            const encrypted = encryptField("test");
            expect(isEncrypted(encrypted)).toBe(true);
        });

        test("should return false for plain values", () => {
            expect(isEncrypted("plain text")).toBe(false);
            expect(isEncrypted("123456")).toBe(false);
        });

        test("should return false for null/undefined", () => {
            expect(isEncrypted(null)).toBe(false);
            expect(isEncrypted(undefined)).toBe(false);
        });

        test("should return false for non-strings", () => {
            expect(isEncrypted(123)).toBe(false);
            expect(isEncrypted({})).toBe(false);
            expect(isEncrypted([])).toBe(false);
        });
    });
});

describe("sensitiveFields.js", () => {
    describe("SENSITIVE_FIELDS configuration", () => {
        test("should have usuario table configured", () => {
            expect(SENSITIVE_FIELDS).toHaveProperty("usuario");
            expect(Array.isArray(SENSITIVE_FIELDS.usuario)).toBe(true);
        });

        test("should include required sensitive fields for usuario", () => {
            const expectedFields = [
                "telefono",
                "direccionNombre",
                "direccionNumero",
                "direccionPiso",
                "direccionApartamento",
                "mp_access_token",
                "mp_refresh_token"
            ];

            expectedFields.forEach(field => {
                expect(SENSITIVE_FIELDS.usuario).toContain(field);
            });
        });
    });

    describe("getSensitiveFields", () => {
        test("should return fields for known table", () => {
            const fields = getSensitiveFields("usuario");
            expect(fields.length).toBeGreaterThan(0);
        });

        test("should return empty array for unknown table", () => {
            const fields = getSensitiveFields("nonexistent");
            expect(fields).toEqual([]);
        });
    });

    describe("isSensitiveField", () => {
        test("should return true for sensitive field", () => {
            expect(isSensitiveField("usuario", "telefono")).toBe(true);
            expect(isSensitiveField("usuario", "mp_access_token")).toBe(true);
        });

        test("should return false for non-sensitive field", () => {
            expect(isSensitiveField("usuario", "nombre")).toBe(false);
            expect(isSensitiveField("usuario", "correo")).toBe(false);
        });

        test("should return false for unknown table", () => {
            expect(isSensitiveField("nonexistent", "anyfield")).toBe(false);
        });
    });

    describe("encryptSensitiveFields", () => {
        test("should encrypt sensitive fields only", () => {
            const data = {
                nombre: "John",
                telefono: "3001234567",
                correo: "john@example.com"
            };

            const result = encryptSensitiveFields("usuario", data);

            // Non-sensitive fields unchanged
            expect(result.nombre).toBe("John");
            expect(result.correo).toBe("john@example.com");

            // Sensitive field encrypted
            expect(isEncrypted(result.telefono)).toBe(true);
            expect(decryptField(result.telefono)).toBe("3001234567");
        });

        test("should handle null/undefined values in data", () => {
            const data = {
                nombre: "John",
                telefono: null,
                direccionNombre: undefined
            };

            const result = encryptSensitiveFields("usuario", data);

            expect(result.telefono).toBeNull();
            expect(result.direccionNombre).toBeUndefined();
        });

        test("should return data unchanged for unknown table", () => {
            const data = { field1: "value1" };
            const result = encryptSensitiveFields("nonexistent", data);

            expect(result).toEqual(data);
        });

        test("should handle null/undefined data", () => {
            expect(encryptSensitiveFields("usuario", null)).toBeNull();
            expect(encryptSensitiveFields("usuario", undefined)).toBeUndefined();
        });
    });

    describe("decryptSensitiveFields", () => {
        test("should decrypt sensitive fields only", () => {
            // First encrypt
            const original = {
                nombre: "John",
                telefono: "3001234567"
            };
            const encrypted = encryptSensitiveFields("usuario", original);

            // Then decrypt
            const decrypted = decryptSensitiveFields("usuario", encrypted);

            expect(decrypted.nombre).toBe("John");
            expect(decrypted.telefono).toBe("3001234567");
        });

        test("should handle unencrypted values (backwards compatibility)", () => {
            const data = {
                nombre: "John",
                telefono: "3001234567" // Not encrypted
            };

            const result = decryptSensitiveFields("usuario", data);

            // Should return as-is
            expect(result.telefono).toBe("3001234567");
        });

        test("should handle null/undefined values", () => {
            const data = {
                telefono: null,
                direccionNombre: undefined
            };

            const result = decryptSensitiveFields("usuario", data);

            expect(result.telefono).toBeNull();
            expect(result.direccionNombre).toBeUndefined();
        });
    });

    describe("decryptSensitiveFieldsArray", () => {
        test("should decrypt array of records", () => {
            const records = [
                { nombre: "John", telefono: encryptField("111") },
                { nombre: "Jane", telefono: encryptField("222") }
            ];

            const result = decryptSensitiveFieldsArray("usuario", records);

            expect(result[0].telefono).toBe("111");
            expect(result[1].telefono).toBe("222");
        });

        test("should handle non-array input", () => {
            const notArray = { field: "value" };
            const result = decryptSensitiveFieldsArray("usuario", notArray);

            expect(result).toEqual(notArray);
        });
    });
});

