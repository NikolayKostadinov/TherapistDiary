import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private readonly tokenService: TokenService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the access token
        const accessToken = this.tokenService.accessToken;

        // If token exists and this is not a login request, add Authorization header
        if (accessToken && !request.url.includes('/login')) {
            const authRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return next.handle(authRequest);
        }

        return next.handle(request);
    }
}
