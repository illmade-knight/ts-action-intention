/**
 * @fileoverview This file contains the implementation of the Crypto class,
 * which handles all cryptographic operations for the application. It uses the
 * platform-agnostic Web Crypto API.
 */

/**
 * A class that encapsulates cryptographic operations using the Web Crypto API.
 */
export class Crypto {
    // Parameters for RSA-OAEP key generation (for encryption).
    private rsaOaepKeyGenParams: RsaHashedKeyGenParams = {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: 'SHA-256',
    };

    // Parameters for RSA-PSS key generation (for signing).
    private rsaPssKeyGenParams: RsaHashedKeyGenParams = {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
    };

    // Parameters for RSA-OAEP encryption/decryption operations.
    private rsaOaepParams: RsaOaepParams = {
        name: 'RSA-OAEP',
    };

    // Parameters for RSA-PSS signing operations.
    private signAlgorithm: RsaPssParams = {
        name: 'RSA-PSS',
        saltLength: 32,
    };

    /**
     * Generates a new RSA key pair for ENCRYPTION.
     * @returns A promise that resolves with a CryptoKeyPair.
     */
    async generateEncryptionKeys(): Promise<CryptoKeyPair> {
        return crypto.subtle.generateKey(this.rsaOaepKeyGenParams, true, ['encrypt', 'decrypt']);
    }

    /**
     * Generates a new RSA key pair for SIGNING.
     * @returns A promise that resolves with a CryptoKeyPair.
     */
    async generateSigningKeys(): Promise<CryptoKeyPair> {
        return crypto.subtle.generateKey(this.rsaPssKeyGenParams, true, ['sign', 'verify']);
    }

    /**
     * Encrypts a plaintext payload using a hybrid encryption scheme.
     * @param publicKey - The recipient's public RSA-OAEP key.
     * @param plaintext - The data to encrypt as a Uint8Array.
     * @returns A promise that resolves with the encrypted data as a Uint8Array.
     */
    async encrypt(publicKey: CryptoKey, plaintext: Uint8Array): Promise<Uint8Array> {
        const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
        ]);

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            plaintext
        );

        const exportedAesKey = await crypto.subtle.exportKey('raw', aesKey);
        const encryptedAesKey = await crypto.subtle.encrypt(this.rsaOaepParams, publicKey, exportedAesKey);

        const result = new Uint8Array(iv.length + encryptedAesKey.byteLength + encryptedData.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encryptedAesKey), iv.length);
        result.set(new Uint8Array(encryptedData), iv.length + encryptedAesKey.byteLength);

        return result;
    }

    /**
     * Decrypts ciphertext using a hybrid decryption scheme.
     * @param privateKey - The user's private RSA-OAEP key.
     * @param ciphertext - The combined IV, encrypted key, and data.
     * @returns A promise that resolves with the decrypted plaintext as a Uint8Array.
     */
    async decrypt(privateKey: CryptoKey, ciphertext: Uint8Array): Promise<Uint8Array> {
        const iv = ciphertext.slice(0, 12);
        const encryptedAesKey = ciphertext.slice(12, 12 + 256);
        const encryptedData = ciphertext.slice(12 + 256);

        const decryptedAesKeyBytes = await crypto.subtle.decrypt(this.rsaOaepParams, privateKey, encryptedAesKey);

        const aesKey = await crypto.subtle.importKey(
            'raw',
            decryptedAesKeyBytes,
            { name: 'AES-GCM' },
            true,
            ['decrypt'],
        );

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            encryptedData
        );

        return new Uint8Array(decryptedData);
    }

    /**
     * Signs data with a private key to create a digital signature.
     * @param privateKey - The private RSA-PSS key to sign with.
     * @param data - The data to be signed.
     * @returns A promise that resolves with the signature as a Uint8Array.
     */
    async sign(privateKey: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
        const signature = await crypto.subtle.sign(this.signAlgorithm, privateKey, data);
        return new Uint8Array(signature);
    }

    /**
     * Verifies a digital signature against the original data and a public key.
     * @param publicKey - The public RSA-PSS key to verify with.
     * @param signature - The signature to verify.
     * @param data - The original, un-tampered data.
     * @returns A promise that resolves with a boolean indicating if the signature is valid.
     */
    async verify(publicKey: CryptoKey, signature: Uint8Array, data: Uint8Array): Promise<boolean> {
        return crypto.subtle.verify(this.signAlgorithm, publicKey, signature, data);
    }
}