import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserStateService } from '../../features/auth/services/user-state.service';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
    private readonly possibleHomeUri = new Set<string>(['', '/', '/home']);
    private authSubscription?: Subscription;

    isAuthenticated = signal(false);
    isScrolled = false;

    constructor(
        private readonly router: Router,
        private readonly authService: AuthService,
        private readonly userStateService: UserStateService
    ) { }

    ngOnInit(): void {
        // Subscribe to authentication state changes
        this.authSubscription = this.userStateService.isAuthenticated$.subscribe(
            isAuth => this.isAuthenticated.set(isAuth)
        );
    }

    ngOnDestroy(): void {
        // Clean up subscription
        this.authSubscription?.unsubscribe();
    }

    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.isScrolled = scrollTop > 100;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
