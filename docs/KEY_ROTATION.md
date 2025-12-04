# Rotación de Claves y AWS KMS

Esta documentación cubre el sistema de rotación de claves y la integración con AWS KMS para CicloMart.

## Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Nivel Intermedio: Rotación de Claves Local](#nivel-intermedio-rotación-de-claves-local)
3. [Nivel Avanzado: AWS KMS](#nivel-avanzado-aws-kms)
4. [Guía de Configuración](#guía-de-configuración)
5. [Scripts de Migración](#scripts-de-migración)
6. [Troubleshooting](#troubleshooting)

---

## Arquitectura

### Sistema de Versionado de Claves

```
┌─────────────────────────────────────────────────────────────────────┐
│  Datos encriptados en BD                                            │
├─────────────────────────────────────────────────────────────────────┤
│  enc:v1:eyJpdi... ──────────► Descifrar con AES_KEY_V1              │
│  enc:v2:eyJpdi... ──────────► Descifrar con AES_KEY_V2              │
│  enc:v3:eyJpdi... ──────────► Descifrar con AES_KEY_V3              │
│  enc:kms:base64... ─────────► Descifrar con AWS KMS                 │
└─────────────────────────────────────────────────────────────────────┘
```

El prefijo indica qué clave usar:

- `enc:v1:` → Clave versión 1
- `enc:v2:` → Clave versión 2
- `enc:kms:` → AWS KMS (envelope encryption)

---

## Nivel Intermedio: Rotación de Claves Local

### Cuándo rotar claves

- Compromiso de seguridad sospechado
- Rotación periódica (cada 90 días recomendado)
- Cambio de personal con acceso a claves
- Cumplimiento normativo (PCI-DSS, GDPR)

### Configuración

1. **Generar nueva clave:**

```bash
# Generar clave de 32 caracteres
node scripts/rotate_key.js --generate-key
```

2. **Agregar al `.env`:**

```env
# Claves existentes (mantener para descifrar datos antiguos)
AES_KEY_V1=clave_original_32_caracteres
AES_KEY_V2=nueva_clave_32_caracteres

# Versión actual para nuevas encriptaciones
AES_CURRENT_VERSION=v2
```

3. **Ejecutar rotación:**

```bash
# Prueba (sin modificar BD)
node scripts/rotate_key.js --from=v1 --to=v2 --dry-run

# Ejecutar rotación real
node scripts/rotate_key.js --from=v1 --to=v2
```

### Script de Rotación

```bash
# Uso completo
node scripts/rotate_key.js --from=v1 --to=v2 [--dry-run] [--batch=100]

# Opciones:
#   --from=v1    Versión origen (requerido)
#   --to=v2      Versión destino (default: AES_CURRENT_VERSION)
#   --dry-run    Solo mostrar cambios
#   --batch=100  Registros por lote

# Generar nueva clave
node scripts/rotate_key.js --generate-key
```

### Proceso de Rotación

1. **Pre-rotación:**
   - Backup de BD
   - Verificar que ambas claves están configuradas
   - Ejecutar `--dry-run` primero

2. **Rotación:**
   - Ejecutar script de rotación
   - Monitorear errores

3. **Post-rotación:**
   - Actualizar `AES_CURRENT_VERSION` en `.env`
   - Verificar aplicación funciona
   - Después de 30 días, remover clave antigua

---

## Nivel Avanzado: AWS KMS

### Envelope Encryption

```
┌─────────────────────────────────────────────────────────────────────┐
│  AWS KMS (Customer Master Key - CMK)                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CMK nunca sale de AWS                                      │   │
│  │  Rotación automática disponible                             │   │
│  │  Auditoría via CloudTrail                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  Data Encryption Key (DEK)                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  KMS genera DEK único por operación                         │   │
│  │  App recibe: DEK plaintext + DEK encriptado                 │   │
│  │  App usa DEK para AES-256-GCM                               │   │
│  │  App guarda: datos encriptados + DEK encriptado             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Datos en BD:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  enc:kms:<DEK_len><DEK_encrypted><IV><ciphertext><tag>      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Configuración AWS

1. **Crear KMS Key en AWS Console:**
   - Ir a AWS KMS → Customer managed keys
   - Create key → Symmetric → Encrypt and decrypt
   - Dar alias (ej: `ciclomart-encryption-key`)
   - Configurar permisos IAM

2. **Configurar IAM Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["kms:GenerateDataKey", "kms:Decrypt"],
      "Resource": "arn:aws:kms:REGION:ACCOUNT:key/KEY-ID"
    }
  ]
}
```

3. **Variables de entorno:**

```env
# Proveedor de claves
KEY_PROVIDER=aws-kms

# AWS Configuration
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789:key/12345678-1234-1234-1234-123456789012

# Credenciales (si no usas IAM role)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Migración a KMS

```bash
# Prueba
node scripts/migrate_to_kms.js --dry-run

# Ejecutar migración
node scripts/migrate_to_kms.js

# Migrar tabla específica
node scripts/migrate_to_kms.js --table=usuario
```

### Rotación Automática de Claves AWS

AWS KMS puede rotar automáticamente las claves cada año:

```bash
# Habilitar rotación automática (AWS CLI)
aws kms enable-key-rotation --key-id tu-key-id

# Verificar estado
aws kms get-key-rotation-status --key-id tu-key-id
```

**Importante**: La rotación automática NO re-encripta datos existentes.

- ✅ Datos nuevos: Se encriptan con el key material más reciente
- ⚠️ Datos antiguos: Permanecen con el key material original (pero siguen desencriptándose)

### Re-encriptar Después de Rotación

Para forzar que todos los datos usen el key material más reciente:

```bash
# Preview
node scripts/reencrypt_kms.js --dry-run

# Ejecutar re-encriptación
node scripts/reencrypt_kms.js

# Solo una tabla
node scripts/reencrypt_kms.js --table=usuario

# Incluir datos no-KMS (--force)
node scripts/reencrypt_kms.js --force
```

**¿Cuándo usar?**

- Después de habilitar rotación automática en KMS
- Por cumplimiento: "todos los datos deben usar claves < 1 año"
- Antes de deshabilitar una versión antigua del key material

---

## Guía de Configuración

### Configuración Mínima (Local)

```env
# Una sola clave (v1 implícito)
AES_KEY=mi_clave_segura_de_32_chars
```

### Configuración con Rotación (Local)

```env
# Múltiples versiones
AES_KEY_V1=clave_antigua_32_caracteres
AES_KEY_V2=clave_nueva_32_caracteres
AES_CURRENT_VERSION=v2
```

### Configuración AWS KMS

```env
# Proveedor
KEY_PROVIDER=aws-kms

# AWS
AWS_REGION=us-east-1
AWS_KMS_KEY_ID=arn:aws:kms:...

# Mantener claves locales durante migración
AES_KEY_V1=clave_para_descifrar_datos_antiguos
```

---

## Scripts de Migración

### Comandos Disponibles

| Script                     | Descripción                                        |
| -------------------------- | -------------------------------------------------- |
| `rotate_key.js`            | Rotar entre versiones locales                      |
| `migrate_to_kms.js`        | Migrar de local a AWS KMS                          |
| `migrate_encrypt_users.js` | Encriptar datos existentes (plaintext → encrypted) |
| `reencrypt_kms.js`         | Re-encriptar con clave KMS más reciente            |

### npm Scripts

```bash
npm run encrypt:migrate    # Encriptar datos plaintext
npm run kms:migrate        # Migrar de local → KMS
npm run kms:reencrypt      # Re-encriptar con clave KMS actual
npm run kms:rotate         # Rotar claves locales
```

### Ejemplos de Uso

```bash
# Rotar de v1 a v2
node scripts/rotate_key.js --from=v1 --to=v2

# Migrar todo a KMS
node scripts/migrate_to_kms.js

# Encriptar datos no encriptados
node utils/migrate_encrypt_users.js
```

---

## Troubleshooting

### Error: "No key found for version X"

```
Causa: Falta la clave para esa versión en .env
Solución: Agregar AES_KEY_VX=... en .env
```

### Error: "KMS AccessDeniedException"

```
Causa: Permisos IAM insuficientes
Solución:
  1. Verificar política IAM incluye kms:GenerateDataKey y kms:Decrypt
  2. Verificar ARN del key es correcto
  3. Verificar región es correcta
```

### Error: "Unable to locate credentials"

```
Causa: AWS no encuentra credenciales
Solución:
  1. Si EC2: Verificar IAM role está asignado
  2. Si local: Configurar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY
  3. Verificar ~/.aws/credentials existe
```

### Datos corruptos después de rotación

```
Causa: Rotación incompleta o clave incorrecta
Solución:
  1. Restaurar backup de BD
  2. Verificar todas las claves están configuradas
  3. Ejecutar --dry-run primero
```

---

## Mejores Prácticas

1. **Backup antes de rotar**: Siempre hacer backup de BD antes de rotación
2. **Dry-run primero**: Ejecutar con `--dry-run` antes de cambios reales
3. **Mantener claves antiguas**: No eliminar claves hasta verificar todos los datos migrados
4. **Rotación periódica**: Rotar claves cada 90 días
5. **Usar KMS en producción**: Para mejor seguridad y auditoría
6. **No hardcodear claves**: Siempre usar variables de entorno o secrets manager

---

## Referencias

- [AWS KMS Developer Guide](https://docs.aws.amazon.com/kms/latest/developerguide/)
- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)
- [NIST Key Management Guidelines](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
