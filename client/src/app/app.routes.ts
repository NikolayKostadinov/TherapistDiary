import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { About } from './features/about/about';
import { TherapistBoard } from './features/therapists/therapist-board/therapist-board';
import { TherapyTypeBoard } from './features/therapy-types/therapy-type-board/therapy-type-board';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'about', component: About },
    { path: 'therapists', component: TherapistBoard },
    { path: 'therapy-types', component: TherapyTypeBoard },
];
