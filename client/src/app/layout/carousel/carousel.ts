import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { ScrollAnimationDirective } from '../../common/directives';
import { CommonModule } from '@angular/common';
import { UserStateService } from '../../features/auth/services/user-state.service';
import { LoginComponent } from '../../features/auth/login/login.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-carousel',
    imports: [ScrollAnimationDirective, CommonModule, LoginComponent],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css'
})
export class Carousel implements OnInit, OnDestroy {
    showLoginModal = signal(false);
    isAuthenticated = signal(false);
    private authSubscription?: Subscription;

    constructor(private readonly userStateService: UserStateService) { }

    ngOnInit(): void {
        this.authSubscription = this.userStateService.isAuthenticated$.subscribe(
            isAuth => this.isAuthenticated.set(isAuth)
        );
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    openLoginModal(): void {
        this.showLoginModal.set(true);
    }

    closeLoginModal(): void {
        this.showLoginModal.set(false);
    }
}
