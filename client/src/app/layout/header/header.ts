import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header implements OnInit {
    private readonly possibleHomeUri = new Set<string>(['', '/', '/home']);
    isHomePage$!: Observable<boolean>;

    constructor(private readonly router: Router) { }

    ngOnInit(): void {
        this.isHomePage$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map((event: NavigationEnd) => this.possibleHomeUri.has(event.url)),
            startWith(this.possibleHomeUri.has(this.router.url))
        );
    }
}
