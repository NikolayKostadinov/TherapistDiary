# Auth Module - Quick Reference

## 📖 Какво е това?

Auth модулът предоставя пълна автентификация система за Angular приложението с JWT tokens, modals, reactive state management и modern Angular patterns.

## 🚀 Бързо начало

### Основно използване

```typescript
// Login
constructor(private authService: AuthService) {}

login() {
    this.authService.login({ username: 'user', password: 'pass' })
        .subscribe({
            next: () => console.log('Success'),
            error: (err) => console.error(err.message)
        });
}

// Auth state
constructor(private userState: UserStateService) {}

ngOnInit() {
    this.userState.isAuthenticated$.subscribe(isAuth => {
        // React to auth changes
    });
}
```

### Modal Login

```html
<!-- В всеки компонент -->
<button (click)="showLogin = true">Login</button>

@if (showLogin) {
    <app-login (modalClosed)="showLogin = false"></app-login>
}
```

## 📁 Структура

```
auth/
├── login/           # LoginComponent - modular login form
├── services/        # Core auth services (5 services)
├── models/          # TypeScript interfaces и types
├── interceptors/    # HTTP interceptors за auto auth
└── README.md        # Detailed documentation
```

## 🔧 Ключови сервиси

- **AuthService** - Main entry point за auth операции
- **UserStateService** - Global auth state management
- **TokenService** - JWT token handling
- **TokenStorageService** - Secure localStorage operations
- **AuthHttpService** - HTTP auth requests

## ✨ Характеристики

### Login Component
- ✅ Modal или page mode
- ✅ Reactive forms с валидация
- ✅ Modern Angular (signals, @if)
- ✅ Auto-close, ESC support
- ✅ Beautiful animations

### Security
- ✅ JWT token management
- ✅ Auto refresh tokens
- ✅ HTTP interceptors
- ✅ Secure storage
- ✅ Error recovery

### UX
- ✅ Loading states
- ✅ Error messages
- ✅ Responsive design
- ✅ Keyboard support
- ✅ Smooth animations

## 📋 API Overview

### AuthService
```typescript
login(credentials): Observable<void>
logout(): void
refreshToken(): Observable<boolean>
```

### UserStateService
```typescript
isAuthenticated$: Observable<boolean>
userInfo$: Observable<UserInfo | null>
```

### LoginComponent
```typescript
@Output() modalClosed: EventEmitter<void>
closeModal(): void
goToRegister(): void
```

## 🔗 Integration

### Routes
```typescript
{ path: 'login', component: LoginComponent }
```

### Interceptors (app.config.ts)
```typescript
{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
}
```

### Guards
```typescript
{ 
    path: 'protected', 
    canActivate: [AuthGuard],
    component: ProtectedComponent 
}
```

## 📚 Документация

- **[Complete Documentation](./README.md)** - Пълна документация
- **[Services Architecture](./services/README.md)** - Services архитектура
- **[Login Component](./login/README.md)** - Component документация

## 🎯 Best Practices

1. **Използвай AuthService** за всички auth операции
2. **Subscribe to UserStateService** за auth state changes
3. **Use LoginComponent as modal** за най-добър UX
4. **Implement route guards** за защитени страници
5. **Handle errors gracefully** с user-friendly messages

## 🚀 Ready Features

- JWT Authentication ✅
- Modal Login System ✅
- Auto Token Refresh ✅
- Reactive State Management ✅
- Modern Angular Patterns ✅
- Beautiful UI/UX ✅
- Security Best Practices ✅

## 🔮 Extensible

Готово за:
- Social logins
- MFA
- Password reset
- Email verification
- Role-based permissions
- Session management
