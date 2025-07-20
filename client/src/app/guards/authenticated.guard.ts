import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";

export const AuthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.isLoggedIn();

    return isAuthenticated
        ? true
        : router.navigate(['/login']);
}; 