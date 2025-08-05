import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../common/directives';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-carousel',
    imports: [ScrollAnimationDirective, CommonModule, RouterLink],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css'
})
export class Carousel {

}
