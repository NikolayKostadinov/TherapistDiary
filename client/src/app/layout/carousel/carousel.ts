import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../common/directives';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-carousel',
    imports: [ScrollAnimationDirective, CommonModule],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css'
})
export class Carousel {

}
