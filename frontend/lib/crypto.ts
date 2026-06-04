/**
 * CipherVault Cryptography Library
 * Uses Web Crypto API (SubtleCrypto) for Zero-Knowledge Encryption.
 * Flow: Password -> PBKDF2 -> AES-GCM Key -> Encrypt File
 */

export interface EncryptionResult {
  encryptedBlob: Blob;
  iv: Uint8Array;
  salt: Uint8Array;
  fileHash: string; // Hex string
}

/**
 * Derives an AES-GCM key from a master password.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    } as any, // Cast to any to handle type mismatch with subtle crypto params
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a file using AES-256-GCM.
 */
export async function encryptFile(file: File, password: string): Promise<EncryptionResult> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Standard 12 bytes for GCM
  
  const key = await deriveKey(password, salt);
  const fileBuffer = await file.arrayBuffer();

  // Calculate Hash for Integrity (before encryption)
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    } as any,
    key,
    fileBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    iv,
    salt,
    fileHash,
  };
}

/**
 * Decrypts an encrypted blob.
 */
export async function decryptFile(
  encryptedBlob: Blob,
  password: string,
  iv: Uint8Array,
  salt: Uint8Array
): Promise<Blob> {
  const key = await deriveKey(password, salt);
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    } as any,
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}

/**
 * Utility: Converts Uint8Array to Base64 (for transmission)
 */
export function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Utility: Converts Base64 to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
