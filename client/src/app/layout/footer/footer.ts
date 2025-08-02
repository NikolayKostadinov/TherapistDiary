import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollAnimationDirective } from '../../common/directives';

@Component({
    selector: 'app-footer',
    imports: [ScrollAnimationDirective, RouterLink],
    templateUrl: './footer.html',
    styleUrl: './footer.css'
})
export class Footer {

}
