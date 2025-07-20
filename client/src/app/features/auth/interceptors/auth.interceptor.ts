import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services';
import { Utils } from '../../../common/utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const accessToken = authService.accessToken();

    if (accessToken && !req.url.includes('/login')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: Utils.getAuthorizationHeader(accessToken)
            }
        });
        return next(authReq);
    }

    return next(req);
};

