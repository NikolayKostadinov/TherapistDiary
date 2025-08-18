import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ScrollAnimationDirective } from '../../directives';

@Component({
  selector: 'app-unauthorized',
    imports: [RouterLink, ScrollAnimationDirective],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class Unauthorized {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.location.back();
  }
}
