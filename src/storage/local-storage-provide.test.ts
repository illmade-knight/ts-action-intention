/**
 * @fileoverview This file contains the Jest test suite for the LocalStorageProvider.
 * It follows a TDD approach, defining the required behavior for a class that
 * interacts with the browser's localStorage API.
 */

// Import testing functions from Vitest
import { describe, test, expect, beforeAll, beforeEach, vi } from 'vitest';

// Import using the new absolute path aliases
import { LocalStorageProvider } from '@/storage/local-storage-provider';
import type {StorageProvider} from '@/storage/storage-provider';
import type {ApplicationState} from '@/types/models';

// Helper function to create mock application state
const createMockState = (): ApplicationState => ({
    locations: [],
    people: [],
    intentions: [],
    user: { id: 'user-123', name: 'Test User' },
    meta: { version: 1, createdAt: new Date() },
});

describe('LocalStorageProvider', () => {
    let provider: StorageProvider;
    let mockState: ApplicationState;
    const filePath = 'action-intention-state.json';

    // Mock implementation of the localStorage API
    let localStorageMock: { [key: string]: string } = {};

    beforeAll(() => {
        // Use vi.spyOn to mock the global localStorage object
        vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => ({
            getItem: (key: string) => localStorageMock[key] || null,
            setItem: (key: string, value: string) => {
                localStorageMock[key] = value;
            },
            removeItem: (key: string) => {
                delete localStorageMock[key];
            },
            clear: () => {
                localStorageMock = {};
            },
            length: Object.keys(localStorageMock).length,
            key: (index: number) => Object.keys(localStorageMock)[index],
        }));
    });

    beforeEach(() => {
        // Reset the mock store and provider before each test
        localStorageMock = {};
        provider = new LocalStorageProvider();
        mockState = createMockState();
    });

    // Test Case 1: writeFile
    test('writeFile should serialize the state and save it to localStorage', async () => {
        await provider.writeFile(filePath, mockState);
        const storedValue = localStorageMock[filePath];
        expect(storedValue).toBeDefined();
        // To avoid issues with Date object serialization, compare specific fields
        const parsedState = JSON.parse(storedValue);
        expect(parsedState.user.id).toEqual(mockState.user.id);
        expect(new Date(parsedState.meta.createdAt)).toEqual(mockState.meta.createdAt);
    });

    // Test Case 2: readFile (Success)
    test('readFile should retrieve and parse the state from localStorage', async () => {
        // Dates are stored as ISO strings in JSON, so we need to handle that for the comparison.
        const stateWithDateAsString = JSON.parse(JSON.stringify(mockState));
        localStorageMock[filePath] = JSON.stringify(stateWithDateAsString);

        const retrievedState = await provider.readFile(filePath);
        expect(retrievedState).toEqual(mockState);
    });

    // Test Case 3: readFile (Not Found)
    test('readFile should throw an error if the file does not exist', async () => {
        await expect(provider.readFile(filePath)).rejects.toThrow('File not found in localStorage');
    });

    // Test Case 4: getManifest
    test('getManifest should return a manifest if the file exists', async () => {
        const now = new Date();
        mockState.meta.createdAt = now;
        localStorageMock[filePath] = JSON.stringify(mockState);

        const manifest = await provider.getManifest(filePath);

        expect(manifest).not.toBeNull();
        if (manifest) {
            expect(manifest.path).toEqual(filePath);
            expect(manifest.size).toBeGreaterThan(0);
            expect(manifest.lastModified.getTime()).toEqual(now.getTime());
        }
    });

    // Test Case 5: getManifest (Not Found)
    test('getManifest should return null if the file does not exist', async () => {
        const manifest = await provider.getManifest(filePath);
        expect(manifest).toBeNull();
    });
});