import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollAnimationDirective } from '../../common/directives';

@Component({
    selector: 'app-page-not-found',
    imports: [RouterLink, ScrollAnimationDirective],
    templateUrl: './page-not-found.html',
    styleUrl: './page-not-found.css'
})
export class PageNotFound {

}
