/**
 * @fileoverview This file defines the abstract interfaces for clients that
 * communicate with the backend microservices (key-service and routing-service).
 * These contracts decouple the core application logic from the network layer.
 */
import type {SecureEnvelope} from "@/types/models";
import type {URN} from "@/types/urn.ts";
/**
 * Defines the contract for a client that communicates with the go-key-service.
 */
export interface KeyClient {
    /**
     * Fetches a user's public key.
     * @param userId The URN of the user.
     */
    getKey(userId: URN): Promise<Uint8Array>;

    /**
     * Stores a user's public key.
     * @param userId The URN of the user.
     * @param key The public key to store.
     */
    storeKey(userId: URN, key: Uint8Array): Promise<void>;
}

/**
 * Defines the contract for a client that communicates with the go-routing-service.
 */
export interface RoutingClient {
    /**
     * Dispatches a SecureEnvelope for delivery.
     * @param envelope The envelope to send.
     */
    send(envelope: SecureEnvelope): Promise<void>;

    receive(userId: URN): Promise<SecureEnvelope[]>;
}

// Add a dummy export that generates code
export const version = '1.0.0';
