# Scroll Animation Directive

## Общ преглед

Заменя WOW.js с модерна Angular directive за scroll-базирани анимации. Използва Angular Animations API и Intersection Observer за оптимална производителност.

## Характеристики

- ✅ **Intersection Observer**: Ефективно детектиране на visibility
- ✅ **Angular Animations**: Нативни анимации без външни библиотеки  
- ✅ **TypeScript**: Пълна типизация и IntelliSense подкрепа
- ✅ **Конфигурируеми анимации**: fadeInUp, fadeInLeft, fadeInRight, fadeIn
- ✅ **Персонализируем timing**: delay и duration
- ✅ **Автоматично почистване**: Без memory leaks

## Използване

### Основен синтаксис

```html
<div appScrollAnimation 
     animationType="fadeInUp" 
     [animationDelay]="200">
    Съдържание
</div>
```

### Параметри

| Параметър | Тип | По подразбиране | Описание |
|-----------|-----|-----------------|----------|
| `animationType` | `'fadeInUp' \| 'fadeInLeft' \| 'fadeInRight' \| 'fadeIn'` | `'fadeInUp'` | Тип на анимацията |
| `animationDelay` | `number` | `0` | Забавяне в милисекунди |
| `animationDuration` | `number` | `600` | Продължителност в милисекунди |

### Примери

#### 1. Заглавие с fadeInUp

```html
<div class="section-title" 
     appScrollAnimation 
     animationType="fadeInUp" 
     [animationDelay]="200">
    <h1>Заглавие</h1>
</div>
```

#### 2. Картинка с fadeInLeft

```html
<div class="image-container" 
     appScrollAnimation 
     animationType="fadeInLeft" 
     [animationDelay]="300">
    <img src="image.jpg" alt="Картинка">
</div>
```

#### 3. Staggered анимации за списъци

```html
@for (item of items; track item.id; let i = $index) {
    <div appScrollAnimation 
         animationType="fadeInUp" 
         [animationDelay]="100 + (i * 100)">
        {{ item.name }}
    </div>
}
```

## Миграция от WOW.js

### Преди (WOW.js)
```html
<div class="wow fadeInUp" data-wow-delay="0.2s">
    Съдържание
</div>
```

### След (Angular Animations)
```html
<div appScrollAnimation 
     animationType="fadeInUp" 
     [animationDelay]="200">
    Съдържание
</div>
```

## Поддържани анимации

### fadeInUp
Елементът се появява отдолу нагоре с fade ефект.

### fadeInLeft  
Елементът се появява отляво надясно с fade ефект.

### fadeInRight
Елементът се появява отдясно наляво с fade ефект.

### fadeIn
Простo fade in без движение.

## Технически детайли

### Intersection Observer настройки
- **threshold**: 0.1 (10% видимост)
- **rootMargin**: '50px' (започва анимацията 50px преди да влезе в view)

### Performance
- Анимациите се стартират само веднъж
- Observer се премахва след стартиране на анимацията
- Автоматично почистване на ресурсите при destroy

### Browser Support
- Всички модерни браузъри
- Intersection Observer е нативно поддържан

## Интеграция в компоненти

За да използвате директивата, импортирайте я в компонента:

```typescript
import { ScrollAnimationDirective } from '../../common/directives';

@Component({
  imports: [ScrollAnimationDirective],
  // ...
})
export class MyComponent {}
```

## Предимства пред WOW.js

1. **Нативни Angular анимации** - Не изискват jQuery
2. **По-добра производителност** - Intersection Observer е оптимизиран
3. **TypeScript подкрепа** - Типизация и автоматично довършване
4. **По-малък bundle size** - Няма нужда от външна библиотека
5. **Лесно разширяване** - Можете да добавите нови типове анимации
