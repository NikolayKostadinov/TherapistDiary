import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";
import { switchMap, of } from "rxjs";

export const UnauthenticatedGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.checkAuthenticationAsync().pipe(
        switchMap((isAuthenticated) => {
            if (isAuthenticated) {
                return router.navigate(['/unauthorized'])
                    .then(() => false);
            }
            return of(true);
        })
    );
}; 