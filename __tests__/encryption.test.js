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

const {
    decryptData,
    FIELDS_TO_DECRYPT,
    FIELDS_TO_REMOVE
} = require("../middleware/decryptResponse");

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
        test("should decrypt sensitive fields only", async () => {
            // First encrypt
            const original = {
                nombre: "John",
                telefono: "3001234567"
            };
            const encrypted = encryptSensitiveFields("usuario", original);

            // Then decrypt (now async)
            const decrypted = await decryptSensitiveFields("usuario", encrypted);

            expect(decrypted.nombre).toBe("John");
            expect(decrypted.telefono).toBe("3001234567");
        });

        test("should handle unencrypted values (backwards compatibility)", async () => {
            const data = {
                nombre: "John",
                telefono: "3001234567" // Not encrypted
            };

            const result = await decryptSensitiveFields("usuario", data);

            // Should return as-is
            expect(result.telefono).toBe("3001234567");
        });

        test("should handle null/undefined values", async () => {
            const data = {
                telefono: null,
                direccionNombre: undefined
            };

            const result = await decryptSensitiveFields("usuario", data);

            expect(result.telefono).toBeNull();
            expect(result.direccionNombre).toBeUndefined();
        });
    });

    describe("decryptSensitiveFieldsArray", () => {
        test("should decrypt array of records", async () => {
            const records = [
                { nombre: "John", telefono: encryptField("111") },
                { nombre: "Jane", telefono: encryptField("222") }
            ];

            const result = await decryptSensitiveFieldsArray("usuario", records);

            expect(result[0].telefono).toBe("111");
            expect(result[1].telefono).toBe("222");
        });

        test("should handle non-array input", async () => {
            const notArray = { field: "value" };
            const result = await decryptSensitiveFieldsArray("usuario", notArray);

            expect(result).toEqual(notArray);
        });
    });
});

describe("decryptResponse middleware", () => {
    describe("FIELDS_TO_DECRYPT configuration", () => {
        test("should include user-visible fields", () => {
            expect(FIELDS_TO_DECRYPT).toContain("telefono");
            expect(FIELDS_TO_DECRYPT).toContain("direccionNombre");
        });

        test("should include aliased fields from views", () => {
            expect(FIELDS_TO_DECRYPT).toContain("telefonoVendedor");
            expect(FIELDS_TO_DECRYPT).toContain("direccionEnvio");
        });

        test("should NOT include server secrets (they go in FIELDS_TO_REMOVE)", () => {
            expect(FIELDS_TO_DECRYPT).not.toContain("mp_access_token");
            expect(FIELDS_TO_DECRYPT).not.toContain("mp_refresh_token");
            expect(FIELDS_TO_DECRYPT).not.toContain("password");
        });
    });

    describe("FIELDS_TO_REMOVE configuration", () => {
        test("should include MercadoPago tokens", () => {
            expect(FIELDS_TO_REMOVE).toContain("mp_access_token");
            expect(FIELDS_TO_REMOVE).toContain("mp_refresh_token");
        });

        test("should include password", () => {
            expect(FIELDS_TO_REMOVE).toContain("password");
        });
    });

    describe("decryptData", () => {
        test("should decrypt encrypted fields in object", async () => {
            const data = {
                nombre: "John",
                telefono: encryptField("3001234567"),
                correo: "john@example.com"
            };

            const result = await decryptData(data);

            expect(result.nombre).toBe("John");
            expect(result.telefono).toBe("3001234567");
            expect(result.correo).toBe("john@example.com");
        });

        test("should decrypt nested objects", async () => {
            const data = {
                message: "success",
                data: {
                    user: {
                        nombre: "John",
                        telefono: encryptField("3001234567")
                    }
                }
            };

            const result = await decryptData(data);

            expect(result.data.user.telefono).toBe("3001234567");
        });

        test("should decrypt arrays of objects", async () => {
            const data = {
                message: "success",
                data: [
                    { nombre: "John", telefono: encryptField("111") },
                    { nombre: "Jane", telefono: encryptField("222") }
                ]
            };

            const result = await decryptData(data);

            expect(result.data[0].telefono).toBe("111");
            expect(result.data[1].telefono).toBe("222");
        });

        test("should handle aliased fields from views", async () => {
            const data = {
                idProducto: 1,
                nombreVendedor: "John",
                telefonoVendedor: encryptField("3001234567")
            };

            const result = await decryptData(data);

            expect(result.telefonoVendedor).toBe("3001234567");
        });

        test("should handle null/undefined", async () => {
            expect(await decryptData(null)).toBeNull();
            expect(await decryptData(undefined)).toBeUndefined();
        });

        test("should handle unencrypted values (backwards compatibility)", async () => {
            const data = {
                telefono: "3001234567" // Not encrypted
            };

            const result = await decryptData(data);

            expect(result.telefono).toBe("3001234567");
        });

        test("should not modify fields not in FIELDS_TO_DECRYPT", async () => {
            const encryptedValue = encryptField("secret");
            const data = {
                customField: encryptedValue // Not in FIELDS_TO_DECRYPT
            };

            const result = await decryptData(data);

            // Should remain encrypted since customField is not in the list
            expect(result.customField).toBe(encryptedValue);
        });

        test("should remove server secrets (mp_access_token, mp_refresh_token)", async () => {
            const data = {
                idUsuario: 1,
                nombre: "John",
                mp_access_token: "APP_USR-secret-token",
                mp_refresh_token: "TG-refresh-token",
                telefono: encryptField("3001234567")
            };

            const result = await decryptData(data);

            // User data should be present
            expect(result.idUsuario).toBe(1);
            expect(result.nombre).toBe("John");
            expect(result.telefono).toBe("3001234567");

            // Server secrets should be REMOVED
            expect(result.mp_access_token).toBeUndefined();
            expect(result.mp_refresh_token).toBeUndefined();
        });

        test("should remove password from responses", async () => {
            const data = {
                idUsuario: 1,
                nombre: "John",
                correo: "john@example.com",
                password: "$2b$10$hashedpassword..."
            };

            const result = await decryptData(data);

            expect(result.idUsuario).toBe(1);
            expect(result.nombre).toBe("John");
            expect(result.correo).toBe("john@example.com");
            expect(result.password).toBeUndefined();
        });

        test("should remove secrets from nested objects", async () => {
            const data = {
                message: "success",
                data: {
                    user: {
                        nombre: "John",
                        mp_access_token: "secret-token",
                        telefono: encryptField("123")
                    }
                }
            };

            const result = await decryptData(data);

            expect(result.data.user.nombre).toBe("John");
            expect(result.data.user.telefono).toBe("123");
            expect(result.data.user.mp_access_token).toBeUndefined();
        });

        test("should remove secrets from arrays of objects", async () => {
            const data = [
                { nombre: "John", mp_access_token: "token1", password: "hash1" },
                { nombre: "Jane", mp_access_token: "token2", password: "hash2" }
            ];

            const result = await decryptData(data);

            expect(result[0].nombre).toBe("John");
            expect(result[0].mp_access_token).toBeUndefined();
            expect(result[0].password).toBeUndefined();

            expect(result[1].nombre).toBe("Jane");
            expect(result[1].mp_access_token).toBeUndefined();
            expect(result[1].password).toBeUndefined();
        });
    });
});

