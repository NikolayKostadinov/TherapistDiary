# TherapistDiary Client

A modern Angular application for managing therapist practices and client sessions. Built with Angular 19, following clean architecture principles and SOLID design patterns.

## 🏗️ Architecture

The application follows a feature-based modular architecture:

```txt
src/app/
├── common/              # Shared utilities and services
│   ├── services/        # Application-wide services (LocalStorageService)
│   ├── directives/      # Reusable directives
│   └── constants/       # API endpoints, UI constants
├── features/            # Feature modules
│   ├── auth/           # Authentication & authorization (📖 See: src/app/features/auth/README.md)
│   ├── therapists/     # Therapist management
│   ├── therapy-types/  # Therapy type management
│   ├── about/          # About page
│   └── home/           # Landing page
├── layout/             # Layout components
│   ├── header/         # Navigation header
│   ├── footer/         # Site footer
│   ├── carousel/       # Image carousel
│   ├── spinner/        # Loading indicators
│   └── toaster/        # Notification system
└── app.*               # Root application files
```

## 🔐 Authentication

The auth module provides a complete authentication system with:

- **JWT token management** with automatic refresh
- **Reactive state management** using RxJS
- **HTTP interceptors** for auth headers and token refresh
- **Clean service architecture** with constructor DI and TypeScript accessors
- **Type-safe token handling** and user state management

For detailed auth documentation, see [features/auth/README.md](src/app/features/auth/README.md).

## 🛠️ Development

### Prerequisites

- Node.js (LTS version)
- Angular CLI (`npm install -g @angular/cli`)

### Development server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload on file changes.

### Building

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

### Code scaffolding

```bash
# Generate a new component
ng generate component component-name

# Generate a service
ng generate service service-name

# See all available schematics
ng generate --help
```

## 🧪 Testing

### Unit tests

```bash
ng test
```

Runs unit tests with [Karma](https://karma-runner.github.io).

### End-to-end tests

```bash
ng e2e
```

## 📁 Module Documentation

- **[Authentication](src/app/features/auth/README.md)** - Complete auth system documentation
- **[Common Services](src/app/common/README.md)** - Shared utilities and services
- **[Layout](src/app/layout/toaster/README.md)** - UI layout components

## 🔧 Key Features

### Modern Angular Patterns

- **Standalone components** (Angular 19)
- **Constructor dependency injection**
- **TypeScript accessors** instead of getter/setter methods
- **Reactive programming** with RxJS
- **Type-safe development** with strict TypeScript

### Clean Architecture

- **Feature-based organization** with clear boundaries
- **Separation of concerns** in service layers
- **SOLID principles** implementation
- **Minimal, focused services** without unnecessary abstractions

### Developer Experience

- **Comprehensive documentation** for each module
- **TypeScript strict mode** for better code quality
- **Consistent code patterns** across features
- **Clear barrel exports** for clean imports

## 📚 Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Angular Documentation](https://angular.dev/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
