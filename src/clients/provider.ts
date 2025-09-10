/**
 * @fileoverview This file defines the abstract interfaces for clients that
 * communicate with the backend microservices (key-service and routing-service).
 * These contracts decouple the core application logic from the network layer.
 */
import type {SecureEnvelope} from "@/types/models";

/**
 * Defines the contract for a client that interacts with the key-service.
 * This service is responsible for storing and retrieving user public keys.
 */
export interface KeyClient {
    /**
     * Fetches a user's public key from the key-service.
     * @param userId - The unique identifier of the user whose key to retrieve.
     * @returns A promise that resolves with the raw public key as a byte array.
     */
    getKey(userId: string): Promise<Uint8Array>;

    /**
     * Stores a user's public key in the key-service.
     * @param userId - The unique identifier of the user whose key to store.
     * @param key - The raw public key as a byte array.
     * @returns A promise that resolves when the key has been successfully stored.
     */
    storeKey(userId: string, key: Uint8Array): Promise<void>;
}

/**
 * Defines the contract for a client that interacts with the routing-service.
 * This service is responsible for forwarding encrypted messages between users.
 */
export interface RoutingClient {
    /**
     * Sends a secure envelope to the routing-service for delivery.
     * @param envelope - The SecureEnvelope object to be sent.
     * @returns A promise that resolves when the envelope has been accepted by the service.
     */
    send(envelope: SecureEnvelope): Promise<void>;

    receive(userId: string): Promise<SecureEnvelope[]>;
}

// Add a dummy export that generates code
export const version = '1.0.0';
