# Authentication Services

## Overview

This directory contains a **simplified 2-service architecture** for authentication, built with **Angular Signals** for reactive state management.

## Services

### 1. `AuthService` - Main Authentication Logic

- Signal-based state management (`isLoggedIn`, `currentUser`)
- Token management with automatic localStorage sync
- JWT token parsing and user extraction
- Login, logout, and token refresh functionality

### 2. `AuthHttpService` - HTTP Communication

- Login and token refresh HTTP requests
- Response header token extraction
- Error handling and transformation

## Key Features

- ✅ **Modern Architecture**: Angular 17+ Signals instead of BehaviorSubjects
- ✅ **Simplified**: Reduced from 5 services to 2
- ✅ **Reactive**: Components automatically update when auth state changes
- ✅ **No Subscriptions**: Signal-based reactivity eliminates manual subscription management
- ✅ **Type Safe**: Full TypeScript support with proper typing
- ✅ **Performance**: Computed signals only recalculate when dependencies change

## Documentation Files

- `AUTH_SERVICES_DOCS.md` - Comprehensive technical documentation
- `QUICK_REFERENCE.md` - Quick usage guide and API reference  
- `ARCHITECTURE-SUMMARY.md` - High-level architecture overview
- `README.md` - This overview file

## Usage Example

```typescript
// In component - automatically reactive
isLoggedIn = this.authService.isLoggedIn;
currentUser = this.authService.currentUser;

// Login
await firstValueFrom(this.authService.login(credentials));

// Logout  
this.authService.logout();
```

## Migration Benefits

**Before** (BehaviorSubject pattern):

```typescript
this.authService.isLoggedIn$.subscribe(isLoggedIn => {
  this.showMenu = isLoggedIn;
});
```

**After** (Signal pattern):

```typescript  
showMenu = computed(() => this.authService.isLoggedIn());
```

---

For detailed technical documentation, see `AUTH_SERVICES_DOCS.md`.
