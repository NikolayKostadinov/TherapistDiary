# Authentication Services Documentation

## Overview

This directory contains the authentication services for the Therapist Diary application, implementing a simplified 2-service architecture using Angular Signals for reactive state management.

## Architecture

The authentication system is built around two core services:

### 1. AuthService (Main Authentication Logic)

**File**: `auth.service.ts`

The primary authentication service that manages user authentication state using Angular signals.

#### Key Features:

- **Signal-based State**: Uses Angular signals for reactive state management
- **Token Management**: Automatically syncs with localStorage via effects
- **User Information**: Decodes JWT tokens to extract user data
- **Authentication State**: Provides reactive `isLoggedIn` and `currentUser` signals

#### Public API

```typescript
// Read-only computed signals
readonly isLoggedIn: Signal<boolean>
readonly currentUser: Signal<UserInfo | null>  
readonly accessToken: Signal<string | null>

// Authentication methods
login(loginData: LoginRequest): Observable<void>
logout(): void
refreshToken(): Observable<boolean>
```

#### Internal Architecture:

- **Private Signals**: `_accessToken`, `_refreshToken`, `_currentUser`
- **Automatic Sync**: Effects keep localStorage synchronized
- **Token Parsing**: JWT token decoding and user extraction
- **Error Handling**: Token expiration and validation

### 2. AuthHttpService (HTTP Communication)

**File**: `auth-http.service.ts`

Handles all HTTP communication with the authentication API endpoints.

#### Responsibilities

- Login HTTP requests
- Token refresh HTTP requests  
- Error handling and transformation
- Response processing

#### API Methods

```typescript
login(loginData: LoginRequest): Observable<HttpResponse<AuthResponse>>
refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>>
```

## Token Management

### Token Storage Strategy

- **Primary Storage**: localStorage (persistent across sessions)
- **Reactive Sync**: Angular effects automatically sync signals with localStorage
- **Key Constants**: Uses `TOKEN_KEYS` from `../constants/token-keys.ts`

### Token Extraction

Tokens are extracted from HTTP response headers:

- **Access Token**: `Authorization` header (Bearer token) or `X-Access-Token`
- **Refresh Token**: `X-Refresh-Token` header

### Token Lifecycle

1. **Login**: Extract tokens from login response headers
2. **Storage**: Automatically stored in localStorage via effects
3. **Usage**: Access token used for authenticated requests
4. **Refresh**: Automatic token refresh before expiration
5. **Logout**: All tokens cleared from memory and storage

## Signal-Based Architecture Benefits

### Reactive State Management

```typescript
// Components automatically react to auth state changes
isLoggedIn = this.authService.isLoggedIn;
currentUser = this.authService.currentUser;

// No manual subscriptions needed!
```

### Performance Optimization

- **Computed Signals**: Only recalculate when dependencies change
- **Minimal Re-renders**: Components only update when auth state actually changes
- **Memory Efficient**: Automatic cleanup, no subscription management

### Type Safety

- Full TypeScript support with proper typing
- Compile-time error checking
- IntelliSense support

## Usage Examples

### Component Integration

```typescript
import { Component, computed } from '@angular/core';
import { AuthService } from '../auth/services';

@Component({
  template: `
    <div *ngIf="isLoggedIn()">
      Welcome, {{ currentUser()?.username }}!
      <button (click)="logout()">Logout</button>
    </div>
    <div *ngIf="!isLoggedIn()">
      <button (click)="showLogin()">Login</button>
    </div>
  `
})
export class HeaderComponent {
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  
  constructor(private authService: AuthService) {}
  
  logout() {
    this.authService.logout();
  }
}
```

### Service Integration

```typescript
import { AuthService } from '../auth/services';

constructor(private authService: AuthService) {}

async login(credentials: LoginRequest) {
  try {
    await firstValueFrom(this.authService.login(credentials));
    // User is now logged in, UI automatically updates
  } catch (error) {
    // Handle login error
  }
}
```

## Security Considerations

### Token Security

- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh prevents expired token usage
- Immediate logout on token validation failure

### Error Handling

- Network errors handled gracefully
- Invalid tokens trigger automatic logout
- User feedback for authentication failures

## Migration Guide

### From BehaviorSubject to Signals

Old pattern:

```typescript
// ❌ Old BehaviorSubject pattern
this.authService.isLoggedIn$.subscribe(isLoggedIn => {
  this.showUserMenu = isLoggedIn;
});
```

New pattern:

```typescript
// ✅ New Signal pattern  
showUserMenu = computed(() => this.authService.isLoggedIn());
```

### Benefits of Migration

- **No Memory Leaks**: No need to manage subscriptions
- **Better Performance**: Computed signals only update when needed
- **Cleaner Code**: More declarative, less imperative
- **Type Safety**: Better TypeScript integration

## File Structure

```typescript
auth/services/
├── auth.service.ts              # Main authentication service
├── auth-http.service.ts         # HTTP communication service
├── index.ts                     # Service exports
├── README.md                    # This documentation
├── ARCHITECTURE-SUMMARY.md      # Architecture overview
└── AUTH_SERVICES_DOCS.md        # Detailed technical documentation
```

## Dependencies

### Angular Dependencies

- `@angular/core` - Signal primitives, dependency injection
- `@angular/common/http` - HTTP client for API communication

### Third-party Dependencies

- `rxjs` - Observable patterns for HTTP requests
- `jwt-decode` - JWT token parsing and validation

### Internal Dependencies

- `../models` - TypeScript interfaces and types
- `../constants/token-keys` - Token storage key constants
- `../../../common/api-endpoints` - API endpoint definitions


### Bundle Size Impact

- Minimal overhead from signals
- Tree-shaking friendly exports
- No unnecessary dependencies

### Runtime Performance

- Signals provide optimal change detection
- localStorage operations are synchronous but minimal
- HTTP requests properly cached and managed

---

**Last Updated**: July 19, 2025  
**Author**: Nikolay Kostadinov
**Version**: 2.0 (Signal-based Architecture)
