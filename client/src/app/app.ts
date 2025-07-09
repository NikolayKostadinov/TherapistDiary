import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer, Header } from './layout';
import { About, TherapistBoard, TherapyTypeBoard } from './features';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, Footer, TherapistBoard, TherapyTypeBoard, About],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected title = 'therapist-diary';
}
