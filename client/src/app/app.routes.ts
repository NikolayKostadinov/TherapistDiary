import { Routes } from '@angular/router';
import { Login as Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { UnauthenticatedGuard } from './guards/unauthenticated.guard';
import { PageNotFound } from './layout/page-not-found/page-not-found';
import { AuthenticatedGuard } from './guards';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    /*--------------------------Begin Of Lazy Loading Components-----------------------------*/
    { path: 'home', loadComponent: () => import('./features/home/home').then(c => c.Home) },
    { path: 'about', loadComponent: () => import('./features/about/about').then(c => c.About) },
    {
        path: 'therapists',
        children: [
            { path: '', loadComponent: () => import('./features/therapists/therapist-board/therapist-board').then(c => c.TherapistBoard) },
            { path: 'details/:id', loadComponent: () => import('./features/therapists/therapist-details/therapist-details').then(c => c.TherapistDetails) }
        ]
    },
    { path: 'therapy-types', loadComponent: () => import('./features/therapy-types/therapy-type-board/therapy-type-board').then(c => c.TherapyTypeBoard) },
    {
        path: 'profile', children: [
            { path: '', loadComponent: () => import('./features/profile/profile/profile').then(c => c.Profile), canActivate: [AuthenticatedGuard] },
            { path: 'edit', loadComponent: () => import('./features/profile/profile-edit/profile-edit').then(c => c.ProfileEdit), canActivate: [AuthenticatedGuard] },
        ]
    },
    /*--------------------------End Of Lazy Loading Components-----------------------------*/
    { path: 'login', component: Login, canActivate: [UnauthenticatedGuard] },
    { path: 'register', component: Register, canActivate: [UnauthenticatedGuard] },
    { path: '**', component: PageNotFound },
];
