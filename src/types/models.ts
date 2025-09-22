/**
 * @fileoverview This file contains all the foundational TypeScript interfaces
 * and type definitions for the action-intention application.
 */

/**
 * Represents the type of a Location, distinguishing between user-owned and shared.
 */
export type LocationType = 'USER' | 'SHARED';

/**
 * Contains de-normalized data for a Location, used for matching and reconciliation.
 */
export interface LocationMatcher {
    name: string;
    category: string;
    lat?: number;
    lon?: number;
}

/**
 * Represents a physical location within the application.
 */
export interface Location {
    id: string; // uuid
    name: string;
    category: string;
    globalId?: string;
    matcher: LocationMatcher;
    type: LocationType;
    userId?: string;
    createdAt: Date;
}

/**
 * Contains de-normalized data for a Person, used for matching and reconciliation.
 */
export interface PersonMatcher {
    name: string;
    handle?: string; // e.g., email or phone
}

/**
 * Represents a person within the application.
 */
export interface Person {
    id: string; // uuid
    name: string;
    globalId?: string;
    matcher: PersonMatcher;
    userId?: string;
    createdAt: Date;
}

/**
 * A discriminated union representing the target of an Intention.
 * The 'type' field determines the shape of the object.
 */
export type Target =
    | {
    type: 'Location';
    locationId: string; // uuid
}
    | {
    type: 'Proximity';
    personIds: string[]; // array of uuid
    groupIds: string[]; // array of uuid
};

/**
 * Represents a user's intention, such as "Meet Person X at Location Y".
 */
export interface Intention {
    id: string; // uuid
    user: string;
    action: string;
    targets: Target[];
    startTime: Date;
    endTime: Date;
    createdAt: Date;
}

// --- Application State & Metadata ---

/**
 * Represents the top-level user account information.
 */
export interface User {
    id: string;
    name: string;
}

/**
 * Contains metadata about the application state file.
 */
export interface Meta {
    version: number;
    createdAt: Date;
}

/**
 * Represents the entire, serializable state of the application.
 */
export interface ApplicationState {
    locations: Location[];
    people: Person[];
    intentions: Intention[];
    user: User;
    meta: Meta;
}

// Add a dummy export that generates code
export const version = '1.0.0';

