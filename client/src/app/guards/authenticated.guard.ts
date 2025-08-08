import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";

export const AuthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.isLoggedIn();

    if (isAuthenticated) {
        return true;
    }

    // Запазваме requested URL за след login
    const returnUrl = state.url;
    localStorage.setItem('returnUrl', returnUrl);

    return router.navigate(['/login']);
}; 