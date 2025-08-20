import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollAnimationDirective } from '../../directives';

@Component({
    selector: 'app-unauthorized',
    imports: [RouterLink, ScrollAnimationDirective],
    templateUrl: './unauthorized.html',
    styleUrl: './unauthorized.css'
})
export class Unauthorized {

}
