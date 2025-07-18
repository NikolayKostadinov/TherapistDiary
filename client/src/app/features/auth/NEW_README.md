# 🔐 Authentication Module

> **Modern Angular authentication system with JWT tokens, reactive state management, and automatic token refresh capabilities.**

## 🎯 Overview

The Authentication module provides a complete, production-ready authentication system for the Therapist Diary application. Built with modern Angular patterns, it offers secure JWT token management, reactive user state, and seamless HTTP integration.

### Key Features

- 🔒 **JWT Token Management** - Secure access and refresh token handling
- ⚡ **Reactive State** - RxJS-powered authentication state streams
- 🔄 **Auto Refresh** - Automatic token renewal without user interruption  
- 🛡️ **HTTP Interceptors** - Transparent authentication headers and error handling
- 🏗️ **Clean Architecture** - SOLID principles with clear separation of concerns
- 📱 **Type-Safe** - Full TypeScript support with strict typing

## 🏗️ Architecture

```txt
auth/
├── services/              # Core authentication logic
│   ├── auth.service.ts           # Main orchestration & app integration
│   ├── user-state.service.ts     # Reactive user state management
│   ├── token.service.ts          # JWT token operations & validation
│   ├── token-storage.service.ts  # Response header token extraction
│   └── auth-http.service.ts      # Authentication HTTP requests
├── interceptors/          # HTTP request/response handling
│   ├── auth.interceptor.ts       # Authorization header injection
│   └── token-refresh.interceptor.ts # Automatic token refresh
├── models/               # TypeScript interfaces & types
│   ├── auth-tokens.ts           # Token interfaces
│   ├── user-info.ts             # User data structure
│   ├── login-request.ts         # Login payload
│   ├── auth-response.ts         # Server response
│   └── jwt-payload.ts           # JWT token payload
├── constants/            # Configuration & constants
│   └── token-keys.ts           # Token storage keys
├── login/               # Login UI component
└── index.ts             # Module exports
```

## 🔧 Services Reference

### AuthService
**Role**: Primary authentication orchestrator for application integration

**Core Responsibilities**:
- Initialize authentication state on application startup
- Coordinate login/logout user flows
- Manage token refresh operations
- Bridge between UI components and auth system

**API Signature**:
```typescript
class AuthService {
  // Application lifecycle
  initializeAuthState(): void
  
  // User authentication flows
  login(credentials: LoginRequest): Observable<boolean>
  logout(): void
  
  // Token management
  refreshToken(): Observable<boolean>
}
```

**Usage Examples**:
```typescript
// Application initialization (app.config.ts or main component)
constructor(private authService: AuthService) {
  this.authService.initializeAuthState();
}

// Login component
onLogin(form: LoginRequest): void {
  this.authService.login(form).subscribe({
    next: (success) => {
      if (success) {
        this.router.navigate(['/dashboard']);
        this.toaster.success('Welcome back!');
      }
    },
    error: () => this.toaster.error('Login failed')
  });
}

// Logout anywhere in the app
onLogout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}
```

---

### UserStateService
**Role**: Reactive user authentication state management

**Core Responsibilities**:
- Maintain current authentication status with RxJS streams
- Provide both reactive (Observable) and synchronous access to user data
- Handle user state transitions (login → authenticated → logout)
- Extract and manage user information from JWT tokens

**API Signature**:
```typescript
class UserStateService {
  // Reactive streams (for components)
  readonly isAuthenticated$: Observable<boolean>
  readonly currentUser$: Observable<UserInfo | null>
  
  // Synchronous accessors (for guards, interceptors)
  get isAuthenticated(): boolean
  get currentUser(): UserInfo | null
  
  // State management methods
  setAuthenticated(userInfo?: UserInfo): void
  setUnauthenticated(): void
  updateUserFromToken(): void
  initializeFromStoredTokens(): void
  logout(): void
}
```

**Usage Examples**:
```typescript
// Component reactive UI updates
@Component({...})
export class HeaderComponent {
  isLoggedIn$ = this.userState.isAuthenticated$;
  currentUser$ = this.userState.currentUser$;
  
  constructor(private userState: UserStateService) {}
}

// Route guard synchronous checks
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userState: UserStateService) {}
  
  canActivate(): boolean {
    return this.userState.isAuthenticated;
  }
}

// Access current user data
const user = this.userState.currentUser;
if (user?.roles.includes('admin')) {
  // Show admin features
}
```

---

### TokenService
**Role**: JWT token operations, validation, and storage management

**Core Responsibilities**:
- Store and retrieve access/refresh tokens with TypeScript accessors
- Validate token expiration and integrity
- Extract user information from JWT payload
- Provide token metadata (validity, expiration status)

**API Signature**:
```typescript
class TokenService {
  // Token storage (clean accessor pattern)
  get accessToken(): string | null
  set accessToken(token: string)
  get refreshToken(): string | null
  set refreshToken(token: string)
  
  // Computed properties
  get tokens(): AuthTokens
  get userInfo(): UserInfo | null
  
  // Token validation methods
  hasAccessToken(): boolean
  isTokenExpired(): boolean
  isTokenExpiringSoon(): boolean
  isTokenValid(): boolean
  
  // Utility methods
  clearTokens(): void
  verifyTokenStorage(): void
}
```

**Usage Examples**:
```typescript
// Store tokens (typically from HTTP response)
this.tokenService.accessToken = response.accessToken;
this.tokenService.refreshToken = response.refreshToken;

// Get current tokens
const { accessToken, refreshToken } = this.tokenService.tokens;

// Check token validity before API calls
if (this.tokenService.isTokenValid) {
  return this.http.get('/api/protected-data');
} else {
  return this.authService.refreshToken().pipe(
    switchMap(() => this.http.get('/api/protected-data'))
  );
}

// Extract user info from current token
const userInfo = this.tokenService.userInfo;
console.log(`User: ${userInfo?.username}, Roles: ${userInfo?.roles}`);

// Clear all tokens on logout
this.tokenService.clearTokens();
```

---

### TokenStorageService
**Role**: Extract authentication tokens from HTTP response headers

**Core Responsibilities**:
- Parse authentication tokens from server response headers
- Handle CORS token delivery mechanism
- Store extracted tokens using TokenService

**API Signature**:
```typescript
class TokenStorageService {
  storeTokensFromResponse(response: HttpResponse<AuthResponse>): void
}
```

**Usage Examples**:
```typescript
// In AuthHttpService - after successful login/refresh
login(credentials: LoginRequest): Observable<HttpResponse<AuthResponse>> {
  return this.http.post<AuthResponse>(this.loginUrl, credentials, {
    observe: 'response'
  }).pipe(
    tap(response => {
      // Extract and store tokens from headers
      this.tokenStorageService.storeTokensFromResponse(response);
    })
  );
}
```

---

### AuthHttpService
**Role**: HTTP communication for authentication endpoints

**Core Responsibilities**:
- Execute login and token refresh HTTP requests
- Handle authentication-specific HTTP errors
- Return properly typed Observable responses

**API Signature**:
```typescript
class AuthHttpService {
  login(credentials: LoginRequest): Observable<HttpResponse<AuthResponse>>
  refreshToken(refreshToken: string): Observable<HttpResponse<AuthResponse>>
}
```

**Usage Examples**:
```typescript
// Login request with error handling
this.authHttp.login(credentials).subscribe({
  next: (response) => {
    // Tokens automatically extracted by TokenStorageService
    this.userState.setAuthenticated();
  },
  error: (error) => {
    if (error.status === 401) {
      this.toaster.error('Invalid credentials');
    } else {
      this.toaster.error('Login failed. Please try again.');
    }
  }
});

// Token refresh (typically called by interceptor)
this.authHttp.refreshToken(currentRefreshToken).pipe(
  catchError((error) => {
    this.authService.logout(); // Force logout on refresh failure
    return throwError(error);
  })
);
```

## 🔌 HTTP Interceptors

### AuthInterceptor
**Purpose**: Automatically inject authorization headers into HTTP requests

**Functionality**:
- Adds `Authorization: Bearer {accessToken}` header to outgoing requests
- Only operates when valid access token exists
- Seamlessly integrates with Angular HTTP client

**Configuration**:
```typescript
// In app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### TokenRefreshInterceptor
**Purpose**: Automatically refresh expired tokens and retry failed requests

**Functionality**:
- Intercepts 401 Unauthorized HTTP responses
- Attempts automatic token refresh using refresh token
- Retries original request with new access token
- Handles concurrent refresh requests elegantly
- Forces logout when refresh token is invalid/expired

**Flow Diagram**:
```txt
HTTP Request → 401 Response → Check Refresh Token → 
  ├─ Valid → Refresh Tokens → Retry Request → Success
  └─ Invalid → Force Logout → Redirect to Login
```

## 📊 Data Flow Patterns

### Complete Authentication Flow
```txt
1. User enters credentials in LoginComponent
2. AuthService.login() orchestrates the process
3. AuthHttpService makes HTTP POST to /api/account/login
4. Server returns 200 with tokens in response headers
5. TokenStorageService extracts and stores tokens
6. UserStateService updates authentication state
7. UI components react to isAuthenticated$ stream changes
8. AuthInterceptor adds headers to subsequent requests
```

### Automatic Token Refresh Flow
```txt
1. User makes authenticated API request
2. AuthInterceptor adds Authorization header
3. Server returns 401 (token expired)
4. TokenRefreshInterceptor catches the error
5. Refresh token request sent to server
6. New tokens received and stored
7. Original request retried with new token
8. User continues without interruption
```

### Application Initialization Flow
```txt
1. Application bootstraps
2. AuthService.initializeAuthState() called
3. TokenService checks localStorage for existing tokens
4. If valid tokens found:
   ├─ UserStateService.updateUserFromToken()
   └─ App starts in authenticated state
5. If no/invalid tokens:
   └─ App starts in unauthenticated state
6. Components subscribe to auth state streams
```

## 🎨 Usage Patterns

### Component Integration
```typescript
@Component({
  selector: 'app-header',
  template: `
    <nav>
      @if (isAuthenticated$ | async) {
        <span>Welcome, {{ (currentUser$ | async)?.username }}!</span>
        <button (click)="logout()">Logout</button>
      } @else {
        <a routerLink="/login">Login</a>
      }
    </nav>
  `
})
export class HeaderComponent {
  isAuthenticated$ = this.userState.isAuthenticated$;
  currentUser$ = this.userState.currentUser$;
  
  constructor(
    private authService: AuthService,
    private userState: UserStateService
  ) {}
  
  logout(): void {
    this.authService.logout();
  }
}
```

### Route Protection
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private userState: UserStateService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    if (this.userState.isAuthenticated) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

// In routes configuration
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];
```

### Role-Based Access
```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private userState: UserStateService) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const user = this.userState.currentUser;
    
    return user?.roles.includes(requiredRole) ?? false;
  }
}
```

## 🛡️ Security Considerations

### Token Security
- **Storage**: Tokens stored in localStorage (consider httpOnly cookies for enhanced security)
- **Transmission**: Always use HTTPS in production
- **Expiration**: Access tokens have short lifespan (typically 15-30 minutes)
- **Refresh**: Refresh tokens have longer lifespan (7 days) but are invalidated on logout

### CORS Configuration
Backend must expose token headers:
```typescript
// Server-side CORS configuration
app.use(cors({
  exposedHeaders: ['X-Access-Token', 'X-Refresh-Token']
}));
```

### Error Handling
```typescript
// Comprehensive error handling pattern
this.authService.login(credentials).pipe(
  catchError((error: HttpErrorResponse) => {
    switch (error.status) {
      case 401:
        return throwError(() => new Error('Invalid credentials'));
      case 429:
        return throwError(() => new Error('Too many attempts. Please try later.'));
      case 0:
        return throwError(() => new Error('Network error. Check connection.'));
      default:
        return throwError(() => new Error('Login failed. Please try again.'));
    }
  })
);
```

## ⚙️ Configuration

### Environment Settings
```typescript
// environment.ts
export const environment = {
  apiUrl: 'https://localhost:5000',
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  maxRetryAttempts: 3
};
```

### Token Configuration
```typescript
// constants/token-keys.ts
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'X-Access-Token',
  REFRESH_TOKEN: 'X-Refresh-Token'
} as const;
```

## 🧪 Testing Strategies

### Service Testing
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should login successfully', () => {
    const loginData = { username: 'test', password: 'password' };
    
    service.login(loginData).subscribe(result => {
      expect(result).toBe(true);
    });
    
    const req = httpMock.expectOne('/api/account/login');
    expect(req.request.method).toBe('POST');
    req.flush({}, {
      headers: {
        'X-Access-Token': 'test-token',
        'X-Refresh-Token': 'refresh-token'
      }
    });
  });
});
```

### Component Testing
```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let authService: jasmine.SpyObj<AuthService>;
  
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    });
    
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });
  
  it('should call auth service on login', () => {
    authService.login.and.returnValue(of(true));
    
    component.onLogin({ username: 'test', password: 'pass' });
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'test',
      password: 'pass'
    });
  });
});
```

## 🔄 Migration & Updates

### Recent Refactoring (2025)
This module was comprehensively refactored to implement modern Angular patterns:

**Key Changes**:
- ✅ **Constructor DI**: All services use dependency injection instead of service locator
- ✅ **TypeScript Accessors**: Clean property access replaces getter/setter methods
- ✅ **Simplified APIs**: Removed unnecessary wrapper methods and abstractions
- ✅ **Enhanced Type Safety**: Strict TypeScript throughout with proper interfaces
- ✅ **LocalStorageService Migration**: Moved to `common/services` for app-wide usage

**Breaking Changes**:
```typescript
// OLD (deprecated)
tokenService.getAccessToken()
tokenService.setAccessToken(token)

// NEW (current)
tokenService.accessToken
tokenService.accessToken = token
```

### Dependencies
```json
{
  "@angular/core": "^19.x.x",
  "@angular/common": "^19.x.x",
  "@angular/router": "^19.x.x",
  "rxjs": "^7.x.x"
}
```

---

## 📚 Additional Resources

- [Angular HTTP Interceptors Guide](https://angular.dev/guide/http/interceptors)
- [RxJS Observable Patterns](https://rxjs.dev/guide/observable)
- [JWT Token Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Angular Security Guide](https://angular.dev/guide/security)

**Need help?** Check the inline code documentation or refer to the main project README for architecture overview.
