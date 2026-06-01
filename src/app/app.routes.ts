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
    redirectTo: 'tasks/today',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    redirectTo: 'tasks/today',
    pathMatch: 'full',
  },
  {
    path: 'tasks/detail/:id',
    // Task detail owns status transitions and operational actions for one job.
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/task-detail/task-detail.page').then((m) => m.TaskDetailPage),
  },
  {
    path: 'tasks/:id/check-in',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/check-in/check-in.page').then((m) => m.CheckInPage),
  },
  {
    path: 'tasks/:id/media',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/task-media/task-media.page').then((m) => m.TaskMediaPage),
  },
  {
    path: 'tasks/:id/signature',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/signature/signature.page').then((m) => m.SignaturePage),
  },
  {
    path: 'tasks/:view',
    // All task-board sections require a valid local session.
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/task-board/task-board.page').then((m) => m.TaskBoardPage),
  },
  {
    path: 'folder/:id',
    // All field-service work screens must require a valid local session.
    canActivate: [authGuard],
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
];
