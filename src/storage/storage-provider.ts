/**
 * @fileoverview This file defines the abstract interfaces for storage and
 * authentication providers, enabling a "bring your own storage" model.
 */

/**
 * @fileoverview This file defines the abstract interfaces for storage and
 * authentication providers, enabling a "bring your own storage" model.
 */
import type {ApplicationState} from '@/types/models.ts';

/**
 * Represents the metadata for a file stored by a provider.
 */
export interface FileManifest {
    /** The unique path or identifier for the file. */
    path: string;
    /** The size of the file in bytes. */
    size: number;
    /** The timestamp of the last modification. */
    lastModified: Date;
}

/**
 * Defines the contract for a storage provider. Any class that handles
 * the persistence of the application state must implement this interface.
 */
export interface StorageProvider {
    /**
     * Retrieves metadata about the state file.
     * @param path - The unique path or identifier for the file.
     * @returns A promise that resolves with a FileManifest, or null if not found.
     */
    getManifest(path: string): Promise<FileManifest | null>;

    /**
     * Reads the entire content of the state file.
     * @param path - The unique path or identifier for the file.
     * @returns A promise that resolves with the parsed ApplicationState.
     */
    readFile(path: string): Promise<ApplicationState>;

    /**
     * Writes the entire application state to the state file.
     * @param path - The unique path or identifier for the file.
     * @param state - The ApplicationState object to be persisted.
     * @returns A promise that resolves when the write operation is complete.
     */
    writeFile(path: string, state: ApplicationState): Promise<void>;
}

/**
 * Defines the contract for an authentication provider. Any class that
 * handles user authentication with a third-party service must implement this.
 */
export interface AuthProvider {
    /**
     * Initiates the authentication flow with the provider.
     */
    login(): Promise<void>;

    /**
     * Logs the user out.
     */
    logout(): Promise<void>;

    /**
     * Retrieves the current, valid authentication token.
     * @returns A promise that resolves with the auth token string.
     */
    getAuthToken(): Promise<string>;

    /**
     * Checks if the user is currently authenticated.
     * @returns A promise that resolves with a boolean.
     */
    isAuthenticated(): Promise<boolean>;
}

