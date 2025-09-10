/**
 * @fileoverview This file contains the implementation of the LocalStorageProvider,
 * which uses the browser's localStorage API to persist the application state.
 */
import type {StorageProvider, FileManifest} from './storage-provider';
import type {ApplicationState, Intention, Location, Person} from '@/types/models';

/**
 * A storage provider that saves the application state to the browser's
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

        // Parse the state to get the creation date from the metadata.
        const state = JSON.parse(item);

        return {
            path,
            size: item.length,
            // Revive the date string back into a Date object.
            lastModified: new Date(state.meta.createdAt),
        };
    }

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

        // Revive all date strings back into Date objects.
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
    }

    /**
     * Serializes and writes the application state to localStorage.
     * @param path - The key for the data in localStorage.
     * @param state - The ApplicationState object to be persisted.
     * @returns A promise that resolves when the write operation is complete.
     */
    async writeFile(path: string, state: ApplicationState): Promise<void> {
        // Using JSON.stringify will convert Date objects to ISO strings.
        const serializedState = JSON.stringify(state);
        window.localStorage.setItem(path, serializedState);
    }
}

