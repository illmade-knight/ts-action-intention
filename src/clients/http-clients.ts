/**
 * @fileoverview This file contains the concrete implementations of the KeyClient
 * and RoutingClient interfaces, using the browser's fetch API for HTTP requests.
 */
import type { KeyClient, RoutingClient } from './provider';
import type { SecureEnvelope } from '../types/models';
import type { URN } from "../types/urn";

/**
 * An implementation of the KeyClient that communicates with the go-key-service.
 */
export class KeyClientImpl implements KeyClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    async getKey(userId: URN): Promise<Uint8Array> {
        const response = await fetch(`${this.baseURL}/keys/${userId.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch key for user ${userId}`);
        }
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }

    async storeKey(userId: URN, key: Uint8Array): Promise<void> {
        const keyBuffer = new Uint8Array(key);
        const response = await fetch(`${this.baseURL}/keys/${userId.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: keyBuffer,
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

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    async send(envelope: SecureEnvelope): Promise<void> {
        const response = await fetch(`${this.baseURL}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envelope),
        });
        if (!response.ok) {
            throw new Error('Failed to send envelope');
        }
    }

    /**
     * Fetches all secure envelopes for a user from the routing service.
     */
    async receive(userId: URN): Promise<SecureEnvelope[]> {

        console.log("getting envelope")

        const response = await fetch(`${this.baseURL}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId.toString(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch messages. Status: ${response.status}`);
        }

        // Only if the response is successful AND has a body do we parse it.
        return response.status === 204 ? [] : response.json();
    }
}

