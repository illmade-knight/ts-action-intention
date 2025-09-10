// src/clients/http-clients.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server'; // Import the mock server

import { KeyClientImpl, RoutingClientImpl } from './http-clients';
import type {KeyClient, RoutingClient} from './provider';
import type {SecureEnvelope} from '../types/models';

describe('KeyClientImpl', () => {
    let keyClient: KeyClient;
    const baseURL = 'https://keys.example.com';

    beforeEach(() => {
        keyClient = new KeyClientImpl(baseURL);
    });

    test('storeKey should send a POST request with the key data', async () => {
        const userId = 'test-user';
        const keyData = new Uint8Array([5, 4, 3, 2, 1]);
        await expect(keyClient.storeKey(userId, keyData)).resolves.toBeUndefined();
    });

    test('getKey should return key data for an existing user', async () => {
        const userId = 'user-with-key';
        const key = await keyClient.getKey(userId);
        expect(key).toBeInstanceOf(Uint8Array);
        expect(key).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('getKey should throw an error for a non-existing user (404)', async () => {
        const userId = 'user-without-key';
        await expect(keyClient.getKey(userId)).rejects.toThrow();
    });
});

describe('RoutingClientImpl', () => {
    let routingClient: RoutingClient;

    beforeEach(() => {
        routingClient = new RoutingClientImpl('https://routing.example.com');
    });

    test('send should POST the secure envelope to the routing service', async () => {
        // CORRECTED: The envelope now uses the proper camelCase fields.
        const envelope: SecureEnvelope = {
            senderId: 'sender-1',
            recipientId: 'recipient-1',
            encryptedSymmetricKey: 'base64-encrypted-key',
            encryptedData: 'base64-encrypted-data',
            signature: 'signature-data',
        };

        await expect(routingClient.send(envelope)).resolves.toBeUndefined();
    });

    test('send should throw an error on server failure (500)', async () => {
        // Temporarily override the default handler for this one test
        server.use(
            http.post('https://routing.example.com/send', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        // CORRECTED: The envelope now uses the proper camelCase fields.
        const envelope: SecureEnvelope = {
            senderId: 'sender-1',
            recipientId: 'recipient-1',
            encryptedSymmetricKey: 'base64-encrypted-key',
            encryptedData: 'base64-encrypted-data',
            signature: 'signature-data',
        };

        await expect(routingClient.send(envelope)).rejects.toThrow('Failed to send envelope');
    });
});