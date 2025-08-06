# Authentication Architecture - TherapistDiary

## Обзор на архитектурата

TherapistDiary използва модерна JWT-базирана автентикация с автоматично обновяване на токени и multi-layered security подход.

## Технологичен Stack

### Frontend

- **Angular 20** - модерна standalone architecture
- **JWT Tokens** - Access + Refresh token pattern
- **HTTP Interceptors** - автоматично token injection и refresh
- **Angular Signals** - reactive state management за authentication
- **Route Guards** - role-based access control

### Backend

- **ASP.NET Core 9.0** - Identity framework
- **JWT Bearer Authentication** - статично и динамично token validation
- **Role-based Authorization** - Patient, Therapist, Administrator роли
- **SQL Server** - AspNetUsers, AspNetRoles, AspNetUserRoles табели

## Frontend Authentication Architecture

### 1. Authentication Service

**Основни функционалности:**

- Login/Logout операции
- Автоматично token refresh
- Signal-based reactive state
- User роли и permissions

```typescript
export class AuthService {
    // Reactive state с Angular Signals
    private _user = signal<LoginModel | null>(null);
    private _accessToken = signal<string | null>(null);
    
    // Public computed values
    public readonly user = computed(() => this._user());
    public readonly isAuthenticated = computed(() => !!this._accessToken());
    public readonly userRoles = computed(() => this._user()?.roles || []);
    
    // Role checking methods
    public isInRole(role: string): boolean;
    public hasRole(roles: string[]): boolean;
}
```

**Предимства на signal-based подходa:**

- Реактивни updates в цялото приложение
- По-добра performance от традиционен BehaviorSubject
- Type-safe state management
- Автоматично change detection

### 2. HTTP Interceptor Chain

Реализиран е sophisticated interceptor chain за authentication:

#### Auth Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const accessToken = authService.accessToken();

    if (accessToken && !req.url.includes('/login')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: Utils.getAuthorizationHeader(accessToken)
            }
        });
        return next(authReq);
    }

    return next(req);
};
```

**Функционалности:**

- Автоматично добавяне на Authorization header
- Избягване на циклични заявки (login endpoint)
- Използване на modern functional interceptors

#### Token Refresh Interceptor

```typescript
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !Utils.isPublicUrl(req.url)) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};
```

**Ключови features:**

- **Intelligent 401 handling** - само за private endpoints
- **Concurrent request management** - избягване на множествени refresh заявки
- **Shared refresh state** - използване на signals за координация
- **Graceful error handling** - разграничаване между auth и server грешки

**Concurrent Request Management:**

```typescript
// Shared state за refresh процеса
const isRefreshing = signal<boolean>(false);
const refreshTokenSubject = new Subject<boolean | null>();

function handle401Error(request, next, authService) {
    if (!isRefreshing()) {
        // Започваме refresh процес
        isRefreshing.set(true);
        return authService.refreshToken().pipe(/* ... */);
    } else {
        // Чакаме завършване на текущия refresh
        return refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(success => /* retry request */)
        );
    }
}
```

### 3. Route Protection Strategy

Реализирани са три нива на protection:

#### Authenticated Guard

```typescript
export const authenticatedGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (authService.isAuthenticated()) {
        return true;
    }
    
    router.navigate(['/login']);
    return false;
};
```

#### Unauthenticated Guard (Guest Guard)

```typescript
export const unauthenticatedGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthenticated()) {
        return true;
    }
    
    router.navigate(['/']);
    return false;
};
```

#### Admin Guard

```typescript
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (authService.isInRole('Administrator')) {
        return true;
    }
    
    router.navigate(['/']);
    return false;
};
```

### 4. Token Management Strategy

**Access Token:**

- Short-lived (15 минути)
- JWT формат с embedded claims
- Съхранява се в memory (signal) и Local Storage
- Автоматично се инжектира в HTTP заявки

**Refresh Token:**

- Long-lived (7 дни)  
- Secure storage в localStorage
- HttpOnly cookies за production (препоръка)
- Използва се за получаване на нови access tokens

**Token Refresh Flow:**

1. HTTP заявка връща 401 Unauthorized
2. Token Refresh Interceptor го прихваща
3. Автоматично се извиква refresh endpoint
4. Нов access token се получава и запазва
5. Оригиналната заявка се retry-ва с новия token
6. Concurrent заявки чакат refresh-а да завърши

## Backend Authentication Architecture

### 1. ASP.NET Core Identity Integration

```csharp
// Program.cs - Authentication configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
```

### 2. User Roles Architecture

**Три основни роли:**

- **Patient** - може да резервира часове, управлява профил
- **Therapist** - управление на часове на пациенти, добавяне на бележки
- **Administrator** - пълни CRUD права върху всички ентити

**Role-based Authorization:**

```csharp
[HttpDelete("{id}")]
[Authorize(Roles = "Administrator")]
public async Task<IActionResult> DeleteUser(string id)
{
    // Само админите могат да изтриват потребители
}

[HttpPatch("{id}/therapist-notes")]
[Authorize(Roles = "Therapist")]
public async Task<IActionResult> AddTherapistNotes(string id, [FromBody] string notes)
{
    // Само терапевтите могат да добавят терапевтични бележки
}
```

### 3. JWT Token Structure

**Access Token Claims:**

```json
{
    "sub": "user-id",
    "email": "user@example.com",
    "name": "Full Name",
    "role": ["Patient", "Therapist"],
    "iat": 1640995200,
    "exp": 1640999200
}
```

**Refresh Token:**

- Cryptographically secure random string
- Mapped към потребител в базата данни
- Ротация при всеки refresh (за security)

## Security Features

### 1. Token Security

- **Short access token lifetime** - минимизира exposure window
- **Automatic token rotation** - refresh tokens се ротират
- **Secure storage considerations** - memory vs localStorage vs cookies

### 2. Request Security  

- **HTTPS enforcement** - в production среда
- **CORS configuration** - ограничени origins
- **Rate limiting** - защита от brute force атаки

### 3. Error Handling

- **Graceful degradation** - smooth logout при auth грешки
- **No sensitive data exposure** - generic error messages
- **Audit logging** - track authentication events

## Frontend-Backend Integration

### Authentication Flow

1. **Login Process:**

   **Стъпка 1: User Input**
   - Потребител въвежда username и парола в login формата
   - Angular reactive form валидира входните данни

   **Стъпка 2: Form Submission**
   - При submit се извиква `AuthService.login(email, password)`
   - Създава се `LoginRequest` обект с credentials
  
   **Стъпка 3: HTTP Request**
   - AuthService прави HTTP POST заявка към `/api/account/login`
   - Backend валидира credentials срещу AspNetUsers таблата

   **Стъпка 4: JWT Response**
   - При успех: Backend връща `{ accessToken, refreshToken, user }`
   - При грешка: 401 Unauthorized с error message

   **Стъпка 5: Token Storage**
   - Access token се запазва в memory чрез `_accessToken.set(token)`
   - Refresh token се запазва в localStorage
   - User data се запазва в `_user.set(userInfo)`

   **Стъпка 6: UI Reactivity**
   - Angular signals автоматично trigger-ват UI updates
   - Header показва user menu
   - Route guards позволяват достъп до protected страници
   - Redirect към home page или requested URL

2. **Protected Resource Access:**

   **Стъпка 1: HTTP Request Initiation**
   - Компонент прави заявка към защитен endpoint (напр. `appointmentService.getMyAppointments()`)
   - Angular HttpClient създава HTTP request обект

   **Стъпка 2: Auth Interceptor Processing**
   - `authInterceptor` автоматично прихваща заявката
   - Проверява дали има валиден access token в `authService.accessToken()`
   - Клонира request-а и добавя `Authorization: Bearer <token>` header

   **Стъпка 3: Backend Validation**
   - ASP.NET Core получава заявката с JWT token
   - JWT middleware валидира token signature и expiration
   - Извлича user claims (роли, ID) от токена
   - `[Authorize]` attribute проверява permissions

   **Стъпка 4: Response Processing**
   - При успех: Backend връща requested data
   - При липса на права: 403 Forbidden
   - При невалиден token: 401 Unauthorized

   **Стъпка 5: Component Update**
   - Successful response се връща в Angular service
   - Data се преобразува чрез RxJS operators
   - Component получава данните и обновява UI чрез signals

3. **Token Refresh Process:**

   **Стъпка 1: 401 Error Detection**
   - HTTP заявка към protected endpoint върнала 401 Unauthorized
   - `tokenRefreshInterceptor` прихваща грешката чрез `catchError`
   - Проверява че URL-ът не е public (`!Utils.isPublicUrl(req.url)`)

   **Стъпка 2: Refresh State Management**
   - Проверява дали refresh процес вече е започнат (`isRefreshing` signal)
   - Ако не: задава `isRefreshing.set(true)` и започва refresh
   - Ако да: изчаква завършване чрез `refreshTokenSubject`

   **Стъпка 3: Refresh API Call**
   - Извиква `authService.refreshToken()` с текущия refresh token
   - Прави HTTP POST към `/api/account/refresh`
   - Backend валидира refresh token срещу базата данни

   **Стъпка 4: New Token Processing**
   - При успех: получава нов access token
   - Запазва го в memory чрез `_accessToken.set(newToken)`
   - Задава `isRefreshing.set(false)` и уведомява чакащите заявки

   **Стъпка 5: Request Retry**
   - Клонира оригиналната заявка с новия token
   - Retry-ва заявката автоматично
   - Връща резултата в първоначалния component

   **Стъпка 6: Error Handling**
   - При неуспешен refresh: прави `authService.logout()`
   - Пренасочва към login page
   - Показва подходящо error message

4. **Logout Process:**

   **Стъпка 1: User Action**
   - Потребител кликва "Изход" бутон в header навигацията
   - Component извиква `authService.logout()` метод

   **Стъпка 2: Token Cleanup**
   - Изчиства access token: `_accessToken.set(null)`
   - Премахва refresh token от localStorage: `localStorage.removeItem('refreshToken')`
   - Изчиства user data: `_user.set(null)`

   **Стъпка 3: Signal Reset**
   - Всички auth-related signals се reset-ват към default стойности
   - `isAuthenticated()` computed signal става `false`
   - `userRoles()` computed signal става празен масив

   **Стъпка 4: UI Reactivity**
   - Angular автоматично детектира signal промените
   - Header навигацията се променя от authenticated към guest mode
   - Protected menu items изчезват от UI

   **Стъпка 5: Router Navigation**
   - Автоматично пренасочване към public route (обикновено `/`)
   - Route guards блокират достъп до protected страници
   - Toast notification за успешен logout (опционално)

   **Стъпка 6: Server Notification** (опционално)
   - Може да се добави HTTP POST към `/api/account/logout`
   - Сървърът invalidate-ва refresh token в базата данни
   - Допълнителна security мярка за session management

## Benefits на тази архитектура

### Security Benefits

- **Zero trust model** - всяка заявка се валидира
- **Minimal token lifetime** - намален risk window  
- **Automatic token management** - no manual handling
- **Role-based granular access** - fine-grained permissions

### Developer Experience

- **Transparent authentication** - автоматично за всички заявки
- **Type-safe state** - TypeScript + Angular signals
- **Reactive UI updates** - автоматично re-rendering
- **Clean separation of concerns** - service + interceptors + guards

### User Experience

- **Seamless login/logout** - smooth transitions
- **No manual token refresh** - transparent за потребителя
- **Persistent sessions** - refresh tokens поддържат сесията
- **Immediate security** - logout при грешки

## Performance Considerations

### Frontend Optimizations

- **Signal-based reactivity** - efficient change detection
- **Memory-only access tokens** - no localStorage overhead
- **Concurrent request deduplication** - един refresh за всички заявки
- **Lazy loading** - auth guards не блокират initial load

### Backend Optimizations  

- **Stateless JWT validation** - no database lookups за access tokens
- **Efficient role checking** - claims-based authorization
- **Connection pooling** - optimized database connections
- **Caching strategies** - user data caching

Тази архитектура представлява modern, secure и maintainable authentication система, която използва най-новите Angular и .NET Core best practices.
