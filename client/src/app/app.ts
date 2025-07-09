import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { Footer } from "./layout/footer/footer";
import { TherapistBoard } from "./features/therapists/therapist-board/therapist-board";
import { TherapyTypeBoard } from "./features/therapy-types/therapy-type-board/therapy-type-board";
import { About } from "./features/about/about";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, Footer, TherapistBoard, TherapyTypeBoard, About],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected title = 'therapist-diary';
}
