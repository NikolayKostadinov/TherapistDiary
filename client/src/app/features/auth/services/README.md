# Auth Services

Кратко описание на архитектурата и сервизите в auth модула.

## Архитектура

```
AuthService (координатор)
├── AuthHttpService (HTTP заявки)
├── TokenService (JWT управление)
├── TokenStorageService (localStorage)
└── UserStateService (глобално състояние)
```

## Сервизи

### AuthService
Главен сервиз за автентификация. Координира всички останали сервизи.

```typescript
login(credentials): Observable<void>    // Вход в системата
logout(): void                         // Изход от системата  
refreshToken(): Observable<boolean>    // Обнови токен
```

### AuthHttpService
HTTP комуникация с бекенда.

```typescript
login(credentials): Observable<AuthResponse>
refreshToken(token): Observable<AuthResponse>
```

### TokenService
Управление на JWT токени - декодиране, валидация, извличане на данни.

```typescript
get userInfo(): UserInfo | null        // Данни за потребителя
get accessToken(): string | null       // Access token
get refreshToken(): string | null      // Refresh token
isTokenValid(): boolean               // Валиден ли е токенът
```

### TokenStorageService
Съхранение на токени в localStorage.

```typescript
storeTokensFromResponse(response): void  // Запази токени
clearTokens(): void                     // Изчисти токени
getAccessToken(): string | null         // Вземи access token
getRefreshToken(): string | null        // Вземи refresh token
```

### UserStateService
Глобално състояние на автентификацията (RxJS Observable).

```typescript
isAuthenticated$: Observable<boolean>      // Автентифициран ли е
userInfo$: Observable<UserInfo | null>     // Данни за потребителя
setAuthenticated(user): void              // Задай като автентифициран
setUnauthenticated(): void               // Задай като неавтентифициран
```

## Auth Flow

### Login
```
1. AuthService.login() → 2. AuthHttpService.login() → 3. TokenStorageService.storeTokens() 
→ 4. UserStateService.setAuthenticated() → 5. Компонентите се обновяват
```

### Logout
```
1. AuthService.logout() → 2. TokenService.clearTokens() → 3. UserStateService.setUnauthenticated()
```

### Auto Refresh
```
1. Token изтича → 2. AuthService.refreshToken() → 3. Нови токени → 4. State се обновява
```

## Използване

### В компоненти
```typescript
// Вход
constructor(private authService: AuthService) {}
login() {
    this.authService.login(credentials).subscribe();
}

// Проверка за auth състояние
constructor(private userState: UserStateService) {}
ngOnInit() {
    this.userState.isAuthenticated$.subscribe(isAuth => {
        // Реагирай на промяна в auth статуса
    });
}
```

### HTTP Interceptors
Автоматично добавят Authorization header към заявките.

## Бележки

- Всички сервизи са singleton (providedIn: 'root')
- UserStateService държи текущото състояние с BehaviorSubject
- TokenService работи само с localStorage, не прави HTTP заявки
- AuthService е единствената точка за auth логика в компонентите
