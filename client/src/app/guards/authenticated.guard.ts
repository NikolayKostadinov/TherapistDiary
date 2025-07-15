import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { UserStateService } from "../features/auth";

export const AuthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const userStateService = inject(UserStateService)
    const isAuthenticated = userStateService.isAuthenticated;
    return isAuthenticated
        ? isAuthenticated
        : router.navigate(['login']);

} 