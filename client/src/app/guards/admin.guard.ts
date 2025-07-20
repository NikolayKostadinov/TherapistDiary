import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../features/auth/services";
import { ToasterService } from "../layout";

export const AdminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const toasterService = inject(ToasterService);
    const authService = inject(AuthService);
    const currentUser = authService.currentUser();
    const isAdmin = currentUser?.roles?.some(r => r.toLowerCase() === "administrator") || false;

    if (!isAdmin) {
        toasterService.error('Не сте оторизиран за тази операция!');
        return router.navigate(['/home']);
    }

    return true;
}; 