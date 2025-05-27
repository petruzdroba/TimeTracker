import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./components/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES
      ),
    title: 'Dashboard',
    canActivate: [authGuard],
  },
  {
    path: 'timetrack',
    loadChildren: () =>
      import('./components/timer/timer.routes').then((m) => m.TIMER_ROUTES),
    title: 'TimeTrack',
    canActivate: [authGuard],
  },
  {
    path: 'vacationdays',
    loadChildren: () =>
      import('./components/vacation/vacation.routes').then(
        (m) => m.VACATION_ROUTES
      ),
    title: 'VacationDays',
    canActivate: [authGuard],
  },
  {
    path: 'worklog',
    loadChildren: () =>
      import('./components/work-log/work-log.routes').then(
        (m) => m.WORKLOG_ROUTES
      ),
    title: 'Work Log',
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./components/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    title: 'Admin',
    canActivate: [authGuard],
  },
  {
    path: 'leaveslip',
    loadChildren: () =>
      import('./components/leave-slip/leave-slip.routes').then(
        (m) => m.LEAVESLIP_ROUTES
      ),
    title: 'Leave Slips',
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./components/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    title: 'Authentication',
  },
  {
    path: 'error/:code',
    component: ErrorPageComponent,
    title: 'Error',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
