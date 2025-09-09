/**
 * @fileoverview This file contains the concrete implementations of the KeyClient
 * and RoutingClient interfaces, using the browser's fetch API for HTTP requests.
 */

/**
 * @fileoverview This file contains the concrete implementations of the KeyClient
 * and RoutingClient interfaces, using the browser's fetch API for HTTP requests.
 */
import type {KeyClient, RoutingClient} from './provider.js';
import type {SecureEnvelope} from '../types/models.ts';

/**
 * An implementation of the KeyClient that communicates with the go-key-service.
 */
export class KeyClientImpl implements KeyClient {
    private baseURL: string;

    /**
     * Creates a new KeyClientImpl.
     * @param baseURL - The base URL of the key service.
     */
    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Fetches a user's public key from the key service.
     * @param userId - The ID of the user whose key is to be fetched.
     * @returns A promise that resolves with the public key as a Uint8Array.
     */
    async getKey(userId: string): Promise<Uint8Array> {
        const response = await fetch(`${this.baseURL}/keys/${userId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch key for user ${userId}`);
        }

        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }

    /**
     * Stores a user's public key in the key service.
     * @param userId - The ID of the user whose key is to be stored.
     * @param key - The public key as a Uint8Array.
     * @returns A promise that resolves when the operation is complete.
     */
    async storeKey(userId: string, key: Uint8Array): Promise<void> {
        const response = await fetch(`${this.baseURL}/keys/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: key,
        });

        if (!response.ok) {
            throw new Error(`Failed to store key for user ${userId}`);
        }
    }
}

/**
 * An implementation of the RoutingClient that communicates with the go-routing-service.
 */
export class RoutingClientImpl implements RoutingClient {
    private baseURL: string;

    /**
     * Creates a new RoutingClientImpl.
     * @param baseURL - The base URL of the routing service.
     */
    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    /**
     * Sends a secure envelope to the routing service.
     * @param envelope - The SecureEnvelope to be sent.
     * @returns A promise that resolves when the operation is complete.
     */
    async send(envelope: SecureEnvelope): Promise<void> {
        const response = await fetch(`${this.baseURL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(envelope),
        });

        if (!response.ok) {
            throw new Error('Failed to send envelope');
        }
    }
}
