import { Component } from '@angular/core';
import { TherapyTypeBoard } from "../therapy-types";
import { About } from "../about/about";
import { TherapistBoard } from "../therapists";

@Component({
  selector: 'app-home',
  imports: [TherapyTypeBoard, About, TherapistBoard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
