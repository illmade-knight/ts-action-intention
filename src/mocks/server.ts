// src/mocks/server.ts
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {URN} from "@illmade-knight/action-intention-protos";

// Use a shared in-memory store to simulate persistence across tests
const keyStore: Record<string, Uint8Array> = {
    [URN.create('user', 'user-with-key').toString()]: new Uint8Array([1, 2, 3, 4, 5]),
};


export const handlers = [
    // KeyClient handlers
    http.post('https://keys.example.com/keys/:userId', async ({ params, request }) => {
        // Store the key using the full URN string as the key
        keyStore[params.userId as string] = new Uint8Array(await request.arrayBuffer());
        return new HttpResponse(null, { status: 201 });
    }),

    http.get('https://keys.example.com/keys/:userId', ({ params }) => {
        // Look up the key using the full URN string from the path
        const keyData = keyStore[params.userId as string];
        if (keyData) {
            return new HttpResponse(keyData, {
                status: 200,
                headers: { 'Content-Type': 'application/octet-stream' },
            });
        }
        return new HttpResponse(null, { status: 404 });
    }),

    // RoutingClient handler
    http.post('https://routing.example.com/send', async ({ request }) => {
        const body = await request.json();
        // A simple validation to ensure a valid-looking envelope was sent
        if (body && typeof body === 'object' && 'senderId' in body) {
            return new HttpResponse(null, { status: 202 });
        }
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request' });
    }),
];

export const server = setupServer(...handlers);