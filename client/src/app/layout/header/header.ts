import { Component, HostListener, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { Login } from '../../features/auth';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterLink, RouterLinkActive, Login],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header {
    // Computed signals from AuthService
    isAuthenticated = computed(() => this.authService.isLoggedIn());
    currentUser = computed(() => this.authService.currentUser());
    userName = computed(() => this.authService.currentUser()?.userName || '');
    isAdministrator = computed(() => this.authService.currentUser()?.roles?.includes('Administrator') ?? false);

    // Local signals
    isScrolled = signal(false);
    showLoginModal = signal(false);

    constructor(
        private readonly router: Router,
        private readonly authService: AuthService
    ) { }

    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        // todo: remove directly DOM references if possible
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.isScrolled.set(scrollTop > 100);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    openLoginModal(): void {
        this.showLoginModal.set(true);
    }

    closeLoginModal(): void {
        this.showLoginModal.set(false);
    }
}
