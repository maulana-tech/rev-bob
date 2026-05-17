import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * useState with sessionStorage persistence
 * Data persists across tab switches but cleared on tab close
 */
export function useSessionState<T>(
    key: string,
    initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
    // Generate storage key based on graph signature
    const storageKey = `rev-bob-${key}`;

    // Initialize state from sessionStorage or initial value
    const [state, setState] = useState<T>(() => {
        try {
            const item = sessionStorage.getItem(storageKey);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Failed to load ${key} from sessionStorage:`, error);
            return initialValue;
        }
    });

    // Sync state to sessionStorage whenever it changes
    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            console.warn(`Failed to save ${key} to sessionStorage:`, error);
        }
    }, [key, state, storageKey]);

    return [state, setState];
}

/**
 * Clear all Rev BOB session data
 */
export function clearSessionData() {
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith('rev-bob-'));
    keys.forEach(key => sessionStorage.removeItem(key));
}
