# Auth Services Quick Reference

## Services Overview

### AuthService

Main authentication logic with Signal-based state management

```typescript
// Public signals (read-only)
readonly isLoggedIn: Signal<boolean>
readonly currentUser: Signal<UserInfo | null>  
readonly accessToken: Signal<string | null>

// Methods
login(loginData: LoginRequest): Observable<void>
logout(): void
refreshToken(): Observable<boolean>
```

### AuthHttpService

HTTP communication for auth endpoints

```typescript
login(loginData: LoginRequest): Observable<HttpResponse<AuthResponse>>
refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>>
```

## Usage in Components

```typescript
// Reactive auth state
isLoggedIn = this.authService.isLoggedIn;
currentUser = this.authService.currentUser;

// Login
await firstValueFrom(this.authService.login(credentials));

// Logout
this.authService.logout();
```

## Key Benefits

- ✅ **No subscriptions**: Signals handle reactivity automatically
- ✅ **Performance**: Computed signals only update when needed
- ✅ **Type safe**: Full TypeScript support
- ✅ **Simple**: 2 services instead of 5
- ✅ **Modern**: Angular 17+ Signal architecture

## Token Flow

1. **Login** → Extract from headers → Update signals → Sync localStorage
2. **Auto-refresh** → Before expiration → Update signals  
3. **Logout** → Clear signals → Clear localStorage (via effects)

## Constants

```typescript
// From ../constants/token-keys.ts
TOKEN_KEYS.ACCESS_TOKEN = 'X-Access-Token'
TOKEN_KEYS.REFRESH_TOKEN = 'X-Refresh-Token'
```
