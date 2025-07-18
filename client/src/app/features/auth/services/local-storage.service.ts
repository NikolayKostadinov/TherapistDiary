import { Injectable } from '@angular/core';
import { IStorageService } from '../interfaces/storage.interface';

/**
 * LocalStorage implementation of storage service
 */
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService implements IStorageService {
    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
}
