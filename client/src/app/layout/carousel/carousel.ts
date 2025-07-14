import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../common/directives';
import { CommonModule } from '@angular/common';
import { UserStateService } from '../../features/auth/services/user-state.service';

@Component({
    selector: 'app-carousel',
    imports: [ScrollAnimationDirective, CommonModule],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css'
})
export class Carousel {
    constructor(private readonly userStateService: UserStateService) { }
}
