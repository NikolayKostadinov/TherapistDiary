# TherapistDiary - An Angular Project

## Описание на проекта

TherapistDiary е Single Page Application (SPA) разработена с Angular, която представлява система за управление на клиника предлагаща терапевтични услуги. Приложението позволява на пациентите да резервират часове при терапевти, а на терапевтите да управляват своите графици и пациенти.

## Технологии и Framework-и

### Frontend

- **Angular 20** - основния framework
- **TypeScript** - строго типизиран JavaScript
- **RxJS** - reactive programming with observables
- **Bootstrap 5** - CSS framework за стилизиране
- **Font Awesome** - икони
- **Angular Router** - client-side routing
- **Angular Forms** - reactive forms за въвеждане на данни

### Backend

- **ASP.NET Core 9.0** - REST API
- **Entity Framework Core** - ORM
- **SQL Server** - база данни
- **ASP.NET Identity** - authentication & authorization
- **JWT Tokens** - за автентикация
- **Docker** - контейнеризация

## Как да стартирате проекта

### Пререквизити

- **Docker Desktop** - задължително за backend
- **Node.js** (v18+) - за Angular frontend
- **Angular CLI** - за стартиране на frontend

### Стартиране на сървърната част

```bash
cd server
docker compose up -d
```

Това ще стартира:

- SQL Server база данни на порт 1433
- ASP.NET Core API на портове 5000 (HTTP) и 5001 (HTTPS)

### Стартиране на клиентската част

```bash
cd client
npm install
ng serve
```

Клиентът ще бъде достъпен на: `http://localhost:4200`

## Архитектура на проекта

### Frontend структура и архитектурни принципи

Клиентското приложение следва модулна архитектура, основана на Angular 18+ best practices със standalone компоненти и сигнал-базирана реактивност.

#### Основна организация

``` folder structure
client/src/app/
├── common/                                     # Споделена функционалност
│   ├── components/                             # Базови компоненти за наследяване
│   │   ├── base-table.component.ts             # Базов клас за таблици с pagination/sorting
│   │   ├── base-application-form.component.ts  # Базов клас за форми с error handling
│   │   └── confirmation-modal/                 # Modal за потвърждение на действия
│   ├── constants/                              # API endpoints и константи
│   │   └── api-endpoints.ts                    # Централизирани API URLs
│   ├── directives/                             # Custom Angular директиви
│   │   └── scroll-animation.directive.ts       # Scroll-triggered анимации
│   ├── firebase/                               # Firebase configuration и сервиси
│   │   ├── firebase.config.ts                  # Firebase настройки
│   │   └── firebase.service.ts                 # Firebase file upload service
│   ├── interceptors/                           # Общи HTTP interceptors
│   │   └── error.interceptor.ts                # Глобално error handling
│   ├── models/                                 # TypeScript интерфейси и типове
│   │   ├── api-error.model.ts                  # Error response модели
│   │   ├── paged-result.model.ts               # Generic pagination модел
│   │   └── paged-filtered-request.ts           # Request модел за pagination
│   ├── services/                               # Споделени сервиси
│   │   └── logging.service.ts                  # Centralized logging
│   └── utils.ts                                # Utility функции
├── features/                                   # Feature-based модули (standalone)
│   ├── admin/                                  # Администраторски панел
│   │   ├── services/                           # Admin-specific сервиси
│   │   └── user-table/                         # Управление на потребители
│   ├── appointment/                            # Управление на часове
│   │   ├── models/                             # Appointment модели
│   │   ├── services/                           # Appointment сервиси
│   │   ├── appointment-create/                 # Създаване на час
│   │   ├── my-appointments/                    # Часовете на пациента
│   │   ├── therapist-appointments/             # Часовете на терапевта
│   │   └── appointment-time.pipe.ts            # Pipe за форматиране на време
│   ├── auth/                                   # Автентикация
│   │   ├── models/                             # Auth модели (login, register)
│   │   ├── services/                           # Authentication сервиси
│   │   ├── interceptors/                       # Auth-specific interceptors
│   │   │   ├── auth.interceptor.ts             # JWT token injection
│   │   │   └── token-refresh.interceptor.ts    # Automatic token refresh
│   │   ├── login/                              # Login компонент
│   │   └── register/                           # Registration компонент
│   ├── home/                                   # Начална страница
│   ├── profile/                                # Потребителски профил
│   │   ├── services/                           # Profile сервиси
│   │   ├── profile/                            # Преглед на профил
│   │   ├── profile-edit/                       # Редактиране на профил
│   │   └── profile-change-password/            # Смяна на парола
│   ├── therapists/                             # Терапевти модул
│   │   ├── models/                             # Therapist модели
│   │   ├── services/                           # Therapist сервиси
│   │   ├── therapist-board/                    # Списък с терапевти (catalog)
│   │   ├── therapist-details/                  # Детайли за терапевт
│   │   └── therapist-item/                     # Единичен терапевт компонент
│   └── therapy-types/                          # Видове терапии
│       ├── therapy-type-board/                 # Списък с терапии
│       └── therapy-type-item/                  # Единична терапия
├── guards/                                     # Route Guards
│   ├── authenticated.guard.ts                  # Защита на private страници
│   ├── unauthenticated.guard.ts                # Пренасочване от login/register
│   └── admin.guard.ts                          # Само за администратори
└── layout/                                     # Layout компоненти
    ├── header/                                 # Navigation и меню
    ├── footer/                                 # Footer
    ├── carousel/                               # Image carousel за home page
    ├── spinner/                                # Loading spinner
    ├── pager/                                  # Pagination компонент
    ├── toaster/                                # Toast notification система
    └── page-not-found/                         # 404 страница
```

#### Архитектурни модели и принципи

##### 1. Feature-Based Architecture

- Всеки feature е самостоятелен модул със собствени компоненти, сервиси и модели
- Standalone компоненти без NgModules за по-добра tree-shaking оптимизация
- Lazy loading за всички основни пътища (routes)

##### 2. Reactive Architecture с Angular Signals

- Сигнал-базирано state management вместо традиционен RxJS за UI state
- Computed values за derived state
- Signal-based forms за реактивни форми

##### 3. Base Classes за Code Reuse

- `BaseTableComponent<T>` - generic базов клас за всички таблици
  - Pagination, sorting, filtering логика
  - Loading states, error handling
  - Модални диалози за потвърждение
- `BaseApplicationFormComponent` - базов клас за форми
  - Server-side error handling
  - Loading states
  - Form validation интеграция

##### 4. Centralized Configuration

- API endpoints в `constants/api-endpoints.ts`
- Firebase configuration в `common/firebase/firebase.config.ts` за file uploads
- Environment-based конфигурация
- Type-safe константи и enums

##### 5. HTTP Interceptor Chain

- **Auth Interceptor** (`features/auth/interceptors/auth.interceptor.ts`) - автоматично добавяне на JWT tokens
- **Token Refresh Interceptor** (`features/auth/interceptors/token-refresh.interceptor.ts`) - автоматично обновяване на изтекли токени  
- **Error Interceptor** (`common/interceptors/error.interceptor.ts`) - глобално error handling и toast notifications

##### 6. Route Protection Strategy

- Guard-based route protection на различни нива
- Role-based access control
- Automatic redirects базирани на authentication status

#### Ключови технически решения

**Signal-Based State Management:**

```typescript
// Пример от BaseTableComponent
protected pagedList = signal<PagedResult<T> | null>(null);
protected isLoading = signal<boolean>(false);
protected currentPage = signal(1);

// Computed values
public hasData = computed(() => {
    const list = this.pagedList();
    return list && list.items.length > 0;
});
```

**Generic Base Classes:**

```typescript
// Наследяване за конкретни таблици
export class MyAppointmentsTable extends BaseTableComponent<MyAppointmentModel> {
    // Само специфична логика, базовата е наследена
    protected loadDataFromService(request: PagedFilteredRequest): Observable<HttpResponse<PagedResult<MyAppointmentModel>>> {
        return this.appointmentService.getMyAppointments(this.patientId(), request);
    }
}
```

**Lazy Loading Strategy:**

```typescript
// Route-based lazy loading
{ path: 'therapists', children: [
    { path: '', loadComponent: () => import('./features/therapists/therapist-board/therapist-board').then(c => c.TherapistBoard) },
    { path: 'details/:id', loadComponent: () => import('./features/therapists/therapist-details/therapist-details').then(c => c.TherapistDetails) }
]}
```

Тази архитектура осигурява:

- **Maintainability** - модулна организация и код reuse
- **Performance** - lazy loading и tree-shaking
- **Type Safety** - строго типизиран TypeScript код
- **Developer Experience** - convention-over-configuration подход
- **Scalability** - лесно добавяне на нови features без промени в съществуващия код

## Изпълнени изисквания от заданието

### 1. Общи изисквания

#### ✅ Поне 4 различни динамични страници

1. **Home** - показва статистики и последни часове
2. **Therapists Catalog** - списък с всички терапевти
3. **My Appointments** - моите часове (за пациенти)
4. **Therapist Appointments** - часове на терапевт (за терапевти)
5. **Admin Panel** - управление на потребители (за админи)

#### ✅ Задължителни изгледи

- **Catalog** - `/therapists` (списък с терапевти)
- **Details** - `/therapists/details/:id` (детайли за терапевт)

#### ✅ CRUD операции

- **Appointments** колекция с пълни CRUD операции:
  - Create: Създаване на нов час
  - Read: Преглед на часове
  - Update: Редактиране на бележки
  - Delete: Отмяна на час

#### ✅ Технически изисквания

- ✅ Angular frontend
- ✅ REST API комуникация
- ✅ Client-side routing (8+ рута с параметри)
- ✅ GitHub repository с meaningful commits
- ✅ TypeScript с конкретни типове (без "any")

### 2. Други изисквания

#### ✅ Angular специфични концепции

**TypeScript интерфейси (2+):**

```typescript
// Примери от проекта
interface MyAppointmentModel {
    id: string;
    therapistFullName: string;
    therapyName: string;
    date: string;
    start: string;
    end: string;
    notes?: string;
}

interface PagedResult<T> {
    items: T[];
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
```

**Observables и RxJS оператори (2+):**

```typescript
// Примери от services
this.httpClient.get<PagedResult<MyAppointmentModel>>(url)
    .pipe(
        map(response => response.body),
        catchError(this.handleError),
        tap(data => console.log('Data loaded'))
    );
```

**Lifecycle hooks:**

- `OnInit` - за инициализация на компоненти
- `AfterViewInit` - за работа с DOM

**Modern Subscription Management:**

- Вместо да използвам OnDestroy съм използвал - `DestroyRef` + `takeUntilDestroyed()` - Angular 16+ модерен подход за automatic cleanup на subscriptions без `OnDestroy`
- Предимства пред традиционния OnDestroy подход:
По-малко boilerplate код - не се налага да implement-ваме OnDestroy интерфейс
Автоматично cleanup - Angular автоматично прави unsubscribe когато компонентът бъде унищожен
Type safety - по-добра интеграция с TypeScript
Functional reactive style - вписва се в модерния Angular стил с inject() и signal

**Pipes:**

- Built-in pipes: `DatePipe`
- Custom pipe: `appointment-time.pipe.ts` за форматиране на време на часове

#### ✅ Route Guards

- **AuthGuard** - предпазва private страници
- **GuestGuard** - пренасочва логнати потребители от login/register
- **RoleGuard** - проверява роли (Admin, Therapist, Patient)

#### ✅ Loading States & UX

- **Signal-based loading management** - използване на Angular signals за reactive loading states
- **BaseTableComponent loading** - `isLoading` signal в базовия клас за таблици
- **Profile Service loading** - централизирано управление на loading states
- **Component-specific loading** - `isUploading` за file uploads, form submissions
- **Multiple loading indicators**:
  - `<app-spinner />` - за цели компоненти/страници
  - `fas fa-spinner fa-spin` - за бутони (Font Awesome)
  - `spinner-border` - за малки бутони (Bootstrap)
- **Button state management** - автоматично disable на бутони по време на операции

#### ✅ Error Handling

- Global error interceptor
- Form validation
- HTTP error responses

#### ✅ Component Styling

- Bootstrap 5 CSS framework
- Custom CSS файлове
- Responsive design

### 3. Функционалности

#### Публична част (без автентикация)

- Начална страница с информация
- Списък с терапевти
- Детайли за терапевт
- Login/Register форми

#### Частна част (за регистрирани потребители)

**За пациенти:**

- Резервиране на часове
- Преглед на моите часове
- Редактиране на бележки
- Отмяна на часове
- Управление на профил

**За терапевти:**

- Преглед на часове на пациенти
- Добавяне на терапевтични бележки
- Управление на профил
- Преглед на график

**За администратори:**

- Управление на потребители
- Преглед на всички данни

### 4. Бонуси и допълнителни функционалности

#### ✅ Реализирани бонуси

- **Docker containerization** - backend в Docker
- **Angular Animations** - scroll animations и toast notifications
- **File upload** - профилни снимки (Firestore)
- **Advanced filtering** - филтриране и сортиране
- **Pagination** - страниране на данни
- **Role-based access** - различни роли с различни права
- **JWT authentication** - с refresh tokens (виж [детайлно описание на архитектурата](./AUTHENTICATION.md))
- **Responsive design** - mobile-friendly
- **Loading states** - за по-добър UX
- **Toast notifications** - за обратна връзка

## API Endpoints

### Account (Authentication & User Management)

- `POST /api/account/login` - влизане в системата
- `POST /api/account` - регистрация на нов потребител
- `POST /api/account/refresh` - обновяване на JWT token
- `GET /api/account` - списък на всички потребители (само Admin)
- `GET /api/account/{id}` - детайли за потребител по ID
- `PUT /api/account/{id}` - обновяване на потребител
- `DELETE /api/account/{id}` - изтриване на потребител
- `PATCH /api/account/change-password/{id}` - смяна на парола
- `PATCH /api/account/add-role/{id}/{role}` - добавяне на роля (само Admin)
- `PATCH /api/account/remove-role/{id}/{role}` - премахване на роля (само Admin)

### Appointments

- `GET /api/appointments/{therapistId}/{date}` - налични часове за терапевт на дата
- `GET /api/appointments/by-patient` - часове на пациент (с query параметри)
- `GET /api/appointments/by-therapist` - часове на терапевт (с query параметри)
- `POST /api/appointments` - създаване на нов час
- `DELETE /api/appointments/{id}` - отмяна на час
- `PATCH /api/appointments/{id}/notes` - редактиране на бележки на пациент
- `PATCH /api/appointments/{id}/therapist-notes` - добавяне на терапевтични бележки (само Therapist)

### Therapists

- `GET /api/therapists` - списък с всички терапевти
- `GET /api/therapists/{id}` - детайли за конкретен терапевт

### Therapy Types

- `GET /api/therapytype` - списък с всички типаве терапии и видове терапии които включват

## База данни

### Основни ентити

- **Users** (AspNetUsers) - потребители с роли
- **Appointments** - часове
- **TherapyTypes** - видове терапии
- **Patients** - пациенти (extending User)
- **Therapists** - терапевти (extending User)

### Връзки

- User 1:N Appointments (като Patient)
- User 1:N Appointments (като Therapist)
- Therapies 1:N Appointments

## Deployment

Проектът може да бъде deployed в cloud среда:

- Frontend: Vercel, Netlify, Azure Static Web Apps
- Backend: Azure App Service, AWS, Heroku
- Database: Azure SQL, AWS RDS

## Как да тествате функционалностите

1. **Регистрация и влизане**
2. **Преглед на терапевти** (публично достъпно)
3. **Резервиране на час** (изисква влизане)
4. **Управление на часове** (различно за пациенти и терапевти)
5. **Администраторски панел** (само за admin роля)
   Влезте с потребител Administrator паролата на всички заредени акаунти е стандартна и ще бъде приложена в анкетата.
