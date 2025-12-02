# Documentación de Encriptación AES-256-GCM

## Resumen

CicloMart implementa encriptación AES-256-GCM para proteger datos sensibles de usuarios almacenados en la base de datos. Esta documentación describe la arquitectura, configuración y uso del sistema de encriptación.

---

## Tabla de Contenidos

1. [Comparativa de Algoritmos](#comparativa-de-algoritmos)
2. [Por qué AES-256-GCM](#por-qué-aes-256-gcm)
3. [Campos Encriptados](#campos-encriptados)
4. [Configuración](#configuración)
5. [Uso](#uso)
6. [Formato de Datos](#formato-de-datos)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
8. [Migración de Datos](#migración-de-datos)
9. [Preparación para Niveles Futuros](#preparación-para-niveles-futuros)

---

## Comparativa de Algoritmos

### AES-256-GCM vs AES-256-CBC vs AES-256-CTR

| Característica                 | AES-256-GCM                     | AES-256-CBC                   | AES-256-CTR               |
| ------------------------------ | ------------------------------- | ----------------------------- | ------------------------- |
| **Tipo**                       | AEAD (Authenticated Encryption) | Block cipher                  | Stream cipher             |
| **Autenticación**              | ✅ Incluida (tag)               | ❌ Requiere HMAC separado     | ❌ Requiere HMAC separado |
| **Detección de tampering**     | ✅ Automática                   | ❌ Manual                     | ❌ Manual                 |
| **Padding**                    | ❌ No necesario                 | ✅ Requerido (PKCS7)          | ❌ No necesario           |
| **Paralelizable**              | ✅ Sí                           | ❌ No (encriptación)          | ✅ Sí                     |
| **IV único**                   | ✅ Crítico                      | ✅ Importante                 | ✅ Crítico                |
| **Vulnerabilidades conocidas** | Reutilización de IV             | Padding oracle, IV predecible | Reutilización de IV       |
| **Rendimiento**                | Alto                            | Medio                         | Alto                      |
| **Complejidad**                | Baja                            | Media                         | Media                     |

### Otros algoritmos considerados

| Algoritmo             | Pros                                                      | Contras                                       |
| --------------------- | --------------------------------------------------------- | --------------------------------------------- |
| **ChaCha20-Poly1305** | Más rápido en CPU sin AES-NI, resistente a timing attacks | Menos soporte en hardware, menos maduro       |
| **RSA**               | Asimétrico, ideal para intercambio de claves              | Muy lento para datos grandes, tamaño limitado |
| **3DES**              | Compatibilidad legacy                                     | Obsoleto, lento, tamaño de bloque pequeño     |

---

## Por qué AES-256-GCM

### 1. Autenticación Incluida (AEAD)

GCM (Galois/Counter Mode) proporciona **Authenticated Encryption with Associated Data (AEAD)**:

```
┌─────────────────────────────────────────────────────────────┐
│  Encriptación tradicional (CBC):                            │
│  Plaintext → Ciphertext                                     │
│  Problema: No detecta si alguien modificó el ciphertext     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Encriptación AEAD (GCM):                                   │
│  Plaintext → Ciphertext + Authentication Tag                │
│  Ventaja: Si el ciphertext cambia, el tag no coincide       │
│           → Error automático, datos no se retornan          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sin Padding Oracle Attacks

CBC requiere padding (PKCS7) que puede ser vulnerable a ataques de oráculo si los errores de padding se manejan incorrectamente. GCM no usa padding.

### 3. Rendimiento

- GCM puede paralelizarse tanto para encriptación como desencriptación.
- Aprovecha instrucciones AES-NI en CPUs modernas.
- CTR mode interno es muy eficiente.

### 4. Estándar de la Industria

- Recomendado por NIST (SP 800-38D).
- Usado en TLS 1.3.
- Amplio soporte en librerías criptográficas.

---

## Campos Encriptados

### Tabla `usuario`

| Campo                  | Tipo Original       | Descripción               | Razón de encriptación                    |
| ---------------------- | ------------------- | ------------------------- | ---------------------------------------- |
| `telefono`             | VARCHAR(60) → TEXT  | Teléfono del usuario      | PII (Información Personal Identificable) |
| `direccionNombre`      | VARCHAR(255) → TEXT | Nombre de calle           | PII - Dirección física                   |
| `direccionNumero`      | VARCHAR(255) → TEXT | Número de dirección       | PII - Dirección física                   |
| `direccionPiso`        | VARCHAR(30) → TEXT  | Piso                      | PII - Dirección física                   |
| `direccionApartamento` | VARCHAR(30) → TEXT  | Apartamento               | PII - Dirección física                   |
| `mp_access_token`      | VARCHAR(100) → TEXT | Token OAuth MercadoPago   | Credencial financiera sensible           |
| `mp_refresh_token`     | VARCHAR(100) → TEXT | Refresh token MercadoPago | Credencial financiera sensible           |

---

## Configuración

### Variable de Entorno

```bash
# .env
AES_KEY=<exactamente 32 caracteres>
```

### Requisitos de AES_KEY

- **Longitud exacta**: 32 caracteres (256 bits)
- **Caracteres**: Cualquier carácter ASCII
- **Generación segura recomendada**:

```bash
# Opción 1: OpenSSL
openssl rand -base64 24 | head -c 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64').slice(0, 32))"

# Opción 3: Usar caracteres alfanuméricos
node -e "console.log(require('crypto').randomBytes(24).toString('hex').slice(0, 32))"
```

### Validación

El sistema valida la clave al iniciar:

```javascript
if (!AES_KEY || AES_KEY.length !== 32) {
  console.error('ERROR: AES_KEY must be 32 characters (256 bits).')
  process.exit(1)
}
```

---

## Uso

### Encriptación Automática (Recomendado)

La encriptación es **transparente** al usar los helpers de `dbHelpers.js`:

```javascript
const { insert, updateById, findUserById } = require('./utils/dbHelpers')

// INSERT - Encripta automáticamente campos sensibles
await insert('usuario', {
  nombre: 'Juan',
  telefono: '3001234567', // Se encripta automáticamente
  correo: 'juan@example.com',
})

// UPDATE - Encripta automáticamente campos sensibles
await updateById('usuario', 'idUsuario', 1, {
  telefono: '3009876543', // Se encripta automáticamente
})

// SELECT - Desencripta automáticamente campos sensibles
const user = await findUserById(1)
console.log(user.telefono) // "3001234567" (ya desencriptado)
```

### Encriptación Manual

Para casos especiales, puedes usar las funciones directamente:

```javascript
const {
  encryptField,
  decryptField,
  isEncrypted,
} = require('./utils/encryption')

// Encriptar un valor
const encrypted = encryptField('3001234567')
// Resultado: "enc:v1:eyJpdiI6Ii4uLiIsImNpcGhlcnRleHQiOiIuLi4iLCJ0YWciOiIuLi4ifQ=="

// Verificar si está encriptado
console.log(isEncrypted(encrypted)) // true

// Desencriptar
const decrypted = decryptField(encrypted)
// Resultado: "3001234567"
```

---

## Formato de Datos

### Estructura del Dato Encriptado

```
enc:v1:<base64(JSON({iv, ciphertext, tag}))>
```

**Componentes:**

| Parte         | Descripción                                   |
| ------------- | --------------------------------------------- |
| `enc:`        | Prefijo identificador                         |
| `v1:`         | Versión del esquema (para rotación de claves) |
| `base64(...)` | JSON codificado en base64                     |

**JSON interno:**

```json
{
  "iv": "<12 bytes en base64>",
  "ciphertext": "<datos encriptados en base64>",
  "tag": "<16 bytes en base64>"
}
```

### Ejemplo Real

```
Plaintext: "3001234567"

Encrypted: "enc:v1:eyJpdiI6InhLOU1QMnFSOHZMMTIiLCJjaXBoZXJ0ZXh0IjoiQUJDMTIzWFlaIiwidGFnIjoiVEFHX0NBTENVTEFET18xMjMifQ=="

Decoded JSON:
{
  "iv": "xK9MP2qR8vL12",
  "ciphertext": "ABC123XYZ",
  "tag": "TAG_CALCULADO_123"
}
```

---

## Consideraciones de Seguridad

### ✅ Buenas Prácticas

1. **Nunca reutilizar IV**: El IV se genera aleatoriamente cada vez.
2. **Clave segura**: Usar 32 caracteres aleatorios, no palabras.
3. **Variable de entorno**: No hardcodear la clave en código.
4. **Logs seguros**: No loguear datos desencriptados.

### ❌ Evitar

1. **Clave en código fuente**: Siempre usar `.env`.
2. **Clave débil**: No usar `"12345678901234567890123456789012"`.
3. **Compartir clave**: Cada ambiente debe tener su propia clave.

### Gestión de Claves

```
┌─────────────────────────────────────────────────────────────┐
│  Desarrollo   │  AES_KEY generada localmente                │
├───────────────┼─────────────────────────────────────────────┤
│  Staging      │  AES_KEY diferente, en secrets manager      │
├───────────────┼─────────────────────────────────────────────┤
│  Producción   │  AES_KEY única, en secrets manager (AWS,    │
│               │  GCP, Azure Key Vault, etc.)                │
└───────────────┴─────────────────────────────────────────────┘
```

---

## Migración de Datos

### Ejecutar Migración de Esquema

Antes de usar encriptación, ejecutar el script de migración:

```bash
mysql -u root -p ciclomart < database/migrations/001_expand_encrypted_columns.sql
```

### Datos Existentes

La implementación es **backwards compatible**:

- Datos existentes (sin encriptar) se retornan tal cual.
- Al actualizar un registro, los campos se encriptan automáticamente.
- No es necesario migrar todos los datos de una vez.

### Script de Migración Masiva (Opcional)

Si deseas encriptar todos los datos existentes:

```javascript
// scripts/migrate_encrypt_existing.js
const { executeQuery, updateById } = require('../utils/dbHelpers')
const { encryptField, isEncrypted } = require('../utils/encryption')

async function migrateUsers() {
  const users = await executeQuery(
    'SELECT idUsuario, telefono, mp_access_token FROM usuario'
  )

  for (const user of users) {
    const updates = {}

    if (user.telefono && !isEncrypted(user.telefono)) {
      updates.telefono = encryptField(user.telefono)
    }
    if (user.mp_access_token && !isEncrypted(user.mp_access_token)) {
      updates.mp_access_token = encryptField(user.mp_access_token)
    }

    if (Object.keys(updates).length > 0) {
      await executeQuery(
        `UPDATE usuario SET ${Object.keys(updates)
          .map((k) => `${k} = ?`)
          .join(', ')} WHERE idUsuario = ?`,
        [...Object.values(updates), user.idUsuario]
      )
    }
  }
}
```

---

## Preparación para Niveles Futuros

### Nivel Intermedio: Rotación de Claves

El prefijo `v1:` permite soportar múltiples versiones de claves:

```javascript
// Futuro: detectar versión y usar clave correcta
const KEYS = {
  v1: process.env.AES_KEY_V1,
  v2: process.env.AES_KEY_V2,
}

function decryptField(value) {
  const version = extractVersion(value) // "v1" o "v2"
  const key = KEYS[version]
  // ... desencriptar con la clave correcta
}
```

### Nivel Avanzado: Integración con KMS

Estructura preparada para proveedores de claves externos:

```javascript
// Futuro: interfaz abstracta
const keyProvider = process.env.KEY_PROVIDER || 'local'

async function getKey() {
  switch (keyProvider) {
    case 'aws-kms':
      return await awsKms.decrypt(process.env.ENCRYPTED_AES_KEY)
    case 'azure-keyvault':
      return await azureKeyVault.getSecret('aes-key')
    default:
      return process.env.AES_KEY
  }
}
```

---

## Referencias

- [NIST SP 800-38D: GCM Specification](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
