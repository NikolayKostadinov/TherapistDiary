# Auth Services Architecture

Този документ описва архитектурата и начина на работа на authentication/service слоя в приложението.

## Основни класове

- **AuthHttpService** – Отговаря за HTTP заявките към бекенда (login, refresh). Не пази състояние.
- **TokenService** – Управлява токените (достъп, refresh), декодира ги, валидира ги, пази ги в localStorage.
- **TokenStorageService** – Извлича токените от HTTP отговорите и ги подава към TokenService.
- **UserStateService** – Държи реактивното състояние на текущия потребител и статуса на автентикация (RxJS BehaviorSubject).
- **AuthService** – "Оркестратор". Координира login/logout/refresh, използва всички горни услуги, управлява auth flow-а.

## Взаимодействие между сервизите

```
[AuthService]
   |---> [AuthHttpService] (login/refresh HTTP)
   |---> [TokenStorageService] (съхранява токени)
   |---> [TokenService] (декодира, валидира токени)
   |---> [UserStateService] (държи auth state)
```

- **Login flow:**
  1. AuthService.login() вика AuthHttpService.login()
  2. При успех TokenStorageService.storeTokensFromResponse() съхранява токените
  3. TokenService декодира токена и подава UserInfo
  4. UserStateService.setAuthenticated() обновява състоянието

- **Refresh flow:**
  1. AuthService.refreshToken() вика AuthHttpService.refreshToken()
  2. TokenStorageService обновява токените
  3. UserStateService.updateUserFromToken() обновява потребителя

- **Logout:**
  1. AuthService.logout() чисти токените и auth state

## Пример за използване

```typescript
constructor(private authService: AuthService) {}

login() {
  this.authService.login({ username, password }).subscribe({
    next: () => { /* успех */ },
    error: err => { /* грешка */ }
  });
}

logout() {
  this.authService.logout();
}

// За реактивно следене на статуса:
this.userStateService.isAuthenticated$.subscribe(isAuth => { ... });
```

## Бележки
- Всички услуги са предоставени на root ниво (singleton).
- TokenService не прави HTTP заявки, само работи с localStorage и декодиране.
- UserStateService е "single source of truth" за статуса на потребителя.
- AuthService е единствената точка за auth логика в компонентите.
