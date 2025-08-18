import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";
import { switchMap, of } from "rxjs";

export const AuthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.checkAuthenticationAsync().pipe(
        switchMap((isAuthenticated) => {
            if (isAuthenticated) {
                return of(true);
            }

            // Запазваме requested URL за след login
            const returnUrl = state.url;
            authService.setReturnUrl(returnUrl);
            return router.navigate(['/login']).then(() => false);
        })
    );
}; 