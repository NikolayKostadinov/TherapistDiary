import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { About } from './features/about/about';
import { TherapistBoard } from './features/therapists/therapist-board/therapist-board';
import { TherapyTypeBoard } from './features/therapy-types/therapy-type-board/therapy-type-board';
import { TherapistDetails } from './features/therapists/therapist-details/therapist-details';
import { LoginComponent } from './features/auth/login/login.component';
import { UnauthenticatedGuard } from './guards/unauthenticated.guard';
import { PageNotFound } from './layout/page-not-found/page-not-found';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    /*--------------------------Begin Of Lazy Loading Components-----------------------------*/
    { path: 'home', loadComponent: () => import('./features/home/home').then(c => c.Home) },
    { path: 'about', loadComponent: () => import('./features/about/about').then(c => c.About) },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent), canActivate: [UnauthenticatedGuard] },
    {
        path: 'therapists',
        children: [
            { path: '', loadComponent: () => import('./features/therapists/therapist-board/therapist-board').then(c => c.TherapistBoard) },
            { path: 'details/:id', loadComponent: () => import('./features/therapists/therapist-details/therapist-details').then(c => c.TherapistDetails) }
        ]
    },
    { path: 'therapy-types', loadComponent: () => import('./features/therapy-types/therapy-type-board/therapy-type-board').then(c => c.TherapyTypeBoard) },
    /*--------------------------End Of Lazy Loading Components-----------------------------*/

    { path: '**', component: PageNotFound },
];
