# Toaster Component Usage Guide

## Общ преглед

Toaster компонентът предоставя елегантен начин за показване на тостер съобщения в приложението. Компонентът използва Angular сигнали за реактивно управление на състоянието.

## Използване

### 1. Основно използване с ToasterService

```typescript
import { ToasterService } from './layout/toaster/toaster.service';

constructor(private toasterService: ToasterService) {}

// Показване на различни типове съобщения
showSuccess() {
    this.toasterService.success('Операцията беше успешна!');
}

showError() {
    this.toasterService.error('Възникна грешка!');
}

showWarning() {
    this.toasterService.warning('Внимание! Проверете данните.');
}

showInfo() {
    this.toasterService.info('Информационно съобщение.');
}
```

### 2. Персонализирани настройки

```typescript
// Показване с персонализирана продължителност
this.toasterService.success('Съобщение', 3000); // 3 секунди

// Error съобщение, което не се затваря автоматично
this.toasterService.error('Критична грешка!', 0, false);

// Използване на пълната конфигурация
this.toasterService.show({
    message: 'Персонализирано съобщение',
    type: 'warning',
    duration: 7000,
    autoClose: true
});
```

### 3. Програмно управление

```typescript
// Затваряне на всички съобщения
this.toasterService.clear();

// Премахване на конкретно съобщение (рядко се използва)
// this.toasterService.remove(messageId);
```

## Типове съобщения

- **success**: Зелено - за успешни операции
- **error**: Червено - за грешки и проблеми  
- **warning**: Жълто - за предупреждения
- **info**: Синьо - за информационни съобщения

## Примери от проекта

Тостерът вече е интегриран в следните компоненти:

### TherapyTypeBoard

```typescript
// При грешка в зареждането на данни
this.toasterService.error('Неуспешно зареждане на видовете терапия. Моля, опитайте отново.');
```

### TherapistBoard

```typescript
// При грешка в зареждането на данни
this.toasterService.error('Неуспешно зареждане на терапевтите. Моля, опитайте отново.');
```

## Технически детайли

### Архитектура

- **ToasterService**: Injectable сервис с Angular сигнали
- **Toaster Component**: Standalone компонент за визуализация
- **ToasterModel**: TypeScript интерфейси за типизация

### Характеристики

- ✅ Responsive дизайн
- ✅ Angular Animations за плавни преходи
- ✅ Автоматично затваряне (конфигурируемо)
- ✅ Hover ефекти за по-добра интеракция  
- ✅ Различни продължителности за различните типове
- ✅ Множество съобщения едновременно
- ✅ Font Awesome икони
- ✅ Angular сигнали за перформанс

### Продължителности по подразбиране

- **Success**: 4 секунди (кратко за позитивни действия)
- **Info**: 6 секунди (средно за информация)  
- **Warning**: 8 секунди (по-дълго за внимание)
- **Error**: 10 секунди (най-дълго за важни грешки)

### Анимации

Тостерът използва Angular Animations API за:

- **Entering**: slideInOut анимация при появяване (300ms ease-out)
- **Leaving**: slideInOut анимация при изчезване (300ms ease-in)
- **Състояния**: entering → visible → leaving

### Позициониране

Тостерите се показват в горния десен ъгъл на екрана и се адаптират за мобилни устройства.
