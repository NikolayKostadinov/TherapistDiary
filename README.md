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
- **Angular Forms** - reactive forms за валидация

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

### Frontend структура

``` folder structure
client/src/app/
├── common/                 # Споделени компоненти и utilities
│   ├── components/         # Base компоненти и модали
│   ├── constants/         # API endpoints и константи
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   ├── models/          # TypeScript интерфейси
│   ├── pipes/           # Custom pipes
│   └── services/        # Споделени services
├── features/            # Feature модули
│   ├── admin/          # Администраторски панел
│   ├── appointment/    # Управление на часове
│   ├── auth/          # Автентикация
│   ├── home/          # Начална страница
│   ├── profile/       # Потребителски профил
│   ├── therapists/    # Списък и детайли на терапевти
│   └── therapy-types/ # Видове терапии
└── layout/            # Layout компоненти
    ├── header/        # Navigation
    ├── footer/        # Footer
    └── toaster/       # Notification система
```

## Изпълнени изисквания от заданието

### 1. Общи изисквания (30%)

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

### 2. Други изисквания (45%)

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
- `OnDestroy` - за cleanup на subscriptions
- `AfterViewInit` - за работа с DOM

**Pipes:**

- Built-in pipes: `DatePipe`, `CurrencyPipe`
- Custom pipes за форматиране

#### ✅ Route Guards

- **AuthGuard** - предпазва private страници
- **GuestGuard** - пренасочва логнати потребители от login/register
- **RoleGuard** - проверява роли (Admin, Therapist, Patient)

#### ✅ Error Handling

- Global error interceptor
- Form validation
- HTTP error responses
- Loading states

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
- CRUD операции за всички ентити

### 4. Бонуси и допълнителни функционалности

#### ✅ Реализирани бонуси

- **Docker containerization** - backend в Docker
- **File upload** - профилни снимки
- **Real-time updates** - автоматично обновяване на данни
- **Advanced filtering** - филтриране и сортиране
- **Pagination** - страниране на данни
- **Role-based access** - различни роли с различни права
- **JWT authentication** - с refresh tokens
- **Responsive design** - mobile-friendly
- **Loading states** - за по-добър UX
- **Toast notifications** - за обратна връзка

## API Endpoints

### Authentication

- `POST /api/auth/login` - влизане
- `POST /api/auth/register` - регистрация
- `POST /api/auth/refresh` - refresh token

### Appointments

- `GET /api/appointments/patient/{id}` - часове на пациент
- `GET /api/appointments/therapist/{id}` - часове на терапевт
- `POST /api/appointments` - създаване на час
- `DELETE /api/appointments/{id}` - отмяна на час
- `PATCH /api/appointments/{id}/notes` - редактиране на бележки

### Therapists

- `GET /api/therapists` - списък с терапевти
- `GET /api/therapists/{id}` - детайли за терапевт

### Admin

- `GET /api/admin/users` - управление на потребители
- `DELETE /api/admin/users/{id}` - изтриване на потребител

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
- TherapyType 1:N Appointments

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
