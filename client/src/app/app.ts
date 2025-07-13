import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer, Header, Toaster } from './layout';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, Footer, Toaster],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected title = 'therapist-diary';
}
