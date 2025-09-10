/** Defines the contract for storing and retrieving CryptoKey pairs. */
export interface KeyStore {
    /** Saves a key pair for a given user ID. */
    saveKeyPair(userId: string, keyPair: CryptoKeyPair): Promise<void>;

    /** Loads a key pair for a given user ID. */
    loadKeyPair(userId: string): Promise<CryptoKeyPair | null>;
}