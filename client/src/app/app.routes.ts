import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { About } from './features/about/about';
import { TherapistBoard } from './features/therapists/therapist-board/therapist-board';
import { TherapyTypeBoard } from './features/therapy-types/therapy-type-board/therapy-type-board';
import { TherapistDetails } from './features/therapists/therapist-details/therapist-details';
import { LoginComponent } from './features/auth';
// import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'about', component: About },
    { path: 'login', component: LoginComponent },
    // { path: 'register', component: RegisterComponent },
    {
        path: 'therapists', children: [
            { path: '', component: TherapistBoard },
            { path: 'details/:id', component: TherapistDetails }
        ]
    },
    { path: 'therapy-types', component: TherapyTypeBoard }
];
