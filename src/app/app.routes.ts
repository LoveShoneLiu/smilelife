import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    // Keep authenticated users out of the login screen and send them to the work queue.
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    // All field-service work screens must require a valid local session.
    canActivate: [authGuard],
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
];
