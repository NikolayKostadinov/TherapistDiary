import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";

export const UnauthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    debugger;
    const isAuthenticated = authService.isLoggedIn();
    if (isAuthenticated) {
        router.navigate(['/unauthorized']);
    }
    return !isAuthenticated;
}; 