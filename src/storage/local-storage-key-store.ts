// in ts-action-intention/src/storage/local-storage-key-store.ts

import { KeyStore } from './key-store';

export class LocalStorageKeyStore implements KeyStore {
    async saveKeyPair(userId: string, keyPair: CryptoKeyPair): Promise<void> {
        const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

        const storableKeyPair = {
            publicKey: publicKeyJwk,
            privateKey: privateKeyJwk,
        };

        localStorage.setItem(`crypto_keys_${userId}`, JSON.stringify(storableKeyPair));
    }

    /**
     * CORRECTED: This function is now resilient to corrupted data.
     * If any error occurs while parsing or importing a stored key, it will
     * log the error and return null, correctly indicating no valid key was found.
     */
    async loadKeyPair(userId: string): Promise<CryptoKeyPair | null> {
        const stored = localStorage.getItem(`crypto_keys_${userId}`);
        if (!stored) {
            return null;
        }

        try {
            const jwkKeyPair = JSON.parse(stored);

            const publicKey = await crypto.subtle.importKey(
                'jwk',
                jwkKeyPair.publicKey,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                true,
                ['encrypt']
            );
            const privateKey = await crypto.subtle.importKey(
                'jwk',
                jwkKeyPair.privateKey,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                true,
                ['decrypt']
            );

            return { publicKey, privateKey };
        } catch (error) {
            console.error('Failed to load or parse stored key, treating as missing:', error);
            // If any part of the process fails, remove the corrupted key.
            localStorage.removeItem(`crypto_keys_${userId}`);
            return null;
        }
    }

    /**
     * ADDED: This method is needed for cleaning up orphaned keys.
     */
    async deleteKeyPair(userId: string): Promise<void> {
        localStorage.removeItem(`crypto_keys_${userId}`);
    }
}