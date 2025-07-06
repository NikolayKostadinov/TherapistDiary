import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { Footer } from "./layout/footer/footer";
import { TherapistBoard } from "./features/therapists/therapist-board/therapist-board";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, Footer, TherapistBoard],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected title = 'therapist-diary';
}
