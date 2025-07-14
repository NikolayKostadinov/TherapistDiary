import { Injectable } from '@angular/core';

/**
 * Service for type-safe localStorage operations
 */
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}
