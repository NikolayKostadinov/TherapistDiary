# Глобална система за обработка на грешки

## Компоненти

### 1. HTTP Error Interceptor (`error.interceptor.ts`)

Централизира обработката на всички HTTP грешки в приложението.

**Функционалности:**

- Автоматично хваща всички HTTP грешки
- Показва подходящи съобщения на потребителя
- Логва подробна информация за разработчиците
- Обработва различни HTTP статус кодове (400, 401, 403, 404, 409, 422, 5xx)
- Пропуска определени endpoints за собствена обработка на грешки

**Поддържани статус кодове:**

- `0` - Мрежови грешки (няма интернет връзка)
- `400` - Bad Request (валидационни грешки)
- `401` - Unauthorized (обработва се от token refresh interceptor)
- `403` - Forbidden (няма права за достъп)
- `404` - Not Found (ресурсът не е намерен)
- `409` - Conflict (конфликт при обработка)
- `422` - Unprocessable Entity (валидационни грешки)
- `5xx` - Сървърни грешки

### 2. Logging Service (`logging.service.ts`)

Централизирана услуга за логване с различни нива.

**Функционалности:**

- Различни нива на логване (Debug, Info, Warn, Error)
- Специализирано HTTP логване
- Логване на потребителски действия
- Производителни метрики
- Интеграция с външни услуги за логване

**Нива на логване:**

- `Debug (0)` - Детайлна информация за разработка
- `Info (1)` - Обща информация
- `Warn (2)` - Предупреждения
- `Error (3)` - Грешки

## Конфигурация

### app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
    providers: [
        // HTTP Interceptors
        provideHttpClient(withInterceptors([
            authInterceptor,
            tokenRefreshInterceptor,
            errorInterceptor // Задължително последен - обработва всички HTTP грешки
        ]))
    ]
};
```

## Използване

### Автоматично

Системата работи автоматично - не е необходимо да се прави нищо допълнително в компонентите. Всички HTTP грешки и runtime грешки ще бъдат хванати и обработени автоматично.

### Ръчно логване

```typescript
import { LoggingService } from '@common';

constructor(private logger: LoggingService) {}

// Логване на различни нива
this.logger.debug('Debugging information', { data });
this.logger.info('General information', { info });
this.logger.warn('Warning message', { warning });
this.logger.error('Error occurred', error);

// Специализирано логване
this.logger.logUserAction('user_clicked_button', { buttonId: 'save' });
this.logger.logPerformance('data_load', 1500, { recordCount: 100 });
```

### Собствена обработка на грешки

Ако един компонент има нужда от собствена обработка на грешки, може да добави URL-а в `shouldSkipGlobalErrorHandling()` функцията в error interceptor-а.

```typescript
function shouldSkipGlobalErrorHandling(url: string): boolean {
    const skipPatterns = [
        '/login',
        '/register',
        '/refresh-token',
        '/my-custom-endpoint' // Добави тук
    ];
    return skipPatterns.some(pattern => url.includes(pattern));
}
```

## Съобщения за потребители

Системата показва подходящи български съобщения за различните видове грешки:

- **Мрежови грешки**: "Няма интернет връзка. Моля, проверете мрежата си и опитайте отново."
- **Валидационни грешки**: "Невалидни данни: [детайли]"
- **Достъп забранен**: "Нямате права за достъп до този ресурс."
- **Не е намерено**: "[Ресурс] не бяха намерени."
- **Сървърни грешки**: "Вътрешна грешка на сървъра. Моля, опитайте по-късно."

## Интеграция с външни услуги

### Production логване

В production режим, системата може да изпраща грешки към външни услуги чрез LoggingService:

```typescript
// В LoggingService
logHttpError(error: HttpErrorResponse, context: string): void {
    if (environment.production) {
        // Интеграция с Sentry
        // Sentry.captureException({ error, context });
        
        // Интеграция с LogRocket
        // LogRocket.captureException({ error, context });
        
        // Собствена услуга за логване
        // this.http.post('/api/errors', { error, context }).subscribe();
    }
}
```

### Analytics

```typescript
// В LoggingService
private sendToAnalyticsService(action: string, details: any): void {
    // Google Analytics
    // gtag('event', action, details);
    
    // Mixpanel
    // mixpanel.track(action, details);
}
```

## Предимства

1. **Централизирана обработка** - Всички грешки се обработват на едно място
2. **Последователност** - Еднакви съобщения и поведение в цялото приложение
3. **Подобрена UX** - Потребителски съобщения на български език
4. **Подробно логване** - Детайлна техническа информация за разработчиците
5. **Гъвкавост** - Може да се конфигурира за различни среди
6. **Наблюдаемост** - Интеграция с външни услуги за мониторинг

## Бъдещи подобрения

- Интеграция с Sentry за production error tracking
- Retry механизъм за неуспешни заявки
- Офлайн режим с queue за заявки
- Персонализирани съобщения за грешки според контекста
- Dashboard за мониторинг на грешки
