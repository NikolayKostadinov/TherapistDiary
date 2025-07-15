import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { About } from './features/about/about';
import { TherapistBoard } from './features/therapists/therapist-board/therapist-board';
import { TherapyTypeBoard } from './features/therapy-types/therapy-type-board/therapy-type-board';
import { TherapistDetails } from './features/therapists/therapist-details/therapist-details';
import { LoginComponent } from './features/auth';
import { PageNotFound } from './layout/page-not-found/page-not-found';
// import { RegisterComponent } from './features/auth/register/register.component';
import { App } from './app';
import { AdminGuard } from './guards/admin.guard';
import { AuthenticatedGuard } from './guards';

export const routes: Routes = [
    {
        path: '', children: [
            { path: 'home', redirectTo: '', pathMatch: 'full' },
            { path: '', component: Home },
            { path: 'about', component: About },
            { path: 'login', component: LoginComponent },
            { path: 'therapists', component: TherapistBoard },
            { path: 'therapists/details/:id', component: TherapistDetails },
            { path: 'therapy-types', component: TherapyTypeBoard },
            { path: '**', component: PageNotFound }
        ]
    }
];
