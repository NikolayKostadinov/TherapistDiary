import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor, tokenRefreshInterceptor } from './features/auth/interceptors';
import { AuthService } from './features/auth/services';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([
            authInterceptor,
            tokenRefreshInterceptor
        ])),
        provideAnimations(),
        provideAppInitializer(() => {
            const authService = inject(AuthService);
            authService.initializeAuth();
        })
    ]
};
