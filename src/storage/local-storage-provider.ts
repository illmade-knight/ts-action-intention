/**
 * @fileoverview This file contains the implementation of the LocalStorageProvider,
 * which uses the browser's localStorage API to persist the complete
 * application state, including cryptographic keys.
 */
import type { StorageProvider, FileManifest } from './storage-provider';
import type { ApplicationState, Intention, Location, Person } from '@/types/models';

/**
 * A storage provider that saves all application data to the browser's
 * local storage.
 */
export class LocalStorageProvider implements StorageProvider {
    /**
     * Retrieves metadata about the state file from localStorage.
     * @param path - The key for the data in localStorage.
     * @returns A promise that resolves with a FileManifest, or null if not found.
     */
    async getManifest(path: string): Promise<FileManifest | null> {
        const item = window.localStorage.getItem(path);
        if (!item) {
            return null;
        }
        const state = JSON.parse(item);
        return {
            path,
            size: item.length,
            lastModified: new Date(state.meta.createdAt),
        };
    } //

    /**
     * Reads and parses the application state from localStorage.
     * @param path - The key for the data in localStorage.
     * @returns A promise that resolves with the parsed ApplicationState.
     */
    async readFile(path: string): Promise<ApplicationState> {
        const item = window.localStorage.getItem(path);
        if (!item) {
            throw new Error('File not found in localStorage');
        }
        const state: ApplicationState = JSON.parse(item);
        state.meta.createdAt = new Date(state.meta.createdAt);
        state.intentions.forEach((intention: Intention) => {
            intention.createdAt = new Date(intention.createdAt);
            intention.startTime = new Date(intention.startTime);
            intention.endTime = new Date(intention.endTime);
        });
        state.locations.forEach((location: Location) => {
            location.createdAt = new Date(location.createdAt);
        });
        state.people.forEach((person: Person) => {
            person.createdAt = new Date(person.createdAt);
        });
        return state;
    } //

    /**
     * Serializes and writes the application state to localStorage.
     * @param path - The key for the data in localStorage.
     * @param state - The ApplicationState object to be persisted.
     * @returns A promise that resolves when the write operation is complete.
     */
    async writeFile(path: string, state: ApplicationState): Promise<void> {
        const serializedState = JSON.stringify(state);
        window.localStorage.setItem(path, serializedState);
    } //

    /**
     * Saves a key pair for a given user ID to localStorage.
     */
    async saveKeyPair(userId: string, keyPair: CryptoKeyPair): Promise<void> {
        const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
        const storableKeyPair = {
            publicKey: publicKeyJwk,
            privateKey: privateKeyJwk,
        };
        localStorage.setItem(`crypto_keys_${userId}`, JSON.stringify(storableKeyPair));
    } //

    /**
     * Loads a key pair for a given user ID from localStorage.
     */
    async loadKeyPair(userId: string): Promise<CryptoKeyPair | null> {
        const stored = localStorage.getItem(`crypto_keys_${userId}`);
        if (!stored) {
            return null;
        }
        try {
            const jwkKeyPair = JSON.parse(stored);
            const publicKey = await crypto.subtle.importKey('jwk', jwkKeyPair.publicKey, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
            const privateKey = await crypto.subtle.importKey('jwk', jwkKeyPair.privateKey, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
            return { publicKey, privateKey };
        } catch (error) {
            console.error('Failed to load or parse stored key, treating as missing:', error);
            localStorage.removeItem(`crypto_keys_${userId}`);
            return null;
        }
    } //

    /**
     * Deletes a key pair for a given user ID from localStorage.
     */
    async deleteKeyPair(userId: string): Promise<void> {
        localStorage.removeItem(`crypto_keys_${userId}`);
    } //
}