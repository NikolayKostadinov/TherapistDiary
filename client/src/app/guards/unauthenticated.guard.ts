import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { UserStateService } from "../features/auth";

export const UnauthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const userStateService = inject(UserStateService)
    const isAuthenticated = userStateService.isAuthenticated;
    return !isAuthenticated;

} 