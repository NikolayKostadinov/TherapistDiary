import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";

export const UnauthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const isAuthenticated = authService.isLoggedIn();
    return !isAuthenticated;
}; 