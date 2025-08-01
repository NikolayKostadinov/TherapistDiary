import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AdminGuard, AuthenticatedGuard } from './guards';
import { UnauthenticatedGuard } from './guards/unauthenticated.guard';
import { PageNotFound } from './layout/page-not-found/page-not-found';

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
            { path: 'change-password', loadComponent: () => import('./features/profile/profile-change-password/profile-change-password').then(c => c.ProfileChangePassword), canActivate: [AuthenticatedGuard] }
        ]
    },
    {
        path: 'administration', children: [
            { path: 'users', loadComponent: () => import('./features/admin/user-table/user-table').then(c => c.UserTable), canActivate: [AdminGuard] }
        ]
    },
    {
        path: 'appointment', children: [
            { path: 'my-appointments', loadComponent: () => import('./features/appointment/my-appointments/my-appointments-table/my-appointments-table').then(c => c.MyAppointmentsTable), canActivate: [AuthenticatedGuard] },
            { path: 'create', loadComponent: () => import('./features/appointment/appointment-create/appointment-create').then(c => c.AppointmentCreate), canActivate: [AuthenticatedGuard] }
        ]
    },
    /*--------------------------End Of Lazy Loading Components-----------------------------*/
    { path: 'login', component: Login, canActivate: [UnauthenticatedGuard] },
    { path: 'register', component: Register, canActivate: [UnauthenticatedGuard] },
    { path: '**', component: PageNotFound },
];
