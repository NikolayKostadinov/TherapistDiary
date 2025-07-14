# Common Module

Shared utilities, services, and components used throughout the application. This module contains application-wide functionality that doesn't belong to any specific feature.

## 📁 Structure

```txt
common/
├── services/           # Application-wide services
│   ├── local-storage.service.ts
│   └── index.ts       # Barrel exports
├── directives/        # Reusable directives
├── api-endpoints.ts   # API endpoint constants
├── ui-constants.ts    # UI-related constants
└── index.ts          # Main barrel export
```

## 🔧 Services

### LocalStorageService

A minimal, type-safe wrapper around the browser's localStorage API.

**Location**: `common/services/local-storage.service.ts`

**Features**:

- Type safety with TypeScript
- Clean localStorage wrapper without unnecessary abstractions
- Available application-wide (moved from auth module)
- Direct API without try/catch overhead for simplicity

**Public API**:

```typescript
class LocalStorageService {
  setItem(key: string, value: string): void
  getItem(key: string): string | null
  removeItem(key: string): void
  clear(): void
}
```

**Usage**:

```typescript
import { LocalStorageService } from '../common/services';

@Component({...})
export class MyComponent {
  constructor(private localStorage: LocalStorageService) {}

  saveData(): void {
    this.localStorage.setItem('user-preference', 'dark-mode');
  }

  loadData(): string | null {
    return this.localStorage.getItem('user-preference');
  }

  clearData(): void {
    this.localStorage.removeItem('user-preference');
    // or clear all data
    this.localStorage.clear();
  }
}
```

**When to use**:

- Storing user preferences
- Caching application state
- Persisting form data
- Any client-side data persistence needs

## 📋 Constants

### API Endpoints (`api-endpoints.ts`)

Centralized API endpoint definitions to avoid magic strings throughout the application.

### UI Constants (`ui-constants.ts`)

Common UI-related constants like breakpoints, animation durations, etc.

## 🎯 Design Principles

1. **Minimal Abstractions**: Services provide just enough abstraction without over-engineering
2. **Type Safety**: Full TypeScript support with proper typing
3. **Reusability**: Code that can be used across multiple features
4. **Single Responsibility**: Each service has one clear purpose
5. **No Dependencies**: Common services should not depend on feature-specific code

## 🔄 Migration Notes

- **LocalStorageService** was moved here from `features/auth/services/` to make it available application-wide
- All imports have been updated to use the new location: `'../common/services'`
- The service was simplified by removing unnecessary error handling and debug logging
