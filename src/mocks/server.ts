// src/mocks/server.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
    // KeyClient handlers
    http.post('https://keys.example.com/keys/:userId', () => {
        return new HttpResponse(null, { status: 201 });
    }),
    http.get('https://keys.example.com/keys/user-with-key', () => {
        const keyData = new Uint8Array([1, 2, 3, 4, 5]);
        return new HttpResponse(keyData, {
            status: 200,
            headers: { 'Content-Type': 'application/octet-stream' },
        });
    }),
    http.get('https://keys.example.com/keys/user-without-key', () => {
        return new HttpResponse(null, { status: 404 });
    }),

    // RoutingClient "Success" handler
    http.post('https://routing.example.com/send', () => {
        return new HttpResponse(null, { status: 202 });
    }),
];

export const server = setupServer(...handlers);