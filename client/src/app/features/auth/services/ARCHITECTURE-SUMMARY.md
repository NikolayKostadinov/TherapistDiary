# Auth Services - 2-Service Architecture Summary

## Services Structure

### 1. `AuthService` (Main Service)

- **Purpose**: Main authentication logic with signal-based state management
- **State Management**: Uses Angular signals for reactive state
- **Token Storage**: Automatically syncs with localStorage via effects
- **Public API**:
  - `isLoggedIn` (computed signal)
  - `currentUser` (computed signal)
  - `login()`, `logout()`, `refreshToken()` methods

**Key Features:**

- Read-only signals: `isLoggedIn` и `currentUser: UserInfo`
- Uses constants from `token-keys.ts`
- Automatic localStorage synchronization
- JWT token parsing and user extraction
- Token expiration handling

### 2. `AuthHttpService` (HTTP Communication)

- **Purpose**: Handles all HTTP requests to auth endpoints
- **Responsibilities**: Login, token refresh HTTP calls
- **Returns**: `Observable<HttpResponse>` with tokens in headers

## Signal-Based Architecture Benefits

1. **Reactive**: Components automatically update when auth state changes
2. **Performance**: Computed signals only recalculate when dependencies change  
3. **Simplified**: No manual subscription management needed
4. **Type Safe**: Full TypeScript support with proper typing

## Usage Example

```typescript
// In components - automatically reactive
isLoggedIn = this.authService.isLoggedIn;
currentUser = this.authService.currentUser;

// No manual subscriptions needed!
```

## Token Flow

1. Login → HTTP call → Extract tokens from headers → Update signals → Sync to localStorage
2. Signals automatically trigger UI updates
3. Effects keep localStorage in sync
4. Token expiration triggers automatic logout

This architecture eliminates the complexity of multiple services while maintaining all functionality with modern Angular patterns.
