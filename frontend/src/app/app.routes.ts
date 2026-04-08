import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/venues', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'venues',
    loadComponent: () => import('./pages/venues/venues.component').then(m => m.VenuesComponent)
  },
  {
    path: 'venues/:id',
    loadComponent: () => import('./pages/venue-detail/venue-detail.component').then(m => m.VenueDetailComponent)
    // canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
    // canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
    // canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/venues/add',
    loadComponent: () => import('./pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
    // canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/venues/edit/:id',
    loadComponent: () => import('./pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
    // canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/venues' }
];
