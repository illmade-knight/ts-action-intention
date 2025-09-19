// src/clients/http-clients.test.ts
import { describe, test, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { KeyClientImpl, RoutingClientImpl } from './http-clients';
import type { KeyClient, RoutingClient } from './provider';
import type { SecureEnvelope } from '../types/models';
import {URN} from "@/types/urn.ts";

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

describe('KeyClientImpl', () => {
    let keyClient: KeyClient;
    const baseURL = 'https://keys.example.com';

    beforeEach(() => {
        keyClient = new KeyClientImpl(baseURL);
    });

    test('storeKey should send a POST request with the URN and key data', async () => {
        const userUrn = URN.create('user', 'test-user-to-store');
        const keyData = new Uint8Array([5, 4, 3, 2, 1]);
        await expect(keyClient.storeKey(userUrn, keyData)).resolves.toBeUndefined();
    });

    test('getKey should return key data for an existing user URN', async () => {
        const userUrn = URN.create('user', 'user-with-key');
        const key = await keyClient.getKey(userUrn);
        expect(key).toBeInstanceOf(Uint8Array);
        expect(key).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    test('getKey should throw an error for a non-existing user URN (404)', async () => {
        const userUrn = URN.create('user', 'user-without-key');
        await expect(keyClient.getKey(userUrn)).rejects.toThrow('Key for URN urn:sm:user:user-without-key not found');
    });
});

describe('RoutingClientImpl', () => {
    let routingClient: RoutingClient;

    beforeEach(() => {
        routingClient = new RoutingClientImpl('https://routing.example.com');
    });

    test('send should POST the secure envelope with URNs', async () => {
        const envelope: SecureEnvelope = {
            senderId: URN.create('user', 'sender-1'),
            recipientId: URN.create('user', 'recipient-1'),
            messageId: 'msg-abc-123',
            encryptedSymmetricKey: new Uint8Array([1, 1, 1]),
            encryptedData: new Uint8Array([2, 2, 2]),
            signature: new Uint8Array([3, 3, 3]),
        };

        await expect(routingClient.send(envelope)).resolves.toBeUndefined();
    });

    test('send should throw an error on server failure (500)', async () => {
        // Temporarily override the default handler for this specific test
        server.use(
            http.post('https://routing.example.com/send', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        const envelope: SecureEnvelope = {
            senderId: URN.create('user', 'sender-1'),
            recipientId: URN.create('user', 'recipient-1'),
            messageId: 'msg-abc-123',
            encryptedSymmetricKey: new Uint8Array([1, 1, 1]),
            encryptedData: new Uint8Array([2, 2, 2]),
            signature: new Uint8Array([3, 3, 3]),
        };

        await expect(routingClient.send(envelope)).rejects.toThrow('Failed to send envelope');
    });
});