/**
 * Interface for storage operations
 */
export interface IStorageService {
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
}
