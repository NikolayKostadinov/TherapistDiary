import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { UserStateService } from "../features/auth";
import { ToasterService } from "../layout";

export const AdminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) => {
    const router = inject(Router);
    const toasterService = inject(ToasterService);
    const userStateService = inject(UserStateService)
    const isAdmin = userStateService.currentUser?.roles?.some(r => r.toLocaleLowerCase() === "administrator");
    toasterService.error('Не сте оторизиран за тази операция!');
    return isAdmin
        ? isAdmin
        : router.navigate(['home']);
} 