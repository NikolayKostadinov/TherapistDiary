# Login Component Documentation

## Преглед

`LoginComponent` е универсален компонент за автентификация, който може да работи както като модал, така и като отделна страница.

## 🎯 Ключови характеристики

### ✨ Dual Mode Support
- **Modal Mode** - Използва се като popup modal в други компоненти
- **Page Mode** - Използва се като отделна login страница

### 🔧 Technical Features
- **Reactive Forms** - Angular reactive forms с валидация
- **Signal-based State** - Модерен Angular signals подход
- **TypeScript Strict** - Пълна типизация и type safety
- **Standalone Component** - Не се нуждае от NgModule
- **Modern Angular Syntax** - Използва новия `@if` синтаксис

### 🎨 UX Features
- **Loading States** - Spinner и disabled state по време на заявка
- **Error Handling** - User-friendly error messages
- **Password Toggle** - Show/hide парола функционалност
- **Keyboard Support** - ESC за затваряне на модал
- **Auto-close** - Автоматично затваряне след успешен login
- **Responsive Design** - Работи на всички устройства

## 📋 API Reference

### Inputs
Няма explicit inputs - компонентът е self-contained.

### Outputs
```typescript
@Output() modalClosed = new EventEmitter<void>();
```

### Public Methods
```typescript
closeModal(): void              // Затваря модала и emit modalClosed
goToRegister(): void           // Навигира към register и затваря модала
togglePasswordVisibility(): void // Toggle show/hide парола
onSubmit(): void               // Submit login форма
```

### Form Controls
```typescript
loginForm: FormGroup = {
    username: string (required, minLength: 3),
    password: string (required, minLength: 6)
}
```

### Signals
```typescript
isLoading = signal(false);     // Loading state за submit бутон
errorMessage = signal('');     // Error message за показване
showPassword = signal(false);  // Password visibility toggle
```

## 🚀 Използване

### Като модал
```html
<!-- В parent component template -->
@if (showLoginModal()) {
    <app-login (modalClosed)="closeLoginModal()"></app-login>
}
```

```typescript
// В parent component
export class ParentComponent {
    showLoginModal = signal(false);
    
    openLoginModal() {
        this.showLoginModal.set(true);
    }
    
    closeLoginModal() {
        this.showLoginModal.set(false);
    }
}
```

### Като страница
```typescript
// В routes configuration
const routes: Routes = [
    { path: 'login', component: LoginComponent }
];
```

## 🎨 Styling

### CSS Classes
- `.modal-backdrop` - Backdrop за модален режим
- `.modal-dialog` - Контейнер за модалното съдържание
- `.modal-content` - Main content wrapper
- `.btn-close` - Close button (X)
- `.submit-wrapper` - Wrapper за submit бутон

### Анимации
- **fadeIn** - Backdrop fade in анимация
- **slideIn** - Modal slide in анимация
- **Hover effects** - Button и input hover states
- **Loading spinner** - Rotating spinner при заявка

### Responsive Breakpoints
```css
@media (max-width: 1360px) { /* Tablet adjustments */ }
@media (max-width: 576px) { /* Mobile adjustments */ }
```

## 🔐 Security Features

### Form Validation
- **Client-side validation** - Immediate feedback
- **Required fields** - Username и password задължителни
- **Min length validation** - Username: 3 chars, Password: 6 chars
- **Error display** - Показва конкретни validation грешки

### Password Security
- **Password masking** - По default паролата е скрита
- **Toggle visibility** - User може да покаже/скрие парола
- **No autocomplete** - Предотвратява browser autocomplete

## 🎭 User Experience

### Loading States
```typescript
// По време на submit:
isLoading.set(true);  // Показва spinner
button.disabled = true; // Disable бутон
```

### Error Handling
```typescript
// При грешка:
errorMessage.set('Invalid credentials'); // Показва error message
isLoading.set(false); // Скрива spinner
```

### Auto-close Behavior
```typescript
// След успешен login:
this.closeModal(); // Затваря модала
this.router.navigate(['/']); // Навигира към home
```

### Keyboard Navigation
- **ESC** - Затваря модала
- **Enter** - Submit форма (native behavior)
- **Tab** - Навигация между полета

## 🔄 Integration Flow

### 1. User Opens Modal
```
User clicks "Login" → Parent calls openLoginModal() 
→ showLoginModal.set(true) → LoginComponent renders
```

### 2. User Submits Form
```
User fills form → onSubmit() → AuthService.login() 
→ Success → closeModal() + navigate → Modal closes
```

### 3. Error Handling
```
Login fails → errorMessage.set() → User sees error 
→ Can retry or close modal
```

### 4. Navigation to Register
```
User clicks "Register" → goToRegister() → closeModal() 
→ router.navigate(['/register'])
```

## 🛠️ Customization

### Styling Customization
```css
/* Override modal size */
.modal-dialog {
    max-width: 600px; /* Default: 450px */
}

/* Custom colors */
.btn-primary {
    --bs-btn-bg: #your-color;
}
```

### Behavior Customization
```typescript
// Disable auto-close after login
onSubmit() {
    // ... login logic
    // Remove: this.closeModal();
}

// Custom validation
this.loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]], // Email validation
    password: ['', [Validators.required, Validators.minLength(8)]] // Stronger password
});
```

## 📦 Dependencies

### Angular Core
- `@angular/core` - Component, signals, EventEmitter
- `@angular/forms` - Reactive forms
- `@angular/router` - Navigation
- `@angular/common` - CommonModule

### Internal Dependencies
- `AuthService` - Authentication logic
- `LoginRequest` - Type definition

### External Libraries
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons

## 🧪 Testing

### Unit Testing Examples
```typescript
describe('LoginComponent', () => {
    it('should emit modalClosed when closeModal is called', () => {
        spyOn(component.modalClosed, 'emit');
        component.closeModal();
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });
    
    it('should navigate to register and close modal', () => {
        spyOn(component, 'closeModal');
        spyOn(router, 'navigate');
        
        component.goToRegister();
        
        expect(component.closeModal).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/register']);
    });
});
```

### E2E Testing
```typescript
// Cypress example
cy.get('[data-cy=login-button]').click();
cy.get('[data-cy=username]').type('testuser');
cy.get('[data-cy=password]').type('testpass');
cy.get('[data-cy=submit]').click();
cy.url().should('eq', '/dashboard');
```

## 🚀 Future Enhancements

### Потенциални подобрения:
- **Remember Me** checkbox functionality
- **Social Login** buttons (Google, Facebook)
- **Password Reset** link integration
- **Multi-factor Authentication** support
- **Biometric Login** (WebAuthn)
- **Auto-complete** optimization
- **Progressive Enhancement** for slow networks

### Accessibility Improvements:
- **ARIA labels** за screen readers
- **Focus management** в модален режим
- **High contrast** mode support
- **Keyboard-only** navigation
- **Voice control** compatibility

## 📋 Best Practices

### Performance:
- Компонентът е standalone за по-добро tree shaking
- Signals намаляват unnecessary re-renders
- Lazy loading на authentication модула

### Security:
- Никога не се съхраняват пароли в component state
- Всички sensitive операции са в AuthService
- Client-side валидация + server-side validation

### Maintainability:
- Separation of concerns - UI logic отделена от business logic
- Type safety с TypeScript
- Clear method naming и documentation
- Minimal dependencies
